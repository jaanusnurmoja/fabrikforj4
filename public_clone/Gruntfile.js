var path = require("path"),
	fs = require("fs-extra"),
	sg = require('simple-git'),
	sh = require('shelljs');
	rimraf = require('rimraf');

module.exports = function (grunt) {

	grunt.registerTask('default', async function() {
		var testing = true;

		grunt.config = grunt.file.readJSON(__dirname + '/config.json');

		/* Make sure the build dir is wiped */
		var buildDir = process.env.HOME + '/' + grunt.config.buildDir;

		if (!testing) {
			console.log("Wiping the build directory");
			rimraf.sync(buildDir);
			fs.ensureDirSync(buildDir);
		}

		var proCloneDir = buildDir + '/' + grunt.config.proCloneDir;
		var pubCloneDir = buildDir + '/' + grunt.config.pubCloneDir;
		var proCloneRepoDir = proCloneDir + '/' + grunt.config.proFabrikRepoName;
		var pubCloneRepoDir = pubCloneDir + '/' + grunt.config.pubFabrikRepoName;

		/* Now build our clone directories */
		if (!testing) {
			console.log("Making the clone directories");
			fs.mkdirSync(proCloneDir);
			fs.mkdirSync(pubCloneDir);
		}
//const debug = require('debug');
//debug.enable('simple-git,simple-git:*');

		/* Clone the production repo */
//		var proGit = require('simple-git')({config : ['authorization: token R4eteDHKNAngMsM3LfQa']});
//		console.log('repo: ' + grunt.config.proFabrikRepo + ' cloneDir: ' + proCloneDir);
		var cdProCloneDir = 'cd ' + proCloneDir;
		if (!testing) { 
/*			
			try {
				await proGit.clone(grunt.config.proFabrikRepo, proCloneDir, ['--single-branch', 'master']).then((val)=> {
					console.log('clone done');});
			} catch (error) {
				console.log(error);
			}
*/			
			sh.exec(cdProCloneDir + '; git clone -b '  + grunt.config.proFabrikBranch + ' --single-branch ' + grunt.config.proFabrikRepo + '; ');
		}

		/* Remove the link to the origin */
		if (!testing) {
			console.log('Unlinking from origin');
			sh.exec(cdProCloneRepoDir + '; git remote rm origin');
		}

		/* OK it's now safe to do stuff */
		var cdProCloneRepoDir = 'cd ' + proCloneRepoDir;
		/* Now lets filter out everything we don't want */
		if (!testing) {
			console.log('Now filtering out what we don"t want');
			sh.exec(cdProCloneRepoDir + '; git filter-repo --invert-paths --paths-from-file ' + __dirname + '/exclusions.txt');
		}

		if (!testing) {
			console.log('Cleaning unwanted data, this takes a while');
			sh.exec(cdProCloneRepoDir + '; git reset --hard; git gc --aggressive; git prune; git clean -fd;');
		}

		if (!testing) {
			console.log("Renaming branch to master");
			sh.exec(cdProCloneRepoDir + '; git branch -m ' + grunt.config.proFabrikBranch + ' ' + grunt.config.pubFabrikBranch);
		}

		/* Copy the proClone to a staging directory */
		var stagingDir = buildDir + '/' + grunt.config.stagingDir;
		var stagingDirRepo = stagingDir + '/' + grunt.config.proFabrikRepoName; 
		if (!testing) {
			console.log("Copying repo to staging directory");
			rimraf.sync(stagingDir);
			fs.mkdirSync(stagingDir);
			fs.copySync(proCloneRepoDir, stagingDirRepo);
		}


		/* Now add the changes and commit them */
		if (1 | !testing) {
			console.log("Committing the changes");
			sh.exec(stagingDirRepo + '; git add .; git commit -m "public";');
		}

		/* Now lets clone the destination repo */
		/* Clone the production repo */
		var cdPubCloneDir = 'cd ' + pubCloneDir;
		if (!testing) {
			sh.exec(cdPubCloneDir + '; git clone -b '  + grunt.config.pubFabrikBranch + ' --single-branch ' + grunt.config.pubFabrikRepo + '; ');
		}

		var cdPubCloneRepoDir = 'cd ' + pubCloneRepoDir;
		if (!testing) {
			console.log("Cleaning the public repo");
			sh.exec(cdPubCloneRepoDir + '; git rm -r *;');
		}

		if (!testing) {
			console.log("Creating remote connection to proClone");
			sh.exec(cdPubCloneRepoDir + '; git remote add proClone ' + proCloneRepoDir + ';');
		}

		if (!testing) {
			console.log("Pulling proClone into pubClone");
			sh.exec(cdPubCloneRepoDir + '; git pull proClone master --allow-unrelated-histories;');
		}

		if (!testing) {
			console.log("Removing remote connection and pushing to public repo");
			sh.exec(cdPubCloneRepoDir + '; git remote remove proClone; git push;');
		}
		
		console.log('done');
	})
}