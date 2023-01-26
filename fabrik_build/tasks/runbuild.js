/* This is the heart of the build system, runs various processes on one or more packages */

var f = require("./f.js"),
    path = require("path"),
    fs = require('fs-extra'),
    rimraf = require('rimraf'),
	libxmljs = require('libxmljs'),
	xmlFormat = require('xml-formatter'),
    licenseFiles = ['README.md', 'software_license.txt', 'contribution_license.txt'];

module.exports = function (grunt) {
	grunt.registerTask('runbuild', function() {
		/* The requested task will be in the grunt params, it tells us what to run */
		var packages = grunt.config.get('packages'),
			packagesToBuild = grunt.config.get('packagesToBuild'),
			version = grunt.config.get('pkg.version'),
			buildDir = grunt.config.get('buildDir'),
			projectDir = grunt.config.get('projectDir'),
			outputDir = buildDir + 'output/packages/';

		/* Make the output directory if it does not already exist */
		fs.mkdirsSync(outputDir);

		packagesToBuild.forEach((packageName) => {
			/* Create the package output directory */
			var package = packages[packageName],
				packageDir = outputDir + packageName + '/';
			rimraf.sync(packageDir);
			fs.mkdirsSync(packageDir);

			/* Copy over the generic package xmlfile file and update the version # etc. */
			var packageXml = f.updateXML(fs.readFileSync(buildDir+'package.xml'), grunt);
			/* Do our special substitutions */
			if (packageName != 'php') {
				packageXml = packageXml.replace(/{Type}/g, packageName.charAt(0).toUpperCase() + packageName.slice(1));
				packageXml = packageXml.replace(/{type}/g, packageName);
			} else {
				packageXml = packageXml.replace(/{Type}/g, 'PHP');
				packageXml = packageXml.replace(/{type}/g, 'php');

			}
			var	xmlDoc = libxmljs.parseXmlString(packageXml);
			var xmlFiles = xmlDoc.get("//files");
			var xmlFilename = 'pkg_fabrik_'+packageName+'_'+version+'.xml';

			/* Copy over the license files */
			licenseFiles.forEach((licenseFile) => {
				fs.copySync(projectDir+licenseFile, packageDir+licenseFile);
			});

			/* Now lets run through all the parts of the package, update the xmls files and zip them up */
			var packageParts = Object.keys(package);
			packageParts.forEach((packagePart) => {
				switch (packagePart) {
				case 'licensed':
					break;
				case 'manifest':
					/* Copy the manifest to the package */
					fs.copySync(buildDir+packages[packageName].manifest, packageDir+packages[packageName].manifest);
					/* Add it to the manifest */
					var xmlExtension = xmlDoc.get("//extension");
					var node = libxmljs.Element(xmlDoc, 'scriptfile');
					node.text(packages[packageName].manifest);
					xmlExtension.addChild(node);
					break;
				case 'component':
					/* This gets a little tricky as the repo is in J! file structure but the manifest is in standard component structure */
					/* Clear and create the compnent directory */
					var compDir = outputDir + '/component/';
					var compSiteDir = compDir + 'site/';
					var compAdminDir = compDir + 'admin/';
					rimraf.sync(compDir);
					fs.mkdirsSync(compDir);
					fs.mkdirsSync(compSiteDir);
					fs.mkdirsSync(compAdminDir);
					fs.copySync(projectDir + 'administrator/components/com_fabrik/', compAdminDir, {
						'filter': function (f) {
							//console.log('admin file: ' + f);
							if (f.indexOf('\\com_fabrik\\update\\') !== -1) {
								console.log('*********' + f);
								return false;
							}
							if (f.indexOf('.zip') !== -1) {
								return false;
							}
							var stat = fs.lstatSync(f);
							return !stat.isSymbolicLink(f);
						}
					});
					fs.copySync(projectDir + 'components/com_fabrik/', compSiteDir, {
						'filter': function (f) {
							if (f.indexOf('.zip') !== -1) {
								return false;
							}
							var stat = fs.lstatSync(f);
							return !stat.isSymbolicLink(f);
						}
					});
					fs.copySync(projectDir + 'media/com_fabrik/', compDir +'media/com_fabrik', {
						'filter': function (f) {
							return f.indexOf('.zip') === -1;
						}
					});
					fs.moveSync(compAdminDir +'fabrik.xml', compDir + 'fabrik.xml');
					f.zipPlugin(compDir, packageDir + packages[packageName].component.replace('{version}', version));
					rimraf.sync(compDir);
					console.log('--Component build complete')					;
					break;
				/* the following are somewhat repetitious, but there are enough differences that combining them would be clumsy */					
				case 'plugins': 
					var pluginTypes = Object.keys(package[packagePart]);
					pluginTypes.forEach((pluginType) => {
						var plugins = package[packagePart][pluginType];
						plugins.forEach((plugin) => {
							var pluginPath = projectDir + 'plugins/fabrik_' + pluginType + '/' + plugin + '/'; 
							var pluginFileName = 'plg_' + pluginType + '_' + plugin + '_' + version + '.zip';
							/* First lets update the plugin xml */
							f.updateAFile(pluginPath + plugin + '.xml', grunt);
							/* Now build the zip file */
							var pluginFileName = 'plg_fabrik_' + pluginType + '_' + plugin + '_' + version + '.zip';
							f.zipPlugin(pluginPath, packageDir + pluginFileName);
							/* Add the plugin to the files in the package xml */
							var node = libxmljs.Element(xmlDoc, 'file');
							node.attr({'group':'fabrik_'+pluginType, 'id':plugin, 'type':'plugin'});
							node.text(pluginFileName);
							xmlFiles.addChild(node);
						})
					});
					break;
				case 'jplugins':
				case 'community':
					package[packagePart].forEach((plugin) => {
						var pluginPath = projectDir + plugin.path + '/';
						/* First lets update the plugin xml */
						f.updateAFile(pluginPath + plugin.xmlFile, grunt);
						/* Now build the zip file */
						var pluginFileName = plugin.fileName.replace('{version}', version);
						f.zipPlugin(pluginPath, packageDir + pluginFileName);
						/* Add the plugin to the files in the package xml */
						var node = libxmljs.Element(xmlDoc, 'file');
						node.attr({'group':plugin.group, 'id':plugin.element, 'type':'plugin'});
						node.text(pluginFileName);
						xmlFiles.addChild(node);
					});
					break;
				case 'modules':
					package[packagePart].forEach((module) => {
						var modulePath = projectDir + module.path + '/';
						/* First lets update the plugin xml */
						f.updateAFile(modulePath + module.xmlFile, grunt);
						/* Now build the zip file */
						var moduleFileName = module.fileName.replace('{version}', version);
						f.zipPlugin(modulePath, packageDir + moduleFileName);
						/* Add the plugin to the files in the package xml */
						var node = libxmljs.Element(xmlDoc, 'file');
						node.attr({'client':module.client, 'id':module.element, 'type':'module'});
						node.text(moduleFileName);
						xmlFiles.addChild(node);
					});
					break;
				case 'libraries':
					package[packagePart].forEach((library) => {
						var libraryPath = projectDir + library.path + '/';
						/* First lets update the library xml */
						f.updateAFile(libraryPath + library.xmlFile, grunt);
						/* Now build the zip file */
						var libraryFileName = library.fileName.replace('{version}', version);
						f.zipPlugin(libraryPath, packageDir + libraryFileName);
						/* Add the library to the files in the package xml */
						var node = libxmljs.Element(xmlDoc, 'file');
						node.attr({'id':library.element, 'type':'library'});
						node.text(libraryFileName);
						xmlFiles.addChild(node);
					});
					break;

				}
			});
			/* Write out the package xml */
	        fs.writeFileSync(packageDir+xmlFilename, xmlFormat(xmlDoc.toString(), {collapseContent:true}));
	        /* Now create the package itself */
			f.zipPlugin(packageDir, outputDir + 'pkg_fabrik_' + packageName + '_' + version + '.zip');
		});
	});
};
