const express = require("express");
const { exec } = require("child_process");
const axios = require("axios");

const app = express();
app.use(express.json());

let memory = [];

/* ================= UI ================= */
app.get("/", (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>

<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

<style>

*{box-sizing:border-box;font-family:system-ui}

html,body{
margin:0;
height:100%;
background:#0a0f1a;
color:white;
overflow:hidden;
}

/* TOP BAR */
.top{
position:fixed;
top:0;
left:0;
width:100%;
height:52px;
display:flex;
align-items:center;
justify-content:space-between;
padding:0 14px;
background:#0f172a;
border-bottom:1px solid rgba(255,255,255,0.06);
z-index:1000;
}

.title{
font-weight:600;
color:#4aa3ff;
font-size:15px;
}

.menu{
font-size:26px;
cursor:pointer;
}

/* SIDEBAR */
.sidebar{
position:fixed;
top:0;
left:-240px;
width:210px;
height:100%;
background:#0c1424;
padding-top:60px;
transition:0.25s;
z-index:2000;
border-right:1px solid rgba(255,255,255,0.08);
}

.sidebar a{
display:block;
padding:12px;
font-size:13px;
color:white;
text-decoration:none;
}

.sidebar a:hover{
background:#172554;
}

/* CHAT AREA */
.box{
position:absolute;
top:52px;
bottom:60px;
left:0;
right:0;
padding:12px;
overflow-y:auto;
display:flex;
flex-direction:column;
gap:10px;
}

/* MESSAGE BUBBLES */
.msg{
padding:10px 12px;
border-radius:14px;
font-size:14px;
max-width:78%;
line-height:1.35;
word-wrap:break-word;
white-space:pre-wrap;
}

.user{
background:#2563eb;
align-self:flex-end;
}

.bot{
background:rgba(255,255,255,0.07);
align-self:flex-start;
}

/* INPUT BAR */
.inputBar{
position:fixed;
bottom:0;
left:0;
width:100%;
display:flex;
gap:8px;
padding:10px;
background:#0c1424;
border-top:1px solid rgba(255,255,255,0.06);
z-index:1000;
}

input{
flex:1;
padding:10px;
border-radius:10px;
border:none;
outline:none;
background:#111827;
color:white;
font-size:16px !important;
}

button{
padding:10px 14px;
border:none;
border-radius:10px;
background:#2563eb;
color:white;
cursor:pointer;
}

/* PM2 */
.pm2wrap{
position:absolute;
top:52px;
bottom:0;
left:0;
right:0;
overflow:auto;
padding:12px;
}

.card{
background:#111827;
padding:10px;
border-radius:12px;
margin-bottom:10px;
border:1px solid rgba(255,255,255,0.06);
font-size:12px;
}

.small{
opacity:0.7;
font-size:11px;
}

</style>
</head>

<body>

<div class="top">
<div class="menu" onclick="toggle()">☰</div>
<div class="title">VERTIX AI</div>
</div>

<div class="sidebar" id="bar">
<a onclick="showChat()">💬 Chat</a>
<a onclick="showPM2()">📊 PM2</a>
</div>

<!-- CHAT -->
<div id="chatPage">
<div class="box" id="box"></div>

<div class="inputBar">
<input id="msg" placeholder="Message..." onkeydown="if(event.key==='Enter')send()">
<button onclick="send()">Send</button>
</div>
</div>

<!-- PM2 -->
<div id="pm2Page" class="pm2wrap" style="display:none"></div>

<script>

/* SIDEBAR */
function toggle(){
let b=document.getElementById("bar");
b.style.left = (b.style.left==="0px") ? "-240px" : "0px";
}

/* NAV */
function showChat(){
document.getElementById("chatPage").style.display="block";
document.getElementById("pm2Page").style.display="none";
toggle();
}

function showPM2(){
document.getElementById("chatPage").style.display="none";
document.getElementById("pm2Page").style.display="block";
toggle();

fetch("/pm2")
.then(r=>r.json())
.then(data=>{
let html="";
data.forEach(p=>{
html+=\`
<div class="card">
<b>\${p.name}</b><br>
<div class="small">Status: \${p.pm2_env.status}</div>
<div class="small">CPU: \${p.monit.cpu}%</div>
<div class="small">RAM: \${(p.monit.memory/1024/1024).toFixed(1)} MB</div>
</div>
\`;
});
document.getElementById("pm2Page").innerHTML=html;
});
}

/* CHAT */
function add(text,type){
let d=document.createElement("div");
d.className="msg "+type;
d.innerText=text;
document.getElementById("box").appendChild(d);
document.getElementById("box").scrollTop=999999;
}

function send(){
let m=document.getElementById("msg");
if(!m.value.trim()) return;

add(m.value,"user");

let typing=document.createElement("div");
typing.className="msg bot";
typing.innerText="Vertix is thinking...";
typing.id="typing";
document.getElementById("box").appendChild(typing);

fetch("/ai",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:m.value})
})
.then(r=>r.json())
.then(d=>{
document.getElementById("typing")?.remove();
add(d.reply,"bot");
});

m.value="";
}

</script>

</body>
</html>
`);
});

/* ================= AI ================= */
app.post("/ai", async (req,res)=>{
try{
memory.push({role:"user",content:req.body.message});
if(memory.length>20) memory.shift();

const r=await axios.post(
"https://openrouter.ai/api/v1/chat/completions",
{
model:"openrouter/auto",
messages:memory
},
{
headers:{
Authorization:"Bearer "+process.env.OPENROUTER_KEY,
"Content-Type":"application/json"
}
}
);

let reply=r.data.choices[0].message.content;
memory.push({role:"assistant",content:reply});

res.json({reply});

}catch(e){
res.json({reply:"AI error (check key)"});
}
});

/* ================= PM2 ================= */
app.get("/pm2",(req,res)=>{
exec("pm2 jlist",(err,stdout)=>{
if(err) return res.json([]);
res.json(JSON.parse(stdout));
});
});

app.listen(4000,()=>console.log("VERTIX APP LEVEL RUNNING http://localhost:4000"));
