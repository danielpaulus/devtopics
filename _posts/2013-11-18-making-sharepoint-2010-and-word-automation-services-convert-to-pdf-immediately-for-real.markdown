---
layout: post
title:  "Making SharePoint 2010 and Word Automation Services convert to pdf immediately.For Real."
date:   2013-11-18 11:54:48 +0100
categories: sharepoint sharepoint2010 .net c# word
---

<p>I am still angry while writing this. This time I drew the line. When they put file conversions in a conversion job, I thought ok. When I found out that this conversion job was run by a TimerJob every 15 Minutes, I thought ok no problem. When I got an SPSecurityException when using SPTimerJobs Runnow Method from JavaScript through my WCF Service I still remained calm and searched the web for answers. As it turns out, there is NO method to run timerjobs from user code because you would need access permissions to the config database. Forget RunWithElevatedPrivileges, it is not going to work!</p>
<p>As a result I was stuck with two options:</p>
<ol>
<li>Give something (ApplicationPool, Site, WCF Service) farm admin permissions to run a timerjob<&#47;li>
<li>Use some characteristic of my website or sitecollection to indicate word conversion should be executed and have some other code (another timerjob, eventreceiver) execute the runnow method.<&#47;li><br />
<&#47;ol><br />
The first is not really an option for any production environment of course. I couldn't sleep calmly knowing something with this high level of permissions is publicly available. Let alone that our administrators would have probably punched me out of the building the moment I would have asked them.</p>
<p>The second option will work just fine. I just could not live with the sheer complexity of this kind of solution. For immediate synchronous conversion I would have to deploy a TimerJob that runs every minute and checks on some flag I set on my website. This means the worst case conversion will take place 1 minute + original word service timer job runtime from now. Unacceptable for me.</p>
<p>Ok after my little rant, I calmed down a little. &nbsp;My final solution was to reverse engineer the conversion process and use internal private API through reflection to do the conversion(It was built by man, it can be controlled by man! :-D). This of course will probably not be compatible with newer versions of SharePoint but what do you know, &nbsp;SharePoint 2013 does all that out-of-the-box.&nbsp;But what can I tell you, it works just fine. This method is of course not ideal either. But it works, and it is totally reliable. It does not circumvent load balancing or any other mechanisms. Just make sure you don't call it hundreds of times every minute :-) Depending on your environment you'll have to adapt it because remember: With great power comes the necessity to think twice about your SharePoint solution.</p>
<p>Enough talk, here's the code:</p>
<pre class="brush: csharp; gutter: true"> public static class WordServiceConversionJobRunner<br />
    {<br />
        private static WordService wordService;<br />
        private static WordServiceApplication wordServiceApplication=null;<br />
        private static WordServiceApplicationProxy wordServiceApplicationProxy = null;<br />
        private static Assembly wordServerServiceAssembly;<br />
        public static Type batchitem_type;</p>
<p>        &#47;&#47;&#47;<br />
<summary>
        &#47;&#47;&#47; Runs Word Automation Services ConversionJobs immediately using internal API. Use with caution ;-)<br />
        &#47;&#47;&#47; <&#47;summary><br />
        public static void RunWordServicesImmediately()<br />
        {<br />
            RunWordServicesImmediately(SPFarm.Local);<br />
        }</p>
<p>        &#47;&#47;&#47;<br />
<summary>
        &#47;&#47;&#47; Runs Word Automation Services ConversionJobs immediately using internal API. Use with caution ;-)<br />
        &#47;&#47;&#47; <&#47;summary><br />
        &#47;&#47;&#47;
<param name="farm">Pass the farm if coming from a unit test. (Probably should use DI..)<&#47;param><br />
        public static void RunWordServicesImmediately(SPFarm farm)<br />
        {</p>
<p>            &#47;&#47;load types<br />
            wordServerServiceAssembly = typeof (QueueJob).Assembly;<br />
            batchitem_type = wordServerServiceAssembly.GetType("Microsoft.Office.Word.Server.Service.BatchItem");<br />
            var queueJobType = typeof (QueueJob);</p>
<p>            &#47;&#47;get timerjob instance without calling default constructor, because it does some things<br />
            &#47;&#47;we dont want it to do and will throw exceptions<br />
            var job = (QueueJob)FormatterServices.GetUninitializedObject(queueJobType);</p>
<p>            &#47;&#47;find WordService</p>
<p>            foreach (SPService service in farm.Services)<br />
            {<br />
                if (service.TypeName.Equals("Word Automation Services"))<br />
                {<br />
                    wordService =(WordService) service;<br />
                    break;<br />
                }<br />
            }</p>
<p>            &#47;&#47;find service app and proxy<br />
            wordServiceApplication = (WordServiceApplication)wordService.Applications.First();<br />
            wordServiceApplicationProxy = (WordServiceApplicationProxy)wordServiceApplication.ServiceApplicationProxyGroup.Proxies.ElementAt(4);</p>
<p>            &#47;&#47;Set the private fields of our job instance. The constructor would normally have done that for us but<br />
            &#47;&#47;well..<br />
            var field = typeof(QueueJob).GetField("m_serviceApp", BindingFlags.NonPublic | BindingFlags.GetField | BindingFlags.Instance);<br />
            var field2 = typeof(QueueJob).GetField("m_serviceAppProxy", BindingFlags.NonPublic | BindingFlags.GetField | BindingFlags.Instance);<br />
            field.SetValue(job, wordServiceApplication);<br />
            field2.SetValue(job, wordServiceApplicationProxy);</p>
<p>            &#47;&#47;run the job<br />
            Myexec(job);<br />
        }<br />
        &#47;&#47;&#47;<br />
<summary>
        &#47;&#47;&#47; This method uses reflection to call a lot of internal API to prepare<br />
        &#47;&#47;&#47; the job instance for invoking its private DispatchBatchItems method.<br />
        &#47;&#47;&#47; <&#47;summary><br />
        &#47;&#47;&#47;
<param name="job">The QueueJob instance that is forced to run<&#47;param><br />
        private static void Myexec (QueueJob job)<br />
    {</p>
<p>        QueueDatabase database = wordServiceApplication.Database;</p>
<p>        IEnumerable<Uri> endpoints = (IEnumerable<Uri>)wordServiceApplicationProxy.GetPropertyValue("Endpoints");<br />
        int numberOfAvailableServiceEndpoints = endpoints.Count<Uri>();<br />
        if (numberOfAvailableServiceEndpoints == 0)<br />
        {<br />
		    return;<br />
        }</p>
<p>        int num2 = wordServiceApplication.TotalActiveProcesses * wordServiceApplication.ConversionsPerInstance;<br />
        int num3 = numberOfAvailableServiceEndpoints * num2;</p>
<p>            var listType = typeof (List<>);<br />
            var g_batch = listType.MakeGenericType(batchitem_type);<br />
            var batch = Activator.CreateInstance(g_batch);<br />
            var dynMethod = database.GetType().GetMethod("GetBatch", BindingFlags.NonPublic | BindingFlags.Instance);<br />
            batch=dynMethod.Invoke(database, new object[] { num3, wordServiceApplication.ConversionTimeout });</p>
<p>        &#47;&#47;batch = database.GetBatch(num3, wordServiceApplication.ConversionTimeout);<br />
        &#47;&#47;if (batch == null || batch.Count == 0)<br />
        &#47;&#47;{</p>
<p>        &#47;&#47;    return;<br />
        &#47;&#47;}</p>
<p>            Type workercoll = wordServerServiceAssembly.GetType("Microsoft.Office.Word.Server.Service.BatchWorkerCollection");<br />
            var ctor = workercoll.GetConstructors(BindingFlags.Instance | BindingFlags.NonPublic)[0];<br />
            var batchWorkerCollection = ctor.Invoke(new object[] { endpoints, numberOfAvailableServiceEndpoints, num2 });</p>
<p>            dynMethod = workercoll.GetMethod("InitWorkersAndWait", BindingFlags.NonPublic | BindingFlags.Instance);<br />
            dynMethod.Invoke(batchWorkerCollection, new object[] { wordServiceApplication.BatchWorkerTimeout });</p>
<p>            dynMethod = job.GetType().GetMethod("GetBatchItems", BindingFlags.NonPublic | BindingFlags.Instance);<br />
            dynMethod.Invoke(job, new object[] { batch, batchWorkerCollection, num2 });<br />
        &#47;&#47;    if (batch.Count == 0)<br />
        &#47;&#47;{</p>
<p>        &#47;&#47;    return;<br />
        &#47;&#47;}</p>
<p>            dynMethod = typeof(QueueJob).GetMethod("GetBatchUpdateXml", BindingFlags.NonPublic | BindingFlags.Static);<br />
            var batchXml=dynMethod.Invoke(null, new object[] { batch });</p>
<p>            dynMethod = database.GetType().GetMethod("UpdateBatch", BindingFlags.NonPublic | BindingFlags.Instance);<br />
            var batchJobs =dynMethod.Invoke(database, new object[] {batchXml });</p>
<p>            &#47;&#47;finally, call DispatchBatchItems and make the magic happen<br />
            dynMethod = job.GetType().GetMethod("DispatchBatchItems", BindingFlags.NonPublic | BindingFlags.Instance);<br />
            dynMethod.Invoke(job, new object[] { batchWorkerCollection, batch, batchJobs });</p>
<p>    }</p>
<p>        private static PropertyInfo GetPropertyInfo(Type type, string propertyName)<br />
        {<br />
            PropertyInfo propInfo = null;<br />
            do<br />
            {<br />
                propInfo = type.GetProperty(propertyName,<br />
                       BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);<br />
                type = type.BaseType;<br />
            }<br />
            while (propInfo == null &amp;&amp; type != null);<br />
            return propInfo;<br />
        }</p>
<p>        private static object GetPropertyValue(this object obj, string propertyName)<br />
        {<br />
            if (obj == null)<br />
                throw new ArgumentNullException("obj");<br />
            Type objType = obj.GetType();<br />
            PropertyInfo propInfo = GetPropertyInfo(objType, propertyName);<br />
            if (propInfo == null)<br />
                throw new ArgumentOutOfRangeException("propertyName",<br />
                  string.Format("Couldn&#039;t find property {0} in type {1}", propertyName, objType.FullName));<br />
            return propInfo.GetValue(obj, null);<br />
        }</p>
<p>    }<&#47;pre><br />
And because I am a big fan of writing tests, I started writing an Nunit test for running it. It is not completed but nevertheless I wanted to include it here so it doesn't feel sad. &nbsp;*currently working on that test*</p>
<p>&nbsp;</p>
<pre class="brush: csharp; gutter: true">[Test]<br />
        public void TestImmediateConversion()<br />
        {<br />
            SPFarm farm = web.Site.WebApplication.Farm;</p>
<p>            &#47;&#47;this needs some changes obviously, this would have to be done in setup methods<br />
            SPList doclib = web.Lists["somedoclib"];<br />
            SPFolder targetFolder = doclib.Folders[0].Folder;</p>
<p>            string inputFile = web.Url + "&#47;" + targetFolder.Url + "&#47;" + targetFolder.Files[0].Name;<br />
            string outputFile = web.Url + "&#47;" + targetFolder.Url + "&#47;" + "test.pdf";<br />
            EnqueueConversionJob(inputFile, outputFile);<br />
            WordServiceConversionJobRunner.RunWordServicesImmediately(farm);<br />
&#47;&#47;there arent even any assertions yet </p>
<p>        }</p>
<p>        private void EnqueueConversionJob(String inputFile, String outputFile)<br />
        {<br />
            &#47;&#47;Get the context using powershell pipebinds<br />
            SPServiceContextPipeBind bin = new SPServiceContextPipeBind(web.Site);<br />
            var context = bin.Read();</p>
<p>            var _serviceApplicationProxy =<br />
                (WordServiceApplicationProxy)context.GetDefaultProxy(typeof(WordServiceApplicationProxy));</p>
<p>            var _job = new ConversionJob(_serviceApplicationProxy);<br />
            _job.UserToken = web.Site.UserToken;<br />
            _job.Settings.UpdateFields = true;</p>
<p>            _job.Settings.OutputFormat = SaveFormat.PDF;</p>
<p>            _job.AddFile(inputFile, outputFile);</p>
<p>            _job.Start();<br />
        }<&#47;pre></p>
