/* This will linkr or unlink the repo to the web server */
module.exports = function (grunt) {
	grunt.registerTask('linker', function() {
		grunt.config.set('prompt', 
			{
			  	"target": {
			    	"options": {
			      		"questions": [
			        		{
			          			"config": "pleasedo",
			          			"type": "input",
			          			"message": "To link or unlink:",
			          			"default": "link"
			        		},
			        		{
			          			"config": "webroot",
			          			"type": "input",
			          			"message": "Location of your web root:",
			          			"default": "/var/www/html"
			        		},
			        		{
			          			"config": "admintmpl",
			          			"type": "input",
			          			"message": "Admin template in use:",
			          			"default": "atum"
			        		},
			        	]
			  		}
				}
			});
		grunt.task.run('prompt', 'linkProcess');
	});

	/* Task to perform the linking or unlinking*/
	grunt.registerTask('linkProcess', function() {
		var f = require("./f.js"),
		    fs = require('fs-extra')
    		rimraf = require('rimraf'),
		    pleasedo = grunt.config.get('pleasedo'),
		    webroot = grunt.config.get('webroot'),
		    admintmpl = grunt.config.get('admintmpl'),
		    projectDir = grunt.config.get('projectDir'),
		    linkerConfig = grunt.config.get('linker');
		const { exec } = require("child_process");

		Object.keys(linkerConfig).forEach((task) => {
			switch(task) {
			case 'targetDirectories': 
				let targetDirectories = linkerConfig[task];
				targetDirectories.forEach((targetDirectory) => {
					if (targetDirectory.includes('//') !== false) return;
					let repo = projectDir + targetDirectory;
					let web = webroot + '/' + targetDirectory;
					/* delete the target in the web first */
					fs.removeSync(web);
					pleasedo == 'link' ? exec(process.platform === 'win32' ? "mklink "+web+" "+repo : "ln -s "+repo+" "+web) : fs.copySync(repo, web);
				})
				break;
			case 'targetPluginTypes': 
				Object.keys(linkerConfig[task]).forEach((targetPluginType) => {
					if (targetPluginType.includes('//') !== false) return;
					(linkerConfig[task][targetPluginType]).forEach((targetPlugin) => {
						let repo = projectDir + targetPluginType + '/' + targetPlugin;
						let web = webroot + '/' +  targetPluginType + '/' + targetPlugin;
						/* delete the target in the web first */
						fs.removeSync(web);
						pleasedo == 'link' ? exec(process.platform === 'win32' ? "mklink "+web+" "+repo : "ln -s "+repo+" "+web) 
											: fs.copySync(repo, web);
					})
				});
				break;
			case 'targetLibraries': 
				Object.keys(linkerConfig[task]).forEach((targetLibrary) => {
					if (targetLibrary.includes('//') !== false) return;
					let repo = projectDir + 'libraries/fabrik/' + targetLibrary;
					let web = webroot + '/libraries/fabrik/' + targetLibrary
					/* delete the target in the web first */
					fs.emptyDirSync(web);
					switch (pleasedo) {
					case 'link':
						/* Link the library folder */
						exec(process.platform === 'win32' ? "mklink "+web+"/"+targetLibrary+" "+repo : "ln -s "+repo+" "+web+"/"+targetLibrary);
						/* Link the specific items */
						Object.keys(linkerConfig[task][targetLibrary]).forEach((specialFile) => {
							let webFile = web+"/"+linkerConfig[task][targetLibrary][specialFile];
							let repoFile = repo+"/"+specialFile;
							exec(process.platform === 'win32' ? "mklink "+webFile+" "+repoFile : "ln -s "+repoFile+" "+webFile);
						});
						break;
					case "unlink":
						/* Copy the library folder */
						fs.copySync(repo, web+"/"+targetLibrary);
						/* Copy the specific items */
						Object.keys(linkerConfig[task][targetLibrary]).forEach((specialFile) => {
							let webFile = web+"/"+linkerConfig[task][targetLibrary][specialFile];
							let repoFile = repo+"/"+specialFile;
							fs.copySync(repoFile, webFile);
						});
						break;
					}
				});
				break;
			case 'adminTemplOverrides': 
				Object.keys(linkerConfig[task]).forEach((override) => {
					let repo = projectDir + override;
					let web = (webroot + '/' + linkerConfig[task][override]).replace("{admintmpl}", admintmpl);
					/* delete the target in the web first */
					fs.unlinkSync(web);
					if (pleasedo == 'link') {
						exec(process.platform === 'win32' ? "mklink "+web+" "+repo : "ln -s "+repo+" "+web)
					} 
					/* For unlink all we do it delete it */
				})
				break;
			case 'targetSubDirectories': 
				(linkerConfig[task]).forEach((targetSubDirectory) => {
					if (targetSubDirectory.includes('//') !== false) return;
					let source = projectDir + targetSubDirectory;
					let items = fs.readdirSync(source);
					items.forEach((item) => {
						let repo = source + "/" + item;
						let web = webroot + "/" + targetSubDirectory + "/" + item;
						rimraf.sync(web);
						pleasedo == 'link' ? exec(process.platform === 'win32' ? "mklink "+web+" "+repo : "ln -s "+repo+" "+web) 
											: fs.copySync(repo, web);
					});
				});

			}
		})
	});
}

