const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

let memory = [];

app.get("/", (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VERTIX AI</title>
<style>
body{margin:0;font-family:system-ui;background:#0a0f1a;color:white;overflow:hidden}
.top{padding:10px;background:#111827;text-align:center;font-weight:bold}
.box{padding:10px;height:80vh;overflow:auto}
.msg{padding:10px;margin:6px;border-radius:10px;max-width:80%}
.user{background:#2563eb;margin-left:auto}
.bot{background:#1f2937}
.input{position:fixed;bottom:0;width:100%;display:flex}
input{flex:1;padding:12px;border:none}
button{padding:12px;border:none;background:#2563eb;color:white}
</style>
</head>
<body>

<div class="top">VERTIX AI</div>

<div class="box" id="chat"></div>

<div class="input">
<input id="msg" placeholder="Message...">
<button onclick="send()">Send</button>
</div>

<script>
function add(t,c){
let d=document.createElement("div");
d.className="msg "+c;
d.innerText=t;
document.getElementById("chat").appendChild(d);
}

function send(){
let m=document.getElementById("msg");
if(!m.value) return;

add(m.value,"user");

fetch("/ai",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:m.value})
})
.then(r=>r.json())
.then(d=>add(d.reply,"bot"));

m.value="";
}
</script>

</body>
</html>
`);
});

app.post("/ai", async (req, res) => {
try {
const userMsg = req.body.message;

memory.push({ role: "user", content: userMsg });
if (memory.length > 20) memory.shift();

const r = await axios.post(
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

let reply = r.data.choices[0].message.content;

memory.push({ role: "assistant", content: reply });

res.json({ reply });

} catch (e) {
console.log(e);
res.json({ reply: "AI error (check API key in Railway variables)" });
}
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
console.log("VERTIX RUNNING ON " + PORT);
});

app.get("/envcheck", (req, res) => {
  res.json({
    port: process.env.PORT,
    openrouter_key: process.env.OPENROUTER_KEY ? "SET" : "MISSING"
  });
});
