module.exports = function(grunt) {
  var  path = require("path");

  var tasks = {scope: ['devDependencies', 'dependencies' ]};
  var options = {pkg: grunt.file.readJSON('package.json'), 
                  config: {src: "configs/*.js" }, 
                  buildDir: __dirname + '/',
                  projectDir : path.dirname(__dirname) + '/',
              };
  var configs = require('load-grunt-configs')(grunt, options);
   
  require('load-grunt-tasks')(grunt, tasks);
  grunt.initConfig(configs);
  grunt.loadTasks('tasks');

}