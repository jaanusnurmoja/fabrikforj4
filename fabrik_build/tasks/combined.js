/* Stub task to set the requested package (based on task name) for the runbuild task */
/* This is a bit special as it will make a package of everything in one */
module.exports = function (grunt) {
	grunt.registerTask('combined', function() {
		var combinedPackage = {
				'plugins' : {'element' : [], 'form' : [], 'validationrule' : [], 'list' : [], 'cron' : [], 'visualization' : []},
				'jplugins' : [],
				'libraries' : [],
				'modules' : [],
				'component' : ''
		};

		/* Run through all the independant packages and combine everything */
		var packages = grunt.config.get('packages');
		Object.keys(packages).forEach((package) => {
			if (package.includes('//')) return;
			var packageParts = packages[package];
			Object.keys(packageParts).forEach((packagePart) => { 
				switch (packagePart) {
				case 'plugins':
					var plugins = packages[package]['plugins'];
					Object.keys(plugins).forEach((pluginType) => {
						pluginEls = packages[package]['plugins'][pluginType];
						pluginEls.forEach((plugin) => {
							combinedPackage['plugins'][pluginType].push(plugin);
						});
					});
					break;
				case 'jplugins':
				case 'libraries':
				case 'modules':
					var parts = packages[package][packagePart];
					Object.keys(parts).forEach((part) => {
						combinedPackage[packagePart].push(packages[package][packagePart][part]);
					});
					break;
				case 'component':
					combinedPackage[packagePart] = packages[package][packagePart];
				default:
					break;
				}
			});
		});

		/* And we will use the core manifest file */
		combinedPackage['manifest'] = 'pkg_fabrik_core.manifest.class.php'

		grunt.config.set('packages', {'combined' : combinedPackage});
		grunt.config.set('packagesToBuild', ['combined']);
		grunt.task.run('prompt', 'runbuild');
	});

}