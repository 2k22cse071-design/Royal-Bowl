const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

const sampleData = [
  { date: '2025-11-01', amount: 200, description: 'Tea powder', type: 'Expense' },
  { date: '2025-11-02', amount: 500, description: 'Catering advance', type: 'Income' },
  { date: '2025-11-03', amount: 150, description: 'Milk', type: 'Expense' },
  { date: '2025-11-04', amount: 250, description: 'Groceries', type: 'Expense' },
  { date: '2025-11-05', amount: 1200, description: 'Event payment', type: 'Income' }
];

sampleData.forEach(item => {
  db.run(
    `INSERT INTO transactions (date, amount, description, type) VALUES (?, ?, ?, ?)`,
    [item.date, item.amount, item.description, item.type],
    err => {
      if (err) console.error('Error inserting:', err);
    }
  );
});

db.close();
console.log("Sample transactions inserted successfully!");
