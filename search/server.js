var vm = require('vm');





var fs = require("fs");
var path= './lunr.min.js';
  context = {};
  var data = fs.readFileSync(path);
  vm.runInNewContext(data, context, path);
  
  var index = context.lunr(function () {
    this.field('title', {boost: 10})
    this.field('body')
    this.ref('id')
  });
  
  index.add({
    id: 1,
    title: 'Foo',
    body: 'Foo foo foo!'
  });

  index.add({
    id: 2,
    title: 'Bar',
    body: 'Bar bar bar!'
  });
  
  
  var json_export=  JSON.stringify(index);
  
  
  fs.writeFile("./index.json", json_export, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("json file was saved!");
}); 