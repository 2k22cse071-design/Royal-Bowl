const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db'); 

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount REAL,
    payment_method TEXT,
    status TEXT,
    items TEXT,
    customer_name TEXT,
    customer_email TEXT
  );`);

  console.log("✅ transactions table created successfully!");

  db.run(`INSERT INTO transactions (order_id, amount, payment_method, status, items, customer_name, customer_email)
          VALUES ('ORD001', 450, 'Cash', 'Success', '["Chicken Biryani","Juice"]', 'Anu', 'anu@example.com')`);
});

db.close(() => console.log("✅ Database 'data.db' created successfully!"));
