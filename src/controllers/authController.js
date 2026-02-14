const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.login = (req, res) => {
    const { username, password } = req.body;

    console.log(`Login attempt: Username='${username}'`);

    const cleanUsername = (username || "").trim();

    // Check for Admin (Case Insensitive)
    if (cleanUsername.toLowerCase() === 'admin') {
        db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, user) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (!user) return res.status(404).json({ message: "Admin configuration error" });

            const passwordIsValid = bcrypt.compareSync(password, user.password);
            if (!passwordIsValid) {
                return res.status(401).json({ accessToken: null, message: "Invalid Admin Password!" });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });

            res.status(200).json({
                id: user.id,
                username: user.username,
                role: user.role,
                accessToken: token,
            });
        });
    } else {
        // Open access for ANY other input (User/Guest)
        const token = jwt.sign({ id: 'guest_' + Date.now(), role: 'user' }, JWT_SECRET, { expiresIn: 86400 });

        res.status(200).json({
            id: 'guest',
            username: cleanUsername || 'User',
            role: 'user',
            accessToken: token,
        });
    }
};
