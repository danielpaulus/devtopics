module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      bower: {
    options: {
      mangle: true,
      compress: true
    },
    files: {
      'js/bower.min.js': 'js/bower.js'
    }
  }
    },
	bower_concat: {
  all: {
    dest: 'js/bower.js'
	}},
	exec: {
  build: 'ruby /usr/bin/jekyll build',
  search_index: 'node C:\\git\\my_blog\\search\\server.js',
  upload: 'powershell -File "C:\\git\\my_blog\\deploy\\deploy.ps1"'
}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-bower-concat');
grunt.loadNpmTasks('grunt-exec');
  // Default task(s).
  grunt.registerTask('default', ['bower_concat','uglify:bower','exec:build']);
  grunt.registerTask('full', ['bower_concat','uglify:bower','exec:build', 'exec:search_index', 'upload']);
  grunt.registerTask('upload', ['exec:upload']);
  grunt.registerTask('index', ['exec:search_index']);
  grunt.registerTask('build', ['exec:build']);

};