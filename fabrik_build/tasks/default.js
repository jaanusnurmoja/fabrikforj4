/* Stub task to set the requested package (based on task name) for the runbuild task */
module.exports = function (grunt) {
	grunt.registerTask('default', function() {
		grunt.config.set('packagesToBuild', Object.keys(grunt.config.get('packages')));
		grunt.task.run('prompt', 'runbuild');
	});

}