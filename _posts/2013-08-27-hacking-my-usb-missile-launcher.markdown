---
layout: post
status: publish
published: true
title: Hacking my USB missile launcher
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 210
wordpress_url: http://devtopics.de/?p=210
date: '2013-08-27 10:24:26 +0200'
date_gmt: '2013-08-27 08:24:26 +0200'
categories:
- Allgemein
tags:
- C#
- http:&#47;&#47;www.dreamcheeky.com
- dreamcheeky
- usb missile launcher
- reverse engineering
- linux
- mono
- hidapi
comments: []
---
My colleagues at work got me this awesome USB Missile Launcher for my birthday. You can get Windows drivers from here: http:&#47;&#47;www.dreamcheeky.com&#47;thunder-missile-launcher
Windows drivers only? Srsly? I didnt think so! I wanted to control this using my Nexus4 so following up is how I've been able to do that using Mono and my Linux box. The idea being to later deploy everything on my raspberry pi :-)
-- Stop talking and give me the source! https:&#47;&#47;github.com&#47;danielpaulus&#47;thunder --
By checking the windows device manager I found out that the USB Launcher is simply a HID Device. I found the dll file and guess what? The DLL is simply a .net assembly. That makes reverse engineering really simple as you can just use ILSpy to decompile it to source code "yeah". Otherwise I would have needed to use some kind of USB Sniffer like Usblyzer.
OK now I need mono and some kind of HID library for Linux. First i tried libusbdotnet:&nbsp;http:&#47;&#47;libusbdotnet.sourceforge.net&#47;V2&#47;Index.html.
I had to:&nbsp;sudo apt-get install libusb-dev-1.0 and then the binary package would work with:&nbsp;sudo mono Test_Info.exe - awesome! All this assuming monodevelop is already installed of course.&nbsp;
Unfortunately libusb did not do for me because it does not have native support for HID devices and I was not able to send anything tomy launcher. So after some time of&nbsp;hating life a bit and libusbdotnet having -1 ErrorIOs throwing at me, I found out about hidapi: https:&#47;&#47;github.com&#47;signal11&#47;hidapi &nbsp;Using this library i could send the LED on message using the HIDAPI Test Tool and booyah! the LED lit up!
I had to download source package for building HIDAPI into a shared library on Unix Platforms:
--prefix=&#47;usr
		Specify where you want the output headers and libraries to
		be installed. The example above will put the headers in
		&#47;usr&#47;include and the binaries in &#47;usr&#47;lib. The default is to
		install into &#47;usr&#47;local which is fine on most systems.
1. run .&#47;configure
I had to install autoreconf first because of the following error:
ganjalf@ganjalf-ubuntu:~&#47;missile-hidapi&#47;hidapi-master$ .&#47;bootstrap + autoreconf --install --verbose --force .&#47;bootstrap: 2: .&#47;bootstrap: autoreconf: not found
with : sudo apt-get install dh-autoreconf
Then continue with:
2. .&#47;configure
3. make
4. sudo make install
Now everything worked and told me that:
Libraries have been installed in: &#47;usr&#47;local&#47;lib
Alright, now the only thing left to do was interoping from monodevelop with my new native library. I did that using the great tutorial on:
http:&#47;&#47;www.mono-project.com&#47;Interop_with_Native_Libraries
Of course I could have simplycoded everything in C and spare me the native interop. But I kind of am a C#&#47;Java guy and native interop sounded like something interesting to do :-)
Finally I wanted to expose launcher controls as a webservice:&nbsp;http:&#47;&#47;www.progware.org&#47;Blog&#47;post&#47;A-simple-REST-service-in-C.aspx

The USB Launcher. I attached an Eye Toy Camera to it for targeting. I wrote an Android app to control it and streamed video from the old playstation eye toy via an mjpg server. It's pretty cool now :-) 
