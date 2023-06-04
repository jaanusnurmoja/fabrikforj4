module.exports = {
    'core': {
    	'licensed': false,
        'manifest': 'pkg_fabrik.manifest.class.php',
        'plugins': {
        	'element': ['checkbox','databasejoin','date','display','dropdown',
    			'field','internalid','jdate', 'picklist', 'radiobutton','textarea','user','yesno'],
        	'form': ['email','redirect'],
        	'list': ['candeleterow','caneditrow','canviewrow','copy', 'email'],
        	'validationrule': ['isnot','isnumeric','isuniquevalue','notempty'],
			},
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
        'component': 'com_fabrik_{version}.zip',
        'libraries': [
            {
                'name'    : 'Fabrik Library',
                'libname' : 'lib_fabrik_fabrik',
                'path'    : 'libraries/fabrik/fabrik',
                'fileName': 'lib_fabrik_fabrik{version}.zip',
                'element' : 'fabrik',
                'xmlFile' : 'fabrik.xml',
                'folders' : ['fabrik'],
                'files'   : [{'source' : 'include.php', 'dest' : '../include.php'},
                    {'source' : 'fabrik.xml', 'dest' : '../fabrik.xml'}]
            },
        ],
    },
    'libraries': {
        'licensed': true,
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
        'libraries': [
            {
                'name'    : 'Fabrik Libs Library',
                'libname' : 'lib_fabrik_libs',
                'path'    : 'libraries/fabrik/libs',
                'fileName': 'lib_fabrik_libs{version}.zip',
                'element' : 'libs',
                'xmlFile' : 'libs.xml',
                'folders' : ["libs"],
                'subfolders' : ['getid3', '//salesforce'],
                'files'   : [{'source' : 'libs.xml', 'dest' : '../libs.xml'}]
            },
            {
                'name'    : 'Fabrik Vendor Library',
                'libname' : 'lib_fabrik_vendor',
                'path'    : 'libraries/fabrik/vendor',
                'fileName': 'lib_fabrik_vendor{version}.zip',
                'element' : 'vendor',
                'xmlFile' : 'vendor.xml',
                'folders' : ['vendor'],
                'subfolders' : ['composer','dompdf', 'mpdf'],
                'purgefolders' : ['psr'],
                'files'   : [{'source' : 'composer.json', 'dest' : '../composer.json'},
                    {'source' : 'vendor.xml', 'dest' : '../vendor.xml'}]
            },
        ],
    },
    'php': {
    	'licensed': true,
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
        'plugins': {
        	'cron': ['email', 'geocode', 'importcsv', 'notification','php'],
        	'form': ['php', 'notification'],
        	'list': ['js','php','php_events'],
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
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
        		'//confirmation',
        		'consent',
        		'//ftp',
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
        '//plugins': {
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
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
        		'//sms',
        		],
        	'validationrule': [
        		'emailexists',
        		'userexists',
        		],
        	},
    },
    'social': {
    	'licensed': true,
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
        'plugins': {
        	'element': [
        		'//fbcomment',
        		'//fblike',
                'rating',
        		'thumbs',
        		'//youtube',
        	]	,
        	'form': [
        		'comment',
        		'//kunena',
        		'//mailchimp',
        		'//mailgun',
        		'//twitter',
        		'//zoom',
        		],
        	},
        '//community': [
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
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
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
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
    },
    '//pmnt': {
        'licensed': true,
        'manifest': 'pkg_fabrik_{type}.manifest.class.php',
        'plugins': {
            'form': [
                'stripe',
                'paypal'
                ]
        }
    }
}
