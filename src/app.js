const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
    console.log(`[DEBUG] Request: ${req.method} ${req.url}`);
    next();
});

app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    console.log(`[AUTH] Login Attempt: '${username}'`);

    const cleanUser = (username || "").trim();

    if (cleanUser.toLowerCase() === 'admin') {
        db.get("SELECT * FROM users WHERE username = ?", ["admin"], (err, user) => {
            if (err || !user) {
                console.log("[AUTH] Admin check failed (DB/Missing). Login as Guest.");
                return loginAsGuest(res, cleanUser);
            }

            const valid = bcrypt.compareSync(password, user.password);
            if (!valid) {
                console.log("[AUTH] Admin password invalid. Login as Guest.");
                return loginAsGuest(res, cleanUser); // Fallback to Guest!
            }

            const token = jwt.sign({ id: user.id, role: 'admin' }, JWT_SECRET, { expiresIn: 86400 });
            return res.json({ id: user.id, username: 'admin', role: 'admin', accessToken: token });
        });
    }
    else {
        return loginAsGuest(res, cleanUser);
    }
});

function loginAsGuest(res, username) {
    const token = jwt.sign({ id: 'guest_' + Date.now(), role: 'user' }, JWT_SECRET, { expiresIn: 86400 });
    return res.json({
        id: 'guest',
        username: username || 'User',
        role: 'user',
        accessToken: token
    });
}

app.use("/", transactionRoutes);
app.use("/", reportRoutes);
app.use("/contact", contactRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = app;
