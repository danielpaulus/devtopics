---
layout: post
status: publish
published: true
title: NodeJS for Realtime web apps
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 312
wordpress_url: http://devtopics.de/?p=312
date: '2013-07-31 11:29:18 +0200'
date_gmt: '2013-07-31 09:29:18 +0200'
categories:
- Allgemein
- JavaScript
tags:
- javascript
- nodejs
- node
- express
- expressjs
- socket.io
comments: []
---
Hi I am currently investigating in using NodeJS for a real time web app. It seems like a good choice to me for performance reasons and mainly because i can code backend and frontend in the same language. This should lower the learning curve for new developers significantly.
I basically followed this guide to install nodeJS:&nbsp;http:&#47;&#47;expressjs.com&#47;guide.html
Here are the steps I had to take for the long way to a running nodeJS server:

Download&nbsp;and install nodeJS
Open a cmd and
cd\
md nodetest
cd nodetest

This step is only for people behind a company proxy (like me). You'll have to configure npm to use your proxy using the following commands:
npm config set proxy http:&#47;&#47;user:pass@ip:port
npm config set proxy-https https:&#47;&#47;user:pass@ip:port

use &nbsp;"npm info socket.io version" and "npm info express version" to find out the latest versions
Create the following file called package.json in the nodetest folder
{
  "name": "hello-world",
  "description": "hello world test app",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "express": "3.3.4",
	"socket.io":"0.9.16"
  }
}

Run npm install
Now you should have the expressJS and socket.io libraries in a folder "node_modules". Next you'll have to create a folder called "public" in your nodetest directory.
Now copy the contents of &nbsp;&nbsp;C:\nodetest\node_modules\socket.io\node_modules\socket.io-client\dist &nbsp;to&nbsp;C:\nodetest\public\socket.io &nbsp; &nbsp;(obvious step, right?)
Create server.js in the nodetest directory and sender.html, client.html in the public directory.
get jquery and jquery ui and copy them into the public directory
Fill server.js, sender.html, client.html with the code later on the page
open the htmls in a browser and enjoy. (remember, my code uses port 8080 by default)

&nbsp;
server.js:
var express = require(&#039;express&#039;);
var app = express();
var path = require(&#039;path&#039;);
var server = require(&#039;http&#039;).createServer(app);
var io = require(&#039;socket.io&#039;).listen(server);
&#47;&#47;this caused me some nightmares
server.listen(8080);
app.get(&#039;&#47;&#039;, function (req, res) {
  res.sendfile(__dirname + &#039;&#47;index.html&#039;);
});
app.configure(function(){
  app.use(express.static(path.join(__dirname, &#039;public&#039;)));
});
&#47;&#47; note that i force socket.io to fall back on long polling
&#47;&#47;for reliability reasons
io.configure(function () {
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);
});
io.sockets.on(&#039;connection&#039;, function (socket) {
  socket.emit(&#039;news&#039;, { hello: &#039;world&#039; });
  &#47;&#47;this is my custom event
  socket.on(&#039;my other event&#039;, function (data) {
    console.log(data);
   &#47;&#47;whenever someone uses sender.html to send something, this line will
   &#47;&#47;broadcast it to everyone else except the original sender
	socket.broadcast.emit(&#039;my other event&#039;,data);
  });
});
The comment above the server.listen command indicates that I had some problems with expressJs. It seems that when you use app.listen() instead of server.listen() you get a weird problem. I did not take the time to shed light on the cause of the problem but what happens is that you get a HTTP 404 on socket.io 's URL in you browser side scripts.
Socket.io s URL looks something like this:
http:&#47;&#47;IP:8080&#47;socket.io&#47;1&#47;?t=1375254151901
So if you get a HTTP 404 on this, then using server.listen() might be the solution to your problem :-)
Finally here is my very simple sender.html code:

data:
test


	
	
Senden
message:
	
  var host= window.location.host;
console.log(&#039;hostname:&#039;+host);
  var socket = io.connect(&#039;http:&#47;&#47;&#039;+host,{transports: [&#039;xhr-polling&#039;]});
  &#47;*tell me when you connect
  *the way this works is that your callback gets called whenever
  *the socket receives a &#039;connect&#039; event.
  *&#47;
  socket.on(&#039;connect&#039;, function(client){
  console.log(&#039;connected&#039;);
  });
  &#47;*
  *Ths is taken from one of the examples.
  *&#47;
  socket.on(&#039;news&#039;, function (data) {
    console.log(data);
	 var div = document.getElementById(&#039;data&#039;);
	 div.innerHTML=data;
&#47;&#47;emit sends custom events
    socket.emit(&#039;my other event&#039;, { my: &#039;data&#039; });
  });
  &#47;&#47;use jquery ui to make a button
  $( "#button" ).button().click(function(){
  var text= $(&#039;#message&#039;).val();
  if (text=== undefined || text==="") {text="null";}
  console.log(&#039;sending:&#039;+text);
  &#47;*send whatever text someone entered to the server first
  *The server will take care of broadcasting this for us.
  *&#47;
  socket.emit(&#039;my other event&#039;, { my: text });
  });



And last but not least the simple client.html file. It does not even use jQuery just yet :-)

data:
test


var host= window.location.host;
console.log(&#039;hostname:&#039;+host);
  var socket = io.connect(&#039;http:&#47;&#47;&#039;+host,{transports: [&#039;xhr-polling&#039;]});
  socket.on(&#039;news&#039;, function (data) {
    console.log(data);
	 var div = document.getElementById(&#039;data&#039;);
	 div.innerHTML=data;
  });
  &#47;&#47;whenever you receive something just display it in a div
  socket.on(&#039;my other event&#039;, function (data) {
  console.log(data);
  var div = document.getElementById(&#039;data&#039;);
	 div.innerHTML=data.my;
  });



