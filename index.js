const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

let memory = [];

/* ================= FRONTEND ================= */
app.get("/", (req, res) => {
res.send("VERTIX AI RUNNING");
});

/* ================= AI ROUTE ================= */
app.post("/ai", async (req, res) => {
try {
const userMsg = req.body.message;

memory.push({ role: "user", content: userMsg });
if (memory.length > 20) memory.shift();

const response = await axios.post(
"https://openrouter.ai/api/v1/chat/completions",
{
model: "openrouter/auto",
messages: memory
},
{
headers: {
Authorization: "Bearer " + process.env.OPENROUTER_KEY,
"Content-Type": "application/json"
}
}
);

let reply = response.data.choices[0].message.content;

memory.push({ role: "assistant", content: reply });

res.json({ reply });

} catch (err) {
console.log(err);
res.json({ reply: "AI error (check API key / Railway env)" });
}
});

/* ================= PM2 ================= */
app.get("/pm2", (req, res) => {
const { exec } = require("child_process");

exec("pm2 jlist", (err, stdout) => {
if (err) return res.json([]);
try {
res.json(JSON.parse(stdout));
} catch {
res.json([]);
}
});
});

/* ================= RAILWAY PORT FIX ================= */
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
console.log("VERTIX RUNNING ON " + PORT);
});
