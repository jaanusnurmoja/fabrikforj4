var path = require("path"),
	fs = require("fs-extra"),
	sh = require('shelljs');
	libxmljs = require('libxmljs'),
	xmlFormat = require('xml-formatter'),
	rimraf = require('rimraf');

module.exports = function (grunt) {

	grunt.registerTask('default', function() {
		var testing = false;

		grunt.config = grunt.file.readJSON(__dirname + '/config.json');

		/* Make sure the build dir is wiped */
		var buildDir = __dirname + '/' + grunt.config.buildDir;
		var proCloneDir = buildDir + '/' + grunt.config.proCloneDir;
		var pubCloneDir = buildDir + '/' + grunt.config.pubCloneDir;
		var proCloneRepoDir = proCloneDir + '/' + grunt.config.proFabrikRepoName;
		var pubCloneRepoDir = pubCloneDir + '/' + grunt.config.pubFabrikRepoName;
		var cdProCloneRepoDir = 'cd ' + proCloneRepoDir;
		var cdPubCloneRepoDir = 'cd ' + pubCloneRepoDir;

		if (!testing) {
			console.log("Wiping the build directory");
			rimraf.sync(buildDir);
			fs.ensureDirSync(buildDir);
		}


		/* Now build our clone directories */
		if (!testing) {
			console.log("Making the clone directories");
			fs.mkdirSync(proCloneDir);
			fs.mkdirSync(pubCloneDir);
		}

		/* Clone the production repo */
		var cdProCloneDir = 'cd ' + proCloneDir;
		if (!testing) { 
			sh.exec(cdProCloneDir + '; git clone -b '  + grunt.config.proFabrikBranch + ' --single-branch ' + grunt.config.proFabrikRepo + '; ');
		}

		/* Clone the public repo */
		if (!testing) {
			console.log("Cloning public repo");
			rimraf.sync(pubCloneDir);
			fs.mkdirSync(pubCloneDir);
			sh.exec('cd ' + pubCloneDir + '; git clone -b '  + grunt.config.pubFabrikBranch + ' --single-branch ' + grunt.config.pubFabrikRepo + '; ');
			/* Set the clones email address */
			sh.exec(cdPubCloneRepoDir + '; git config user.email ' + grunt.config.pubEmail + '; ');
		}

		/* OK it's now safe to do stuff */
		/* Now lets filter out everything we don't want */
		if (!testing) {
			console.log('Now filtering out what we don"t want from proClone');
			sh.exec(cdProCloneRepoDir + '; git filter-repo --invert-paths --paths-from-file ' + __dirname + '/exclusions.txt');
		}

		/* Remove the link to the origin */
		/** filter-repo does this automatically **/

		if (!testing) {
			console.log('Cleaning unwanted data from proClone, this takes a while');
			sh.exec(cdProCloneRepoDir + '; git reset --hard; git gc --aggressive; git prune; git clean -fd;');
		}

		/* Before we go any further, let's compare the last commits, if they are the same we can bail */
		grunt.config.proGitDate = (sh.exec(cdProCloneRepoDir + ';git log -1 --format="%at" | xargs -I{} date -d @{} +%Y/%m/%d', {silent:true})).stdout.slice(0,-1);
		/* We need to skip the first commit in the public repo as that one updates the gitdate in the xml, something that doesn't get pushed to production */
		grunt.config.pubGitDate = (sh.exec(cdPubCloneRepoDir + ';git log -1 --skip=1 --format="%at" | xargs -I{} date -d @{} +%Y/%m/%d', {silent:true})).stdout.slice(0,-1);

		if (grunt.config.GitDproGitDateate == grunt.config.pubGitDate) {
			console.log("No changes since last update. Done");
			return;
		}

		if (!testing) {
			console.log("Renaming proClone branch to master");
			sh.exec(cdProCloneRepoDir + '; git branch -m ' + grunt.config.proFabrikBranch + ' ' + grunt.config.pubFabrikBranch);
		}
return;
		if (!testing) {
			console.log("Cleaning the pubClone");
			sh.exec(cdPubCloneRepoDir + '; git rm -r -q *;');
			sh.exec(cdPubCloneRepoDir + '; git add -u; git commit -q -m "purged"');
			sh.exec(cdPubCloneRepoDir + '; git push -q');
		}

		if (!testing) {
			console.log("Creating remote connection to proClone");
			sh.exec(cdPubCloneRepoDir + '; git remote add proClone ' + proCloneRepoDir + ';');
		}

		if (!testing) {
			console.log("Updating pubClone with filtered proClone");
			sh.exec(cdPubCloneRepoDir + '; git fetch proClone master; git reset --hard proClone/master');
		}


		if (!testing) {
			console.log("Updating the component xml with the latest commit hash");
			let xmlFile = pubCloneRepoDir + '/administrator/components/com_fabrik/fabrik.xml';
			let compXmlDoc = libxmljs.parseXml(fs.readFileSync(xmlFile));
			let versionNode = compXmlDoc.get('//version');
			let gitdateNode = compXmlDoc.get('//gitdate');
			if (!gitdateNode) {
				gitdateNode = new libxmljs.Element(compXmlDoc, 'gitdate');
				versionNode.addNextSibling(gitdateNode);
			}
			gitdateNode.text(grunt.config.proGitDate);

			/* Write out the updated file */
		    fs.writeFileSync(xmlFile, xmlFormat(compXmlDoc.toString(), {collapseContent:true}));
		    /* And push the xml change to the repo */
			sh.exec(cdPubCloneRepoDir + '; git add -u; git commit -m "updated xml with commit"; git push -f;');
		}

		if (!testing) {
			console.log("Removing remote connection and pushing to public repo");
			sh.exec(cdPubCloneRepoDir + '; git remote remove proClone; git push -f;');
		}

		console.log('done');
	})
}