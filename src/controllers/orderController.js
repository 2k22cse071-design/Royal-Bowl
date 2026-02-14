const db = require("../config/db");

exports.placeOrder = (req, res) => {
    const { customer_name, customer_phone, items, total_amount, address, coordinates } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items in order" });
    }

    // Transaction logic (manual as sqlite support varies, but single file helps)
    db.serialize(() => {
        // 1. Create Order
        db.run(
            "INSERT INTO orders (customer_name, customer_phone, total_amount, address, coordinates) VALUES (?, ?, ?, ?, ?)",
            [customer_name, customer_phone, total_amount, address, JSON.stringify(coordinates)],
            function (err) {
                if (err) {
                    console.error("Order creation failed:", err);
                    return res.status(500).json({ error: "Failed to create order" });
                }

                const orderId = this.lastID;

                // 2. Insert Order Items
                const stmt = db.prepare("INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)");

                items.forEach(item => {
                    // item structure: { name, quantity, price }
                    stmt.run(orderId, item.name, item.quantity, item.price);
                });

                stmt.finalize();

                res.status(201).json({ message: "Order placed successfully!", orderId });
            }
        );
    });
};

exports.getAllOrders = (req, res) => {
    // Basic fetch, in production we would optimize with joins if needed or pagination
    const query = `
        SELECT o.id, o.customer_name, o.total_amount, o.status, o.created_at,
        (SELECT json_group_array(json_object('name', oi.item_name, 'qty', oi.quantity)) 
         FROM order_items oi WHERE oi.order_id = o.id) as items
        FROM orders o 
        ORDER BY o.created_at DESC
    `;

    // SQLite JSON extension might not be enabled by default in all envs. 
    // Fallback: fetch orders then fetch items? 
    // Let's stick to simple fetch of orders first for MVP list.

    const simpleQuery = "SELECT * FROM orders ORDER BY created_at DESC";

    db.all(simpleQuery, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Fetch error" });
        }
        res.json(rows);
    });
};

exports.updateOrderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Update failed" });
        }
        res.json({ message: "Order updated" });
    });
};

exports.getOrderDetails = (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM orders WHERE id = ?", [id], (err, order) => {
        if (err || !order) return res.status(404).json({ message: "Order not found" });

        db.all("SELECT * FROM order_items WHERE order_id = ?", [id], (err, items) => {
            if (err) return res.status(500).json({ message: "Error fetching items" });
            res.json({ ...order, items });
        });
    });
};
