---
layout: post
title:  "Implementing client side search just for the fun of it."
date:   2016-02-27 22:54:48 +0100
categories: jekyll nodejs node lunr.js angular angular.js search
---
Today i thought about how cool it was, when my blog had search functionality. And I tried to find a search solution 
for Jekyll. Of course i clould fire up the old backend code-editor and include some search server or search web service,
but to make it an interesting challenge I wanted something entirely JavaScript and entirely client side. So here we go:

[lunr.js](http://lunrjs.com/)
wrote a node script for indexing at build time

put the index in static .json files to load at run time

wrote an angular app to make use of them: