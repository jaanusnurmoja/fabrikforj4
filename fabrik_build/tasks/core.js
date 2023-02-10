/* Stub task to set the requested package (based on task name) for the runbuild task */
module.exports = function (grunt) {
	grunt.registerTask('core', function() {
		grunt.config.set('packagesToBuild', ['core']);
		grunt.task.run('prompt', 'runbuild');
	});

}