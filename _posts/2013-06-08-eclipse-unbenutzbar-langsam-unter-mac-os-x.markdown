---
layout: post
status: publish
published: true
title: Eclipse unbenutzbar langsam unter Mac OS X
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 84
wordpress_url: http://devtopics.de/?p=84
date: '2013-06-08 12:13:07 +0200'
date_gmt: '2013-06-08 10:13:07 +0200'
categories:
- Allgemein
tags: []
comments: []
---
Seit kurzem entwickle ich wieder ein wenig mit Eclipse auf meinem Mac Mini. Mittlerweile ist das aber so extrem langsam, dass ich &nbsp;schon kurz davor war zu verweifeln. Dann habe ich folgenden (naheliegenden) Tip gefunden. Danke an google und&nbsp;http:&#47;&#47;en.newinstance.it&#47;2010&#47;04&#47;15&#47;eclipse-slow-in-osx&#47;!
Einfach die Eclipse.app rechts anklicken und "Paketinhalt zeigen" ausw&auml;hlen. Ein, zwei Ordner tiefer findet ihr die eclipse.ini. Dort die Zeile
-Dosgi.requiredJavaVersion=1.5
auf
-Dosgi.requiredJavaVersion=1.6
stellen. Bei der Gelegenheit gleich noch die Speicherwerte erh&ouml;hen (hab sie mal verdreifacht, hab ja genug RAM :-D) und dann geht eclipse wieder ab wie man es von Windows gewohnt ist.
