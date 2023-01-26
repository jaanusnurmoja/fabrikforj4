module.exports = function(grunt) {
	return { 
		main: {
			options: {
				archive: grunt.config('config.version') + '.zip'
			},
			files  : [
				{src: ['path/*'], dest: 'internal_folder/', filter: 'isFile'}, // includes files in path
				{src: ['path/**'], dest: 'internal_folder2/'}, // includes files in path and its subdirs
			]
		}
	}
}