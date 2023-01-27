module.exports = {
    'core': {
    	'licensed': false,
        'manifest': 'pkg_fabrik_core.manifest.class.php',
        'plugins': {
        	'element': ['checkbox','databasejoin','date','display','dropdown',
    			'field','internalid','jdate','radiobutton','textarea','user','yesno'],
        	'form': ['email','redirect'],
        	'list': ['candeleterow','caneditrow','canviewrow','copy', 'email'],
        	'validationrule': ['isnot','isnumeric','isuniquevalue','notempty'],
			},
		'component': 'com_fabrik_{version}.zip',
        'jplugins':[
            {
                'name'    : 'Fabrik System Plugin',
                'path'    : 'plugins/system/fabrik',
                'fileName': 'plg_fabrik_system_{version}.zip',
                'element' : 'fabrik',
                'group'   : 'system',
                'xmlFile' : 'fabrik.xml'
            },
            {
                'name'    : 'Fabrik Search Plugin',
                'path'    : 'plugins/search/fabrik',
                'fileName': 'plg_fabrik_search_{version}.zip',
                'element' : 'fabrik',
                'group'   : 'search',
                'xmlFile' : 'fabrik.xml'
            }
        	],
    },
    'libraries': {
        'licensed': true,
        'libraries': [
            {
                'name'    : 'Fabrik Library',
                'libname' : 'lib_fabrik',
                'path'    : 'libraries/fabrik',
                'fileName': 'lib_fabrik_{version}.zip',
                'element' : 'fabrik',
                'xmlFile' : 'fabrik.xml'
            },
        ],
    },
    'php': {
    	'licensed': true,
        'plugins': {
        	'cron': ['email','php', 'importcsv', 'notification'],
        	'form': ['php'],
        	'list': ['js','php','php_events', 'notification'],
        	'validationrule': ['php','regex'],
	    	},
        'jplugins':[
            {
                'name'    : 'Fabrik Cron Plugin',
                'path'    : 'plugins/system/fabrikcron',
                'fileName': 'plg_fabrik_schedule_{version}.zip',
                'element' : 'fabrikcron',
                'group'   : 'system',
                'xmlFile' : 'fabrikcron.xml'
            }
        ],
    },
    'xplugins': {
    	'licensed': true,
        'plugins': {
        	'element': [
        		'birthday',
        		'button',
        		'calc',
        		'captcha',
        		'cascadingdropdown',
        		'colourpicker',
        		'count',
        		'fileupload',
        		'folder',
        		'image',
        		'link',
        		'lockrow',
        		'notes',
        		'picklist', 
        		'time',
        		'timer',
        		'timestamp',
        		'total',
        		],
        	'form': [
        		'autofill',
        		'confirmation',
        		'consent',
        		'ftp',
        		'limit',
        		'log',
        		'paginate',
        		'receipt',
        		],
        	'list': [
        		'download',
        		'listcsv',
        		'lockrow',
        		'update_col',
        		],
        },
	},
    'content': {
    	'licensed': true,
        'plugins': {
        	'form': [
	        	'article',
        		],
        	'list': [
	        	'article',
        		],
	    	},
        'jplugins': [
            {
                'name'    : 'Fabrik Content Plugin',
                'path'    : 'plugins/content/fabrik',
                'fileName': 'plg_fabrik_content_{version}.zip',
                'element' : 'fabrik',
                'group'   : 'content',
                'xmlFile' : 'fabrik.xml'
            }
        	],
        'modules': [
	        {
	            'name'    : 'Fabrik List Module',
	            'path'    : 'modules/mod_fabrik_list',
	            'fileName': 'mod_fabrik_list_{version}.zip',
	            'element' : 'mod_fabrik_list',
	            'xmlFile' : 'mod_fabrik_list.xml',
                'client'  : 'site'
	        },
	        {
	            'name'    : 'Fabrik Form Module',
	            'path'    : 'modules/mod_fabrik_form',
	            'fileName': 'mod_fabrik_form_{version}.zip',
	            'element' : 'mod_fabrik_form',
	            'xmlFile' : 'mod_fabrik_form.xml',
                'client'  : 'site'
	        },
	        {
	            'name'    : 'Fabrik Admin Form Module',
	            'path'    : 'administrator/modules/mod_fabrik_form',
	            'fileName': 'mod_fabrik_admin_form_{version}.zip',
	            'element' : 'mod_fabrik_form',
	            'xmlFile' : 'mod_fabrik_form.xml',
	            'client'  : 'administrator'
	        },
	        {
	            'name'    : 'Fabrik Admin List Module',
	            'path'    : 'administrator/modules/mod_fabrik_list',
	            'fileName': 'mod_fabrik_admin_list_{version}.zip',
	            'element' : 'mod_fabrik_list',
	            'xmlFile' : 'mod_fabrik_list.xml',
	            'client'  : 'administrator'
	        },
	        {
	            'name'    : 'Fabrik Admin QuickIcon Module',
	            'path'    : 'administrator/modules/mod_fabrik_quickicon',
	            'fileName': 'mod_fabrik_admin_quickicon_{version}.zip',
	            'element' : 'mod_fabrik_quickicon',
	            'xmlFile' : 'mod_fabrik_quickicon.xml',
	            'client'  : 'administrator'
	        },
	    ],
    },
    'visualization': {
    	'licensed': true,
        'plugins': {
            'element': [
                'googlemap',
            ],
        	'visualization': [
        		'fullcalendar',
        		'googlemap',
        	],
	    },
        'modules': [
	        {
	            'name'    : 'Fabrik Admin Visualization Module',
	            'path'    : 'administrator/modules/mod_fabrik_visualization',
	            'fileName': 'mod_fabrik_admin_visualization_{version}.zip',
	            'element' : 'mod_fabrik_visualization',
	            'xmlFile' : 'mod_fabrik_visualization.xml',
	            'client'  : 'administrator'
	        },
	    ],
    },
    'user': {
    	'licensed': true,
        'plugins': {
        	'element': [
        		'access',
        		'ip',
        		'password',
        		'usergroup',
        		'viewlevel',
        		],
        	'form': [
        		'juser',
        		'sms',
        		],
        	'validationrule': [
        		'emailexists',
        		'userexists',
        		],
        	},
    },
    'social': {
    	'licensed': true,
        'plugins': {
        	'element': [
        		'fbcomment',
        		'fblike',
        		'thumbs',
        		'youtube',
        	]	,
        	'form': [
        		'comment',
        		'kunena',
        		'mailchimp',
        		'mailgun',
        		'twitter',
        		'zoom',
        		],
        	},
        'community': [
            {
                'name'    : 'JSocial: Fabrik User Plugin',
                'path'    : 'plugins/community/fabrik',
                'fileName': 'plg_jsocial_fabrik_{version}.zip',
                'element' : 'fabrik',
                'group'   : 'community',
                'xmlFile' : 'fabrik.xml'
            },
	    ],
    },
    'validation': {
    	'licensed': true,
        'plugins': {
        	'validationrule': [
        		'areuniquevalues',
        		'isalphanumeric',
        		'isemail',
        		'isgreaterorlessthan',
        		'isiban',
        		],
    	},
	},
    'sink': {
    	'licensed': true,
        'plugins': {
        	'element': [
        		'digsig',
        		'sequence',
        		'slider',
        		],
        	'list': [
        		'link',
        		'order',
        		],
	    },
    }
}
