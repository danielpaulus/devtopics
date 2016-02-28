---
layout: post
title:  "Making SharePoint 2010 and Word Automation Services convert to pdf immediately.For Real."
date:   2013-11-18 11:54:48 +0100
categories: sharepoint sharepoint2010 .net c# word
---
I am still angry while writing this. This time I drew the line. When they put file conversions in a conversion job, I thought ok. When I found out that this conversion job was run by a TimerJob every 15 Minutes, I thought ok no problem. When I got an SPSecurityException when using SPTimerJobs Runnow Method from JavaScript through my WCF Service I still remained calm and searched the web for answers. As it turns out, there is NO method to run timerjobs from user code because you would need access permissions to the config database. Forget RunWithElevatedPrivileges, it is not going to work!
As a result I was stuck with two options:
Give something (ApplicationPool, Site, WCF Service) farm admin permissions to run a timerjob
Use some characteristic of my website or sitecollection to indicate word conversion should be executed and have some other code (another timerjob, eventreceiver) execute the runnow method.
The first is not really an option for any production environment of course. I couldn't sleep calmly knowing something with this high level of permissions is publicly available. Let alone that our administrators would have probably punched me out of the building the moment I would have asked them.
The second option will work just fine. I just could not live with the sheer complexity of this kind of solution. For immediate synchronous conversion I would have to deploy a TimerJob that runs every minute and checks on some flag I set on my website. This means the worst case conversion will take place 1 minute + original word service timer job runtime from now. Unacceptable for me.
Ok after my little rant, I calmed down a little.  My final solution was to reverse engineer the conversion process and use internal private API through reflection to do the conversion(It was built by man, it can be controlled by man! :-D). This of course will probably not be compatible with newer versions of SharePoint but what do you know,  SharePoint 2013 does all that out-of-the-box. But what can I tell you, it works just fine. This method is of course not ideal either. But it works, and it is totally reliable. It does not circumvent load balancing or any other mechanisms. Just make sure you don't call it hundreds of times every minute :-) Depending on your environment you'll have to adapt it because remember: With great power comes the necessity to think twice about your SharePoint solution.
Enough talk, here's the code:
{% highlight csharp %}
 public static class WordServiceConversionJobRunner
    {
        private static WordService wordService;
        private static WordServiceApplication wordServiceApplication=null;
        private static WordServiceApplicationProxy wordServiceApplicationProxy = null;
        private static Assembly wordServerServiceAssembly;
        public static Type batchitem_type;
        ///
        /// Runs Word Automation Services ConversionJobs immediately using internal API. Use with caution ;-)
        /// 
        public static void RunWordServicesImmediately()
        {
            RunWordServicesImmediately(SPFarm.Local);
        }
        ///
        /// Runs Word Automation Services ConversionJobs immediately using internal API. Use with caution ;-)
        /// 
        ///
Pass the farm if coming from a unit test. (Probably should use DI..)
        public static void RunWordServicesImmediately(SPFarm farm)
        {
            //load types
            wordServerServiceAssembly = typeof (QueueJob).Assembly;
            batchitem_type = wordServerServiceAssembly.GetType("Microsoft.Office.Word.Server.Service.BatchItem");
            var queueJobType = typeof (QueueJob);
            //get timerjob instance without calling default constructor, because it does some things
            //we dont want it to do and will throw exceptions
            var job = (QueueJob)FormatterServices.GetUninitializedObject(queueJobType);
            //find WordService
            foreach (SPService service in farm.Services)
            {
                if (service.TypeName.Equals("Word Automation Services"))
                {
                    wordService =(WordService) service;
                    break;
                }
            }
            //find service app and proxy
            wordServiceApplication = (WordServiceApplication)wordService.Applications.First();
            wordServiceApplicationProxy = (WordServiceApplicationProxy)wordServiceApplication.ServiceApplicationProxyGroup.Proxies.ElementAt(4);
            //Set the private fields of our job instance. The constructor would normally have done that for us but
            //well..
            var field = typeof(QueueJob).GetField("m_serviceApp", BindingFlags.NonPublic | BindingFlags.GetField | BindingFlags.Instance);
            var field2 = typeof(QueueJob).GetField("m_serviceAppProxy", BindingFlags.NonPublic | BindingFlags.GetField | BindingFlags.Instance);
            field.SetValue(job, wordServiceApplication);
            field2.SetValue(job, wordServiceApplicationProxy);
            //run the job
            Myexec(job);
        }
        ///
        /// This method uses reflection to call a lot of internal API to prepare
        /// the job instance for invoking its private DispatchBatchItems method.
        /// 
        ///
The QueueJob instance that is forced to run
        private static void Myexec (QueueJob job)
    {
        QueueDatabase database = wordServiceApplication.Database;
        IEnumerable endpoints = (IEnumerable)wordServiceApplicationProxy.GetPropertyValue("Endpoints");
        int numberOfAvailableServiceEndpoints = endpoints.Count();
        if (numberOfAvailableServiceEndpoints == 0)
        {
		    return;
        }
        int num2 = wordServiceApplication.TotalActiveProcesses * wordServiceApplication.ConversionsPerInstance;
        int num3 = numberOfAvailableServiceEndpoints * num2;
            var listType = typeof (List);
            var g_batch = listType.MakeGenericType(batchitem_type);
            var batch = Activator.CreateInstance(g_batch);
            var dynMethod = database.GetType().GetMethod("GetBatch", BindingFlags.NonPublic | BindingFlags.Instance);
            batch=dynMethod.Invoke(database, new object[] { num3, wordServiceApplication.ConversionTimeout });
        //batch = database.GetBatch(num3, wordServiceApplication.ConversionTimeout);
        //if (batch == null || batch.Count == 0)
        //{
        //    return;
        //}
            Type workercoll = wordServerServiceAssembly.GetType("Microsoft.Office.Word.Server.Service.BatchWorkerCollection");
            var ctor = workercoll.GetConstructors(BindingFlags.Instance | BindingFlags.NonPublic)[0];
            var batchWorkerCollection = ctor.Invoke(new object[] { endpoints, numberOfAvailableServiceEndpoints, num2 });
            dynMethod = workercoll.GetMethod("InitWorkersAndWait", BindingFlags.NonPublic | BindingFlags.Instance);
            dynMethod.Invoke(batchWorkerCollection, new object[] { wordServiceApplication.BatchWorkerTimeout });
            dynMethod = job.GetType().GetMethod("GetBatchItems", BindingFlags.NonPublic | BindingFlags.Instance);
            dynMethod.Invoke(job, new object[] { batch, batchWorkerCollection, num2 });
        //    if (batch.Count == 0)
        //{
        //    return;
        //}
            dynMethod = typeof(QueueJob).GetMethod("GetBatchUpdateXml", BindingFlags.NonPublic | BindingFlags.Static);
            var batchXml=dynMethod.Invoke(null, new object[] { batch });
            dynMethod = database.GetType().GetMethod("UpdateBatch", BindingFlags.NonPublic | BindingFlags.Instance);
            var batchJobs =dynMethod.Invoke(database, new object[] {batchXml });
            //finally, call DispatchBatchItems and make the magic happen
            dynMethod = job.GetType().GetMethod("DispatchBatchItems", BindingFlags.NonPublic | BindingFlags.Instance);
            dynMethod.Invoke(job, new object[] { batchWorkerCollection, batch, batchJobs });
    }
        private static PropertyInfo GetPropertyInfo(Type type, string propertyName)
        {
            PropertyInfo propInfo = null;
            do
            {
                propInfo = type.GetProperty(propertyName,
                       BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
                type = type.BaseType;
            }
            while (propInfo == null && type != null);
            return propInfo;
        }
        private static object GetPropertyValue(this object obj, string propertyName)
        {
            if (obj == null)
                throw new ArgumentNullException("obj");
            Type objType = obj.GetType();
            PropertyInfo propInfo = GetPropertyInfo(objType, propertyName);
            if (propInfo == null)
                throw new ArgumentOutOfRangeException("propertyName",
                  string.Format("Couldn&#039;t find property {0} in type {1}", propertyName, objType.FullName));
            return propInfo.GetValue(obj, null);
        }
    }
{% endhighlight %}
	
	And because I am a big fan of writing tests, I started writing an Nunit test for running it. It is not completed but nevertheless I wanted to include it here so it doesn't feel sad.  *currently working on that test*

 {% highlight powershell %}
[Test]
        public void TestImmediateConversion()
        {
            SPFarm farm = web.Site.WebApplication.Farm;
            //this needs some changes obviously, this would have to be done in setup methods
            SPList doclib = web.Lists["somedoclib"];
            SPFolder targetFolder = doclib.Folders[0].Folder;
            string inputFile = web.Url + "/" + targetFolder.Url + "/" + targetFolder.Files[0].Name;
            string outputFile = web.Url + "/" + targetFolder.Url + "/" + "test.pdf";
            EnqueueConversionJob(inputFile, outputFile);
            WordServiceConversionJobRunner.RunWordServicesImmediately(farm);
//there arent even any assertions yet 
        }
        private void EnqueueConversionJob(String inputFile, String outputFile)
        {
            //Get the context using powershell pipebinds
            SPServiceContextPipeBind bin = new SPServiceContextPipeBind(web.Site);
            var context = bin.Read();
            var _serviceApplicationProxy =
                (WordServiceApplicationProxy)context.GetDefaultProxy(typeof(WordServiceApplicationProxy));
            var _job = new ConversionJob(_serviceApplicationProxy);
            _job.UserToken = web.Site.UserToken;
            _job.Settings.UpdateFields = true;
            _job.Settings.OutputFormat = SaveFormat.PDF;
            _job.AddFile(inputFile, outputFile);
            _job.Start();
        }
{% endhighlight %}