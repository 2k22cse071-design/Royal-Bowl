const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

const columnsToAdd = [
    { name: 'customer_name', def: 'TEXT' },
    { name: 'customer_phone', def: 'TEXT' },
    { name: 'address', def: 'TEXT' },
    { name: 'coordinates', def: 'TEXT' },
    { name: 'total_amount', def: 'REAL' },
    { name: 'status', def: "TEXT DEFAULT 'Pending'" },
    { name: 'created_at', def: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
];

db.serialize(() => {
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
  `, (err) => {
        if (err) console.error('Create orders table error:', err.message);
        else console.log('orders table ensured.');
    });

    columnsToAdd.forEach(col => {
        db.run(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.def}`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column')) {
                    console.log(`  Column '${col.name}' already exists — skipping.`);
                } else {
                    console.error(`  Error adding '${col.name}':`, err.message);
                }
            } else {
                console.log(`  Added column '${col.name}' successfully.`);
            }
        });
    });

    db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      item_name TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `, (err) => {
        if (err) console.error('Create order_items error:', err.message);
        else console.log('order_items table ensured.');
    });

    setTimeout(() => {
        db.all('PRAGMA table_info(orders)', (err, rows) => {
            console.log('\nFinal orders table columns:');
            rows.forEach(r => console.log(`  - ${r.name} (${r.type})`));
            db.close(() => console.log('\nMigration complete.'));
        });
    }, 500);
});
