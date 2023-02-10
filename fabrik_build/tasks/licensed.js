/* Stub task to set the requested package (based on task name) for the runbuild task */
module.exports = function (grunt) {
	grunt.registerTask('licensed', function() {
		var packages = grunt.config.get('packages');
		/* Filter on only licenses packages */
		grunt.config.set('packagesToBuild', Object.keys(packages).filter(package => packages[package].licensed === true));
		grunt.task.run('prompt', 'runbuild');
	});

}