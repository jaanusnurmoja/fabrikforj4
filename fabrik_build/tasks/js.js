/* Stub task to run the uglify & lineending tasks */
module.exports = function (grunt) {
	grunt.registerTask('js', function() {
		grunt.task.run('uglify', 'lineending');
	});

}