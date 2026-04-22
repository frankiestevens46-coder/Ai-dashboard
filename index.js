const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("VERTIX AI RUNNING");
});

app.post("/ai", async (req, res) => {
  try {
    const key = process.env.OPENROUTER_KEY;

    if (!key) {
      return res.json({ reply: "Missing OPENROUTER_KEY in Railway Variables" });
    }

    const r = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/auto",
        messages: [{ role: "user", content: req.body.message }]
      },
      {
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: r.data.choices[0].message.content });

  } catch (e) {
    console.log(e.message);
    res.json({ reply: "AI error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("VERTIX RUNNING ON " + PORT);
});
