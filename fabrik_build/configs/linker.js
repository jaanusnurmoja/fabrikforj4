module.exports = {
	'targetDirectories' : [
	        'administrator/components/com_fabrik',
	        'components/com_fabrik',
	        'plugins/system/fabrik',
	        'plugins/content/fabrik',
	        'media/com_fabrik'
	],
	'targetSubDirectories' : [
		        'administrator/modules',
		        'modules'
	],
	'targetPluginTypes' : {
	        'plugins/community/fabrik' : [],
	        'plugins/fabrik_cron' : ['email', 'php'],
	        'plugins/fabrik_element' : ['access', 'birthday', 'button', 'calc', 'captcha', 'cascadingdropdown', 'checkbox', 'colourpicker',
        		'databasejoin', 'date', 'digsig', 'display', 'dropdown', 'field', 'fileupload', 'folder', 'googlemap', 'image', 
        		'internalid', 'ip', 'jdate', 'link', 'lockrow', 'password', 'picklist', 'radiobutton', 'sequence', 'slider',
                	'textarea', 'thumbs', 'time', 'timer', 'timestamp', 'total', 'user', 'usergroup', 'viewlevel', 'yesno'],
	        'plugins/fabrik_form' : ['autofill', 'comment', 'email', 'juser', 'php', 'receipt', 'redirect'],
	        'plugins/fabrik_list' : ['candeleterow', 'caneditrow', 'canviewrow', 'copy', 'js', 'link', 'lockrow', 'order', 'php', 'update_col'],
	        'plugins/fabrik_validationrule' : ['areuniquevalues', 'emailexists', 'isalphanumeric', 'isemail', 'isgreaterorlessthan',
	                'isiban', 'isnot', 'isnumeric', 'isuniquevalue', 'notempty', 'php'],
	        'plugins/fabrik_visualization' : ['fullcalendar', 'googlemap']
	},
	'targetLibraries' : {
		'fabrik' : {'fabrik.xml' : 'fabrik.xml', 'include.php' : 'include.php'}, 
		'vendor' : {'vendor.xml' : 'vendor.xml'}, 
		'//libs' : {}
	},
	'adminTemplOverrides' : {
		'administrator/components/com_fabrik/overrides/joomla/edit/params.php'  
				: 'administrator/templates/{admintmpl}/html/layouts/joomla/edit/params.php', 
		'administrator/components/com_fabrik/overrides/joomla/form/field/list.php'
				: 'administrator/templates/{admintmpl}/html/layouts/joomla/form/field/list.php'
		}
}
