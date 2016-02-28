---
layout: post
status: publish
published: true
title: Klausurergebnisse pr&uuml;fen mit CasperJS,PhantomJS und GeekTool
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 346
wordpress_url: http://devtopics.de/?p=346
date: '2013-09-13 12:40:09 +0200'
date_gmt: '2013-09-13 10:40:09 +0200'
categories:
- Allgemein
- JavaScript
tags:
- Test
- CasperJS
- PhantomJS
- Geek Tool
- Fernuni Hagen
- Hagen
- Fernuni
- Philosophie
- Philosophy
- Klausur
comments:
- id: 156
  author: Alexander Sch&auml;l via Facebook
  author_email: 687560252@facebook.com
  author_url: http://www.facebook.com/profile.php?id=687560252
  date: '2013-09-13 13:53:47 +0200'
  date_gmt: '2013-09-13 11:53:47 +0200'
  content: Geek!
- id: 157
  author: Daniel Paulus via Facebook
  author_email: 522585866@facebook.com
  author_url: http://www.facebook.com/profile.php?id=522585866
  date: '2013-09-13 14:59:41 +0200'
  date_gmt: '2013-09-13 12:59:41 +0200'
  content: Schau dir meine Windows Implementierung von Geek Tool mit Powershell an
    :-) Damit kann man sowas auch aufm Windows Desktop benutzen *yey*
- id: 158
  author: Alexander Sch&auml;l via Facebook
  author_email: 687560252@facebook.com
  author_url: http://www.facebook.com/profile.php?id=687560252
  date: '2013-09-13 17:51:08 +0200'
  date_gmt: '2013-09-13 15:51:08 +0200'
  content: "'geeklet'-f&auml;hig?! ;)"
- id: 205
  author: enivpuhaob
  author_email: ovuliqwk@akmaila.org
  author_url: http://online-zoloft-cheapestprice.com/
  date: '2015-04-02 14:37:03 +0200'
  date_gmt: '2015-04-02 12:37:03 +0200'
  content: '[url=http:&#47;&#47;genericpropecia-finasteride.net&#47;]Propecia Online[&#47;url]
    Ventolin Hfa
    http:&#47;&#47;online-zoloft-cheapestprice.com&#47;'
- id: 255
  author: double loft bunk beds uk
  author_email: luciachavez@gmail.com
  author_url: https://flipboard.com/@leifdennis/cool-loft-beds-for-adults-a4g3j3iey
  date: '2015-05-20 06:55:37 +0200'
  date_gmt: '2015-05-20 04:55:37 +0200'
  content: Informative article, just what I was looking for.
- id: 257
  author: Garcinia Lean xtreme
  author_email: lorenzahailes@yahoo.de
  author_url: http://vrhelp.com/?option=com_k2&amp;view=itemlist&amp;task=user&amp;id=115746
  date: '2015-05-30 06:42:23 +0200'
  date_gmt: '2015-05-30 04:42:23 +0200'
  content: "Hey there, You've done a fantastic job. I'll certainly digg it and personally
    \r\nsuggest to my friends. I am sure they'll be benefited from this website."
- id: 258
  author: The Easy life
  author_email: keenangreenhalgh@googlemail.com
  author_url: http://geremiapools.com/?option=com_k2&amp;view=itemlist&amp;task=user&amp;id=265546
  date: '2015-06-01 13:05:36 +0200'
  date_gmt: '2015-06-01 11:05:36 +0200'
  content: "Do you have a spam problem on this blog; I also \r\nam a blogger, and
    I was curious about your situation; we have \r\ndeveloped some nice procedures
    and we are looking to trade solutions \r\nwith other folks, be sure to shoot me
    an email if interested."
- id: 260
  author: True Garcinia cambogia
  author_email: charmainwills@googlemail.com
  author_url: http://www.sudroutage.fr/?option=com_k2&amp;view=itemlist&amp;task=user&amp;id=51491
  date: '2015-06-02 00:21:30 +0200'
  date_gmt: '2015-06-01 22:21:30 +0200'
  content: Appreciate this post. Let me try it out.
---
Ich habe gerade meine Philosophieklausur geschrieben und bin mal wieder wahnsinnig neugierig wie das Ergebnis wohl sein wird. Da ich nicht auf Email vertraue :-D muss ich nat&uuml;rlich unbedingt regelm&auml;&szlig;ig pr&uuml;fen ob die Ergebnisse schon da sind. Da ein echter Geek alles was mehr als zweimal passiert automatisiert frei nach dem Motto:
Au&szlig;erdem ist dies eine recht g&uuml;nstige M&ouml;glichkeit mal PhantomJS auszuprobieren dachte ich. Zuerst wollte ich Selenium nutzen aber, dass war dann zuviel Overhead wie ich fand. Au&szlig;erdem habe ich grad eine gewisse Vorliebe f&uuml;r JavaScript entwickelt :-)
Nach meinen ersten Gehversuchen mit PhantomJS merkte ich, dass die keine Promises unterst&uuml;tzen! Man endet letztlich in einer katastrophalen Callbackh&ouml;lle und das Programmieren einfacher Abl&auml;ufe macht &uuml;berhaupt keinen Spa&szlig; mehr. Zum Gl&uuml;ck gibt es CasperJS! Das ist ein Wrapper um PhantomJS der eben Promises anbietet um Abl&auml;ufe besser coden zu k&ouml;nnen.vSelten freut man sich &uuml;ber das W&ouml;rtchen "then" so sehr ^^
Schauen wir uns also mal fix den Code an!
var spawn = require("child_process").spawn;
var casper = require(&#039;casper&#039;).create();
var login_url=&#039;https:&#47;&#47;pos.fernuni-hagen.de&#47;qisserver&#47;rds?state=user&amp;type=0&#039;;
casper.myProc=spawn;
casper.userAgent(&#039;Mozilla&#47;4.0 (compatible; MSIE 6.0; Windows NT 5.1)&#039;);
casper.echo1=casper.echo;
casper.echo=function(){};
&#47;&#47; print out all the messages in the headless browser context
casper.on(&#039;remote.message&#039;, function(msg) {
    this.echo(&#039;remote message caught: &#039; + msg);
});
&#47;&#47; print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
    this.echo("Page Error: " + msg, "ERROR");
});
&#47;&#47;print url changes to console
casper.on("url.changed", function(url){
	this.echo("--------");
	this.echo("urlchange:"+url);
	this.echo("--------");
});
casper.start(login_url, function() {
	&#47;&#47;manual submit because caspers built in does not work
	&#47;&#47;im guessing its because the submit buttons name is "submit".
	&#47;&#47;this causes some issues with phantomJS and should be avoided
	this.evaluate(function() {
                document.getElementById(&#039;asdf&#039;).value="matrikelnummer";
                document.getElementById(&#039;fdsa&#039;).value="passwort";
                &#47;&#47;workaround needed when the submit buttons name is "submit"
                &#47;&#47;for some reason phantomJS has a problem with that
                var button=document.getElementsByClassName("submit")[0];
                button.name="daniel";
                document.forms[0].submit();
    });
});
casper.then(function(){
	this.click(&#039;.auflistung:nth-of-type(1)&#039;);
});
casper.then(function(){
&#47;&#47;var link=this.getElementInfo(&#039;ul.liste li:nth-child(3) a&#039;);
&#47;&#47;this.echo("tha link:"+link.tag);
	this.click(&#039;ul.liste li:nth-child(3) a&#039;);
});
casper.then(function(){
	this.click(&#039;li.treelist:nth-child(2) a&#039;);
});
casper.then(function(){
	this.capture(".&#47;ergebnisse.png");
	this.captureSelector(&#039;table.png&#039;, &#039;form&#039;);
});
casper.then(function(){
	var selector=&#039;table:nth-child(5)&#039;;
	var infotag=this.getElementInfo(selector).tag;
	var contains= infotag.indexOf("09.09.2013");
	if (contains!=-1){
	casper.echo1("Results are there");
		&#47;&#47;var child1 = this.myProc(&#039;open&#039;,[ "-a","Safari","&#47;Users&#47;danielpaulus&#47;notencheck&#47;c&#47;ergebnisse.png"]);
		&#47;&#47;var child = this.myProc("say",["results are there"]);
		}else{
		casper.echo1("Results are not there");
				&#47;&#47;var child = this.myProc("say",["results are not there"]);
			}
});
casper.run(function(){
&#47;&#47;wait for processes to complete
setTimeout(function(){casper.exit();}, 500);
});
Das Skript macht letztlich nichts anderes als sich in den Hochschulbereich einzuloggen, zwei mal weiter zu klicken und zu schauen ob es einen Eintrag f&uuml;r das Klausurdatum gibt. Die casper.start() funktion f&uuml;hrt den Post manuell aus. Das ist ein kleines Problem, der submit button auf der Seite hei&szlig;t per namens attribut ebenfalls submit. Das macht probleme mit der von PhantomJS eingebauten submit funktion. Daher musste ich das manuell machen und den button umbenennen. Der neue Name ist eh viel besser :-)
-- PhantomJS has a Problem when the submit button's name attribut is submit.--
Danach wird &uuml;ber CSS3 Selektoren flei&szlig;ig voran geklickt. Hervorzuheben ist hier die coole M&ouml;glichkeit von der gesamten Seite oder von einzelnen DOM Elementen Screenshots zu machen!! Sehr awesome!
Am Ende sehen wir noch wie ich einen ChildProcess nutze. Urspr&uuml;nglich wollte ich MacOS eingebautes say programm nutzen um mir st&uuml;ndlich per Stimme sagen zu lassen ob die Ergebnisse da sind oder nicht und im positiven Fall Safari mit einem Bild der Ergebnis&uuml;bersicht &ouml;ffnen zu lassen. Das fand ich dann aber bl&ouml;d. Daher, Geek Tool to the rescue!
Geek Tool runterladen und installieren und das ganze auf den Desktop rendern. Und finally it was done. Zus&auml;tzlich habe ich das Bild &nbsp;von
this.captureSelector(&#039;table.png&#039;, &#039;form&#039;);
Ebenfalls per Geek Tool auf den Desktop gesetzt. Weil Geek Tool ja jeglichen Konsoleninhalt auf den Desktop rendert, musste ich noch s&auml;mtlichen Log-Output abschalten. Coolerweise kann man das mit JavaScript immer ganz einfach in dem man einfach die jeweilige Log-Funktion &uuml;berscheibt :-D Ja es ist sehr hacky aber ich find's immer wieder witzig ^^
&#47;&#47;Meine Log Funktion
casper.echo1=casper.echo;
&#47;&#47;Log mal flei&szlig;ig ins nix restliche Code *hrhr*
casper.echo=function(){};
Das war's :-)

