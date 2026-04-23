const express = require("express");
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
body{margin:0;font-family:system-ui;background:#0a0f1a;color:white}
.box{padding:10px}
.msg{padding:10px;margin:5px;border-radius:10px;max-width:80%}
.user{background:#2563eb;margin-left:auto}
.bot{background:#1f2937}
input{width:80%;padding:10px}
button{padding:10px}
</style>
</head>
<body>

<div class="box" id="chat"></div>

<input id="msg" placeholder="Message...">
<button onclick="send()">Send</button>

<script>
function add(text,type){
let d=document.createElement("div");
d.className="msg "+type;
d.innerText=text;
document.getElementById("chat").appendChild(d);
}

function send(){
let m=document.getElementById("msg");
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
res.json({ reply: "AI route restored (add API key next)" });
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
console.log("VERTIX RUNNING ON " + PORT);
});
