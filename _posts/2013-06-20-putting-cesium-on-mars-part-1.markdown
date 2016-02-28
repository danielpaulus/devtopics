---
layout: post
status: publish
published: true
title: Putting Cesium on Mars - Part 1
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 88
wordpress_url: http://devtopics.de/?p=88
date: '2013-06-20 09:08:51 +0200'
date_gmt: '2013-06-20 07:08:51 +0200'
categories:
- Allgemein
- GeoGeek
- JavaScript
tags:
- webgl
- mars
- cesium
- cesium.agi.com
- javascript
comments: []
---
Ok so I wanted to play around with GeoInformationSystems(GIS) and maps for quite a while now. The final impulse to get going came from the super awesome webGL enabled cesium library&#47;framework by AGI. If you've never heard of it, you HAVE to check it out! It is extremely cool.
For getting started I chose to use XAMPP as a webserver and downloaded the newest full distibution package of cesium from here. Put the cesium-b* folder into your XAMPP htdocs folder and access it via localhost. As a little learning and fun project I wanted to use maps and terrain rendering of current mars data and maybe put some satellites or the mars rover on the globe later. The internet is always very helpful when it comes to finding free data. The JMars project provides me with elevation maps and photo maps and everything i needed. For starters I wanted to have the mars-typical red maps and found the&nbsp;Viking Merged Color Mosaic. Ad a side note, you can always check out www.google.com&#47;mars&nbsp;if you're only interested in browsing through maps :-)
The first riddle to solve was finding out about projections and especially of the one I was planning to use: "Simple cylindrical, -180E to 180E, 90N to -90N, 'ocentric". To find out about projections I read through this&nbsp;great introduction. Basically the projection in cartography is a transformation of the surface of a round body like a sphere to a 2D plane. And cylindrical projections are the ones used for ordinary maps. I found out that the "simple cylindrical" the datasheet told me to use is&nbsp;commonly known as geographic, equirectangular, equidistant cylindrical, or plate carre. And of course also known as EPSG:4326 which is the standard projection everything in the web uses and cesium provides me with oob support for.
Next i had to create a georeferenced wms-layer from the image material. I followed this(http:&#47;&#47;ian01.geog.psu.edu&#47;geoserver_docs&#47;data&#47;bluemarble&#47;bluemarble.html) great tutorial using gdal to achieve this.
Now for converting my png marstiles to geoTiffs using the gdal sdk from&nbsp;http:&#47;&#47;www.gisinternals.com&#47;sdk&#47;&nbsp;I downloaded and extracted the latest stable x64 release since I am on Windows2008. Just like the author of the tutorial I am following, I am too lazy to type things as well and in addition, I love powershell :-) So I wrote a small script to convert all pngs to geoTiffs.
#sort files using ls (alias for get-childitem or dir)
$north=@((ls |?{$_.Name -like "*45n*225*.png"}),(ls |?{$_.Name -like "*45n*315*.png"}),(ls |?{$_.Name -like "*45n*045*.png"}),(ls |?{$_.Name -like "*45n*135*.png"}))
$south=@((ls |?{$_.Name -like "*45s*225*.png"}),(ls |?{$_.Name -like "*45s*315*.png"}),(ls |?{$_.Name -like "*45s*045*.png"}),(ls |?{$_.Name -like "*45s*135*.png"}))
#set an environment variable here to point to gdal data dir
$env:GDAL_DATA="D:\marsmap\gdal\bin\gdal-data"
#create northern hemisphere geotifs
$left=-180
$top=90
$bot=0
foreach ($file in $north){
    $ofile=$file.Name.Replace(".png",".tif")
    $right=$left+90
    .\gdal\bin\gdal\apps\gdal_translate.exe -of GTiff -a_srs EPSG:4326 -a_ullr $left $top $right $bot $file $ofile
    $left+=90
}
#create southern hemisphere geotifs
$left=-180
$top=0
$bot=-90
foreach ($file in $south){
    $ofile=$file.Name.Replace(".png",".tif")
    $right=$left+90
    .\gdal\bin\gdal\apps\gdal_translate.exe -of GTiff -a_srs EPSG:4326 -a_ullr $left $top $right $bot $file $ofile
    $left+=90
}
You'd have to adapt your paths of course. &nbsp;I then copied the dll-files from the &nbsp;into the gdal\bin folder to bin\gdal\apps folder to make gdal_translate.exe work. There's probably an installer who does proper registering of dlls for you but I was just too lazy to look for it :-) After creating my tiffs, I needed to merge them using&nbsp;\bin\gdal\python\scripts\gdal_merge.py. To get this python script to work I&nbsp;had to install the python bindings&nbsp;http:&#47;&#47;www.gisinternals.com&#47;sdk&#47;PackageList.aspx?file=release-1600-x64-gdal-1-10-0-mapserver-6-2-1.zip. Note that I had Python already installed on my computer. If you don't have it, download and install a supported version from here (I used 2.7). Then I fired up a cmd.exe console and started the&nbsp;SDKShell.bat. For some strange reason, there was a bug in it. When i typed "set" after execution to see all environment variables, i could see that all paths had double backslashes in them. I had to modify the batch file by replacing all occurences of %~dp0\ by %~dp0. After doing this, the enviroment variables were set correctly.
Because the gdal_merge.py script expects file names of my tiff files separated by spaces, I created a small powershell script to output the filenames of all tifs so I could copy paste it (am so lazy :-))
$a=ls | ?{$_.FullName -like "*.tif"} |% {$_.FullName}
$s=""
foreach($name in $a){$s+=" "+$name}
$s
If you're interested here is the official documentation:&nbsp;http:&#47;&#47;www.gdal.org&#47;gdal_merge.html&nbsp;. Finally I copy pasted and typed the following command:
D:\marsmap\gdal\bin\gdal\python\scripts>gdal_merge.py -o mars-photo.tif -of GTif
f -co "TILED=YES" D:\marsmap\mars45n045.tif D:\marsmap\mars45n135.tif D:\marsmap
\mars45n225.tif D:\marsmap\mars45n315.tif D:\marsmap\mars45s045.tif D:\marsmap\m
ars45s135.tif D:\marsmap\mars45s225.tif D:\marsmap\mars45s315.tif
And booya! I finally got one large mars-photo.tif. Last thing to do is creating the tileset using the following command:
gdal_retile.py -v -r bilinear -levels 8 -ps 256 256 -co "TILED=YES" -targetDir marspyramid d:\marsmap\mars-photo.tif
Ok, almost there! Last step for today is to get geoServer and create a WMS layer from my newly created tile set.
Download and the awesome java-based open source GeoServer. Extract the package contents to some folder you like and fire up "start.jar" found in the root directory(I presume you installed Java). The server&nbsp;runs on&nbsp;http:&#47;&#47;localhost:8080&#47;geoserver&#47;web&#47;&nbsp;and can be configured by using your browser. The standard user is 'admin' and the password is 'geoserver'. To import our tileset we need the&nbsp;pyramid plugin first. Download it here and follow the instructions for installing:&nbsp;http:&#47;&#47;docs.geoserver.org&#47;stable&#47;en&#47;user&#47;data&#47;raster&#47;imagepyramid.html&nbsp;now restart your geoserver.
In GeoServer create a new workspace. In stores(Datenspeicher) add a new raster layer using pyramid plugin and&nbsp;enter as raster datasource:
name:mars;
descr: viking merged color mosaic; url:
D:\geoserver-2.3.2\data_dir\data\marspyramid
Of course, make sure to put your tileset in the folder you specify there.
You can use layer preview to validate your layer works as desired. And now, the final step! I add my layer to cesium in sandcastle. I used the following javascript code and pasted it in the imagery layers example from the gallery:
require([&#039;Cesium&#039;], function(Cesium) {
    "use strict";
    var widget = new Cesium.CesiumWidget(&#039;cesiumContainer&#039;);
var url=&#039;http:&#47;&#47;localhost:8081&#47;geoserver&#47;wms&#039;;
    var layers = widget.centralBody.getImageryLayers();
    layers.removeAll();
    layers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
        url : url,
        layers: &#039;marspyramid&#039;
    }));
    Sandcastle.finishedLoading();
});
If this doesn't work, then you may have the same problem as I have. My Apache&#47;XAMPP runs on a different port than my GeoServer. This prevents javascript from downloading tiles because it is considered a cross domain request (-> CORS). For development purposes I simply configured the Apache to forward all request made to "geoserver&#47;wms" to the geoserver adress by editing the xampp&#47;apache&#47;conf&#47;httpd.conf. First make sure that the lines
LoadModule proxy_module modules&#47;mod_proxy.so
LoadModule proxy_http_module modules&#47;mod_proxy_http.so
LoadModule rewrite_module modules&#47;mod_rewrite.so
Are uncommented.&nbsp;At the end of the file I inserted the following line:
ProxyPass &#47;geoserver&#47;wms http:&#47;&#47;localhost:8080&#47;geoserver&#47;wms
Here is the fine result of my work:

Next I'll try to render terrain using the height maps provided in Part 2.
Part 3 will be about putting things on the surface like the Mars rover. I will probably have to modify the ellipsoid, since mars is much smaller than earth. I guess it will mess up distances if I don't. (Don't forget, I am pretty new to the whole field)
&nbsp;
