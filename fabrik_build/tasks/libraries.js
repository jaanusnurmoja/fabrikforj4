/* Stub task to set the requested package (based on task name) for the runbuild task */
module.exports = function (grunt) {
	grunt.registerTask('libraries', function() {
		grunt.config.set('packagesToBuild', [grunt.task.current.name]);
		grunt.task.run('prompt', 'runbuild');
	});
}