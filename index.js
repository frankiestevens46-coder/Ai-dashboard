const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("WORKING");
});

app.get("/ping", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("RUNNING ON " + PORT);
});
