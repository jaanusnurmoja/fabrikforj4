module.exports = function() {
	return {
	    all: {
	        options: {
	            overwrite: true,
	            eol: 'crlf'
	        },
	        files: [{
	        	expand: true,
	            src: [
	                '../plugins/fabrik_*/**/*-min.js',
					'../plugins/fabrik_element/fileupload/lib/plupload/js/*-min.js',
					'../media/com_fabrik/js/dist/*-min.js',
					'../media/com_fabrik/js/dist/lib/datejs/**/*-min.js',
					'../administrator/components/com_fabrik/models/fields/*-min.js',
					'../administrator/components/com_fabrik/views/**/*-min.js'
				],
				dest: ''
			}]
	    }
	}
}
