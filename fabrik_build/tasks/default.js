/* Stub task to build the default package, to change the default change the first task in the list */
module.exports = function (grunt) {
	grunt.registerTask('default', function() {
		grunt.task.run('full', 'prompt', 'js', 'runbuild');
	});
}