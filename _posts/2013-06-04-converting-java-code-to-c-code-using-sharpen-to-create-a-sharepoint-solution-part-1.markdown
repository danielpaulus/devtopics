---
layout: post
status: publish
published: true
title: Converting Java Code to C# Code Using Sharpen To Create a SharePoint Solution
  - Part 1
author:
  display_name: blog_admin
  login: blog_admin
  email: daniel.paulus@me.com
  url: ''
author_login: blog_admin
author_email: daniel.paulus@me.com
wordpress_id: 29
wordpress_url: http://devtopics.de/?p=29
date: '2013-06-04 13:07:56 +0200'
date_gmt: '2013-06-04 11:07:56 +0200'
categories:
- Allgemein
- Code
tags:
- Java
- C#
- SharePoint
- Sharpen
- Versant
- Coding
---
For an explorative prototype project I wanted to use some existing Java code to build a SharePoint plugin. Therefore, the first thing that needs to be done is create some C# code for the backend. I found out about "Sharpen" an automatic conversion tool built and open sourced by versant
I used the tutorial taken from versants community pages and followed these steps using eclipse and its subclipse svn client:

Checkout sharpen.core from db4o's subversion repository at https:&#47;&#47;source.db4o.com&#47;db4o&#47;trunk&#47;sharpen&#47;
Right click the freshly checked out project in the "Package Explorer" and choose "Export" from the context menu;
Expand the "Plug-in Development" folder and select "Deployable plug-ins and fragments";
Set "Destination" to the root folder of your eclipse installation and click "Finish";

After completing these steps I created a simple java project called "ConverterTest". Then I created my class "SomeClass.java" in package "de". I added some simple code like this:
package de;
public class SomeClass {
	public String dude;
	public SomeClass() {
		dude = "convert me!";
	}
	public void print() {
		System.out.print(dude);
	}
}
Since I am only interested in converting source code and not so much in automated C# builds I modified the example xml ant files accordingly. So in my ConverterTest project i created my build.xml ant-file:


        
        
        

            
            
        
        
            
        
    
Then I created build-properties.xml like this:




    
Finally I downloaded the sharpen-common.xml and placed it in my project. Then I ran my build.xml file as an Ant Build using the context menu and the "Run As->Ant Build" command. Then I automagically got the following C# code in "build&#47;ConverterTest.net&#47;src&#47;de&#47;SomeClass.cs"
namespace de
{
	public class SomeClass
	{
		public string dude;
		public SomeClass()
		{
			dude = "convert me!";
		}
		public virtual void print()
		{
			System.Console.Out.Write(dude);
		}
	}
}
An here we go :-) Obviously the generated code violates some source code naming conventions but what is important is that it is runnable. The rest can easily be fixed using resharper or Visual Studios built in refactoring tools. Next I'll try to convert some complicated code in Part 2.
