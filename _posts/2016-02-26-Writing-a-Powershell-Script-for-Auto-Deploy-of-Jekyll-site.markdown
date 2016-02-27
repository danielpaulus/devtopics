---
layout: post
title:  "Getting to Jekyll to run on Windows using Cygwin and writing an auto deploy ftp script with Powershell"
date:   2016-02-26 11:54:48 +0100
categories: powershell jekyll cygwin windows
---
Since my last Wordpress based blog software has been hacked by some evil drive-by attack :'(
I decided to switch to static html and JavaScript for a change. For that purpose I decided to check out Jekyll.
The first problem is, that I am using Windows which there is no official support for. Not everyone can afford a Mac you guys :-D

I found this great Tutorial (http://ryayon.github.io/cygwin/Install-Jekyll-on-Windows/)[http://ryayon.github.io/cygwin/Install-Jekyll-on-Windows/] to get Jekyll running on Cygwin. 
After following the instructions, there was an "Failed to build gem native extension" error at first, so I checked the mkmf.log file using
"cat ~/.gem/ruby/extensions/x86_64-cygwin/ffi-1.9.10/mkmf.log". Apparently I was missing the "libgmp-devel" package.
After installing it, building Jekyll went fine.

The second step was to import my old wordpress blog articles. This works out of the box. I had to install the ruby gems as instructed
on the jekyll web pages. The import does not import images and does not convert blog posts to markdown. But it is better than nothing i suppose.

Now for some automation. Naturally i want to automatically upload my page whenever I write something new. 
I used a simple Powershell script to generate a list of ftp commands for Microsofts limited ftp commandline tool. This way i can upload my Jekyll Site 
automatically. 
You can get the code here on [github](https://github.com/danielpaulus/devtopics/) where you can find the script and an example
settings.json to use. 
Here is the code for the impatient:
{% highlight powershell %}

$scriptpath= Split-Path -Parent $PSCommandPath

$settings= cat ($scriptpath+"\settings.json") | ConvertFrom-Json
$ftp_host=$settings.ftp_host

$ftp_commands=@($settings.user,$settings.pwd,"cd "+$settings.remoteroot)
$localpath= $settings.localpath



$dirs= dir $localpath -recurse | ? {$_.GetType().Name -eq "DirectoryInfo"}


foreach ($dir in $dirs){
$remotepath=$dir.parent.fullname.replace($localpath, "/web")
$remotepath=$remotepath.replace("\","/")
$ftp_commands+="cd "+$remotepath
$ftp_commands+= "mkdir "+ $dir.Name
$ftp_commands+="cd "+$dir.Name

foreach($f in $dir.GetFiles()){
  $ftp_commands+="put "+$f.fullname
}
}

$rootfiles+= ls $localpath |? {$_.GetType().Name -eq "FileInfo"}
$ftp_commands+="cd /web"
foreach($f in $rootfiles){
  $ftp_commands+="put "+$f.fullname
}

$ftp_commands+="quit"

$ftp_commands| out-file ($scriptpath+"\ftpcmds.dat")
invoke-expression "ftp -s:$($scriptpath+"\ftpcmds.dat") $ftp_host"
rm ($scriptpath+"\ftpcmds.dat")
{% endhighlight %}
