---
layout: post
status: publish
published: true
title: Geek Tool for Windows using Powershell and embedded C#
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 357
wordpress_url: http://devtopics.de/?p=357
date: '2013-09-13 14:16:56 +0200'
date_gmt: '2013-09-13 12:16:56 +0200'
categories:
- Allgemein
- C#
- Powershell
tags:
- C#
- Powershell
- GeekTool
- Windows
- FuckingAwesome
- Geek Tool for Windows
comments: []
---
0. What is this?
Some of you might know the awesome Geek Tool for MacOSX. It's basically a programm to render console output to your desktop using different fonts, transparency etc. etc. I always wanted to have something like it for Windows but could never find anything useful. So I implemented it using C#. C#? Doesn't the title indicate Powershell?? Yeah it does. I used Powershell's awesome capability to compile and run embedded C# code! (How awesome is this!?)
Why did I use Powershell instead of just compiling C#? Well, 2 reasons really:
1. I did learn Powershell at the time
2. It's awesome to just run a script and get this awesome kind of functionality :-)
0a. Your explanation is too much techno babble
Just post a comment, I'll be happy to help :-)
1. Installation
First get the files

geek-widget.ps1
geek-settings.xml

from the zip file here:&nbsp;geekwidget
Then make sure Powershell is activated and scripts are enabled.
2. Usage
Before I explain how you use this awesome tool, read this little problem and be warned:
You cannot put widgets behind Desktop Icons. This is a limitation of Windows itself because the icons are on a window themselves that is in the background. You cannot put custom windows behind them no matter what you do. The only way to circumvent this would be to render stuff directly to the desktop's backgroundimage. This of course can be done but dude.. ^^
Also &nbsp;Important: This is a little learning project,it is reliable for its purpose but it does not check for the following things

Stupid Scripts invoking GUI or the like will cause disaster
Do NOT drag the Script itself on a geeklet
If the script files the geeklets run, the script won't start. just edit the xml file

2.1 Configuration
I did not create GUI Support for configuration. So please just edit the&nbsp;geek-settings.xml file if you want to customize your geeklets appearance. If you want another Geeklet to appear, just copy everything from and including  to  and paste it directly after the last  Tag. Then change the ID value to anything unique. In this case, 1 would be a good idea :-) You do not need to change position or size here as you can drag around the geeklet once it's running. Also you don't have to set a scriptfile because you can just drag drop one to the geeklet later. &nbsp;Just customize Colors and Font settings here. The RefreshInterval tells the program the interval to rerun the script and rerender the ouput in milliseconds. SO in this case, every 5 seconds the script will be run and the results rendered to your desktop. Also note FadeWhenMouseLeaves, this will make the geeklet transparent once the mouse leaves it. &nbsp;PositionAndSizeCanBeChanged .. yeah figure it out for yourself ;-)


  
    0
    676
    73
    584
    580
    #00ff00
    #000000
    5000
    default
    TRUE
    Arial
    8
    TRUE
  

2.2 Finally, can we run a script now?!
&nbsp;
Yeah alright! Right-Click the geek-widget.ps1 file and choose "run with powershell". Then you should see something like this somewhere on your desktop:

Now create a demo script&nbsp;using your favorite Texteditor or the Powershell ISE (I called it test.ps1 but that does not matter):
get-eventlog -logname application -newest 20 | out-string
Note that you should &nbsp;pipe your output to out-string otherwise you might not get the output you were expecting but you can figure out why for yourself :-) This way you can put any possible String a Powershell Script can generate on your desktop in one or as many widgetwindows as you like. Then

&nbsp;Drag it from your Explorer to the widget. Voila! See the eventlog with 5second refresh interval in all its glory on your desktop:

Leave the mouse cursor on top of the widget for a little while and it becomes active
The drag it around as you wish
Double Click the Widget to close but not delete it (use xml file to delete)
All changes are automatically saved in the xml file

Remember, all the code does is put the text on your desktop in your desired font! How you format it is up to you.
3. How's it work dude?
I am only going to explain the Powershell part of things here. If you are interested in the C# Code, just comment and I will explain that in a different post :-)
The code is rather simple, the comments should explain most of the stuff that's going on. The actual magic is done using the
Add-Type
CMDlet. With it i can load and compile my code and all required assemblies. Wow that sure was easy.
[HelloWorld.Program]::Main($arr);
This is the way to invoke static methods on classes using Powershell. HelloWorld is my class (no comment!) and Main of course is the entry point to my program. That's it for today, enjoy :-)
$main=@" c# code"
$form1=@"also c# code"
$debug=$false
   #needed to start powershell in single thread STA mode
   #GUIs have to be singlethreaded and Powershell starts in MTA mode per default
   if ([threading.thread]::CurrentThread.GetApartmentState() -eq "MTA" -and (-not $debug)) {
    #&amp; $env:SystemRoot\system32\WindowsPowerShell\v1.0\powershell.exe -sta $myInvocation.MyCommand.Definition
    &amp; $env:SystemRoot\system32\WindowsPowerShell\v1.0\powershell.exe -windowstyle hidden -sta $myInvocation.MyCommand.Definition
} else{
#Load required Assemblies
$Assem = (
 "System.Windows.Forms" ,
 "System.Drawing",
 "mscorlib",
 "System.data",
 "System.Management.Automation",
 "System.Xml"
 ) 
$xmldata = [xml](Get-Content geek-settings.xml);
[string]$geeklet_count=@($xmldata.ROOT.Geeklet).Count;
Add-Type -ReferencedAssemblies $Assem -TypeDefinition $form1 -Language CSharp
[string]$path=(dir .\geek-settings.xml).fullname
$arr= @($geeklet_count,$path)
$arr
#run the program
[HelloWorld.Program]::Main($arr);
}
