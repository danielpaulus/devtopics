---
layout: post
status: publish
published: true
title: Writing Integration&#47;Unit Tests For SharePoint 2010 - Client Object Model
  Or Powershell Automation
author:
  display_name: daniel
  login: daniel
  email: nemschok@yahoo.de
  url: http://devtopics.de/?page_id=52
author_login: daniel
author_email: nemschok@yahoo.de
author_url: http://devtopics.de/?page_id=52
wordpress_id: 63
wordpress_url: http://devtopics.de/?p=63
date: '2013-06-06 13:22:52 +0200'
date_gmt: '2013-06-06 11:22:52 +0200'
categories:
- Allgemein
- C#
- Code
- SharePoint
tags:
- C#
- SharePoint
- Test
- Nunit
- Powershell
comments: []
---
When I started with SharePoint development I needed to find out the tools for proper testing. Currently I use Nunit and the Resharper Test Runner. If you don't have or know Resharper, which is very unlikely if you read this :-) , you should definetly check it out! Basically I use to methods for my integration and unit tests as you can see below.
Using the Client Object Model
SharePoints Client Object Model is the obvious choice for implementing your tests. First you have to reference Assemblies (Microsoft.SharePoint.Client, Microsoft.SharePoint.Client.Runtime) in your project. You can find them in:
%ProgramFiles%\Common Files\Microsoft Shared\web server extensions\14\ISAPI
The following code illustrates how you can use you ClientContext to get all your SharePoint objects.
using Microsoft.SharePoint.Client;
using NUnit.Framework;
namespace BetterBlogTemplate.tests
{
   [TestFixture]
   public class IntegrationTest
   {
       [Test]
       public void TestInstallationAndConfigurationOfSharePointObjects()
       {
           string siteUrl = "http:&#47;&#47;SharePoint&#47;";
           ClientContext clientContext = new ClientContext(siteUrl);
           Site siteCollection = clientContext.Site;
           Web web = clientContext.Web;
           Assert.True(web!=null);
           &#47;&#47;I ran this test on a blog sitecollection.
           List beitr&auml;ge = web.Lists.GetByTitle("Beitr&auml;ge");
           &#47;&#47;tell ClientContext what to load.
           clientContext.Load(web);
           clientContext.Load(beitr&auml;ge);
           &#47;&#47;When the query is executed, data is downloaded using sharePoint web services
           clientContext.ExecuteQuery();
           &#47;&#47;Now i can go ahead and test whatever I like
           Assert.NotNull(beitr&auml;ge.Description);
       }
   }
}
Using this I can write powerful tests using simple tools. I like to write special tests for checking my deployment if I got the time.
Using Powershell Automation Assembly
One time I had to add an expiration date to blog posts. To achieve this I used a simple timer job. Since I like to write my tests before coding, I wanted to create a test that would create a few entries, run the timer job and check if everything is deleted correctly. The problem was that I couldn't acess timer jobs through the CSOM. Therefore I needed to find a different way and simply used the dll all the SharePoint&nbsp; Powershell's CmdLets use. This is less restrictive and I could test the behavior of my SPTimerJob. So first reference the Microsoft.SharePoint.Powershell.dll in your project which is usually in the GAC:
C:\Windows\assembly\GAC_MSIL\Microsoft.SharePoint.PowerShell\14.0.0.0__71e9bce111e9429c\Microsoft.SharePoint.Powershell.dll
The code is also very easy:
&nbsp;
 [Test]
       public void TestInstallationAndConfigurationOfSharePointObjects()
       {
           string siteUrl = "http:&#47;&#47;SharePoint&#47;";
           SPSitePipeBind s= new SPSitePipeBind(siteUrl);
           SPSite test=s.Read();
           System.Console.WriteLine(test.ID);
           string name = "somejobName";
           &#47;&#47;There&#039;s a PipeBind for all your SharePoint objects
           SPTimerJobPipeBind jobPipe= new SPTimerJobPipeBind(name);
           &#47;&#47;Just use the read method and voila! You got your JobDefinition and can run the job
           &#47;&#47;from a test
           SPJobDefinition job= jobPipe.Read();
           Assert.NotNull(job);
       }
That's it for my SharePoint testing needs so far :-)
