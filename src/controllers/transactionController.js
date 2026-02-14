const db = require("../config/db");

exports.addTransaction = (req, res) => {
    const { date, amount, description, type } = req.body;

    if (!date || !amount || !description || !type) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const query = "INSERT INTO transactions (date, amount, description, type) VALUES (?, ?, ?, ?)";
    db.run(query, [date, amount, description, type], function (err) {
        if (err) {
            console.error("Error adding transaction:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, id: this.lastID });
    });
};

exports.getTransactions = (req, res) => {
    const type = req.query.type;
    let query = "";

    // Basic flexible filtering if extended later
    if (type === "weekly") {
        query = `SELECT * FROM transactions WHERE date >= date('now', '-7 days')`;
    } else if (type === "monthly") {
        query = `SELECT * FROM transactions WHERE date >= date('now', '-1 month')`;
    } else if (type === "yearly") {
        query = `SELECT * FROM transactions WHERE date >= date('now', '-1 year')`;
    } else {
        query = "SELECT * FROM transactions ORDER BY date DESC";
    }

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching transactions:", err);
            return res.status(500).json([]);
        }
        res.json(rows);
    });
};
