const db = require("../config/db");

exports.getWeeklyReport = (req, res) => {
    const query = `
    SELECT strftime('%W', date) AS week, SUM(amount) AS total
    FROM transactions
    GROUP BY week
    ORDER BY week DESC;
  `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error generating weekly report:", err);
            return res.status(500).json({ success: false });
        }
        res.json(rows);
    });
};

exports.getMonthlyReport = (req, res) => {
    const query = `
    SELECT strftime('%m', date) AS month, SUM(amount) AS total
    FROM transactions
    GROUP BY month
    ORDER BY month DESC;
  `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error generating monthly report:", err);
            return res.status(500).json({ success: false });
        }
        res.json(rows);
    });
};

exports.getYearlyReport = (req, res) => {
    const query = `
    SELECT strftime('%Y', date) AS year, SUM(amount) AS total
    FROM transactions
    GROUP BY year
    ORDER BY year DESC;
  `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error generating yearly report:", err);
            return res.status(500).json({ success: false });
        }
        res.json(rows);
    });
};
