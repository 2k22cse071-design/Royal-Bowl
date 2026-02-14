const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs"); // To hash password if we auto-create

require("dotenv").config();

const dbPath = process.env.DB_PATH || "./data.db";
const db = new sqlite3.Database(dbPath);

// Initialize DB tables
db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      amount REAL,
      description TEXT,
      type TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      image TEXT,
      category TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_phone TEXT,
      address TEXT,
      coordinates TEXT,
      total_amount REAL,
      status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_name TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `);

  // Create default admin user if not exists
  db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, row) => {
    if (!row) {
      const password = "admin"; // Default password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["admin", hash, "admin"]);
      console.log("Default admin user created: admin/admin");
    }
  });

  // Create default regular user for testing
  db.get("SELECT * FROM users WHERE username = ?", ["user"], (err, row) => {
    if (!row) {
      const password = "password";
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["user", hash, "user"]);
      console.log("Default regular user created: user/password");
    }
  });

  // Seed some menu items if empty (optional, for demo)
  db.get("SELECT count(*) as count FROM menu_items", (err, row) => {
    if (row && row.count === 0) {
      const items = [
        { name: "Chicken Biryani", price: 250, description: "Classic Hyderabadi style", category: "Main Course", image: "BIRIYANI2.webp" },
        { name: "Dragon Chicken", price: 220, description: "Spicy indo-chinese starter", category: "Starter", image: "Dragon-Chicken-.jpg" },
        { name: "Shawarma", price: 120, description: "Juicy chicken wrap", category: "Snack", image: "shawarma.jpg" },
        { name: "Fruit Salad", price: 100, description: "Fresh seasonal fruits", category: "Dessert", image: "bowl-fruit-salad.avif" },
        { name: "Mojito", price: 80, description: "Refreshing mint lime drink", category: "Beverage", image: "mojito.png" }
      ];

      const stmt = db.prepare("INSERT INTO menu_items (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)");
      items.forEach(item => {
        stmt.run(item.name, item.price, item.description, item.category, item.image);
      });
      stmt.finalize();
      console.log("Seeded basic menu items");
    }
  });

});

module.exports = db;
