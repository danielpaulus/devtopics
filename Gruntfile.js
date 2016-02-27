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
	}}
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-bower-concat');
  // Default task(s).
  grunt.registerTask('default', ['bower_concat','uglify:bower']);

};