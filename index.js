const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("VERTIX ONLINE");
});

app.get("/ping", (req, res) => {
  res.send("OK");
});

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON " + PORT);
});
