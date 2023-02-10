module.exports =  function (grunt) {
	return {
		options: {
			banner: '/*! <%= pkg.name %> */\n',
	    },

		all: {
			files: grunt.file.expandMapping(
				[
					'../plugins/fabrik_*/*/*.js',
					'!../plugins/fabrik_*/**/*-min.js',
					'../plugins/fabrik_element/fileupload/lib/plupload/js/*.js',
					'!../plugins/fabrik_element/fileupload/lib/plupload/js/*-min.js',
					'../media/com_fabrik/js/*.js',
					'!../media/com_fabrik/js/*-min.js',
					'!./media/com_fabrik/js/**',
					'../media/com_fabrik/js/lib/datejs/**/*.js',
					'!../media/com_fabrik/js/lib/datejs/**/*-min.js',
					'../administrator/components/com_fabrik/models/fields/*.js',
					'!../administrator/components/com_fabrik/models/fields/*-min.js',
					'../administrator/components/com_fabrik/views/**/*.js',
					'!../administrator/components/com_fabrik/views/**/*-min.js'
				],
				'../plugins/fabrik_*/*/*.js',
				{
					rename: function (destBase, destPath) {

						if (destPath.indexOf('media/com_fabrik/js') !== -1) {
							// Put these files in their own folder
							return destPath.replace('/js/', '/js/dist/');
						} else {
							return destPath.replace('.js', '-min.js');
						}

					}
				}
			)
		}
	};
}
