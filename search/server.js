var vm = require('vm');

var scriptpath= require('path').basename(__dirname);



var fs = require("fs");
var path= scriptpath+'/lunr.min.js';
  context = {};
  var data = fs.readFileSync(path);
  vm.runInNewContext(data, context, path);
  
  var index = context.lunr(function () {
    this.field('title', {boost: 10})
    this.field('body')
    this.ref('id')
  });
  
  

  
  var filecount=0;
  var callbacks=0;
  function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
	filecount=filenames.length;
    filenames.forEach(function(filename) {
      fs.readFile(dirname +'/'+ filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
	
  });
}
 
readFiles( scriptpath+'/../_posts', function(file, content){
	callbacks++;
	
	
	index.add({
    id: callbacks,
    title: 'Foo',
    body: content
  });
	
	console.log('read file:'+file+callbacks);
	if (callbacks==filecount){
		exportJson();
	}
}, function(error){console.log('indexing, file read error'+error);});
  
  
  function exportJson(){
  var json_export=  JSON.stringify(index);
  
  
  fs.writeFile(scriptpath+"/index.json", json_export, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("json file was saved!");
}); 
  }
  
  
  

const exec = require('child_process').exec;
const child = exec("gzip -9 "+ scriptpath+"/index.json",
  (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
});


