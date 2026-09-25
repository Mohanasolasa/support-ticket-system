require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");
const commentRoutes = require("./routes/comments");
const agentRoutes = require("./routes/agent");


const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/agent", agentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Support Ticket System API is running",
    });
});

if (require.main === module) {
    app.listen(5000, () => {
        console.log("Server running on port 5000");
    });
}

module.exports = app;