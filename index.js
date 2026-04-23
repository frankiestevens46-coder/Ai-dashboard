const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("VERTIX WORKING");
});

app.get("/ping", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("VERTIX RUNNING ON " + PORT);
});
