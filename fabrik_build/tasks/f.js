var libxmljs = require('libxmljs'),
    fs = require('fs-extra'),
    moment = require('moment'),
    path = require("path"),
    AdmZip = require("adm-zip");


/**
 * Build a zip
 * @param source
 * @param dest
 * @return promise
 */
function zipPlugin (source, dest) { 
	zip = new AdmZip;
    zip.addLocalFolder(source);
	zip.writeZip(dest);
	console.log('Created '+path.basename(dest)+' successfully');
};

/* Read a directory and sort the items alphabetically, first by directory and then by file */
function sortDir(dir) {
    var dirs = [], files = [];
    (fs.readdirSync(dir)).forEach((item => {
        fs.statSync(dir + item).isDirectory() ? dirs.push(item) : files.push(item);
    }));
    return dirs.sort().concat(files.sort());
}

/* Simpler function to copy a directory excluding any zip files or symbolic links */
function copyDirFiltered(src, dest) {
    fs.copySync(src, dest, {
        'filter': function (f) {
            if (f.indexOf('.zip') !== -1) {
                return false;
            }
            var stat = fs.lstatSync(f);
            return !stat.isSymbolicLink(f);
        }
    });

}

/* Function to recursively copy a directory, excluding any symlinked directories */
function copyDir(src, dest) { 
	var dirStat = fs.lstatSync(src);
	if (dirStat.isSymbolicLink(src)) return;
	fs.mkdirsSync(dest);
	let items = fs.readdirSync(src);
	for (let item of items) {
		let srcPath = path.join(src, item);
		let itemStat = fs.lstatSync(srcPath);
		if (!itemStat.isSymbolicLink(srcPath)) {
			let destPath = path.join(dest, item);
			if (itemStat.isDirectory()) {
				copyDir(srcPath, destPath);
			} else {
				fs.copySync(srcPath, destPath);
			}
		}
	}
}

var updateNodeIfExists = function(xmlDoc, nodeTxt, value) {
    let node = xmlDoc.get(nodeTxt);
    if (node) {
        node.text(value);
    }
}
/**
 * Update Fabrik plugin/component/module XML file properties using a buffer
 * @param fileBuffer
 * @param grunt
 */
var updateXML = function(xml, grunt) {

    var version = grunt.config.get('pkg.version');
    var date = new Date();

    var createDate = moment().format('MMMM YYYY');
    xmlDoc = libxmljs.parseXmlString(xml.toString());
    updateNodeIfExists(xmlDoc, '//creationDate', createDate);
    updateNodeIfExists(xmlDoc, '//copyright', 'Copyright (C) 2005-' + date.getFullYear() + ' Fabrikar - All rights reserved.');
    updateNodeIfExists(xmlDoc, '//license', 'GNU General Public License version 3 or later; see software_license.txt');
    updateNodeIfExists(xmlDoc, '//version', version);
    updateNodeIfExists(xmlDoc, '//author', 'Fabrikar');
    updateNodeIfExists(xmlDoc, '//authorEmail', 'team@fabrikar.com');
    updateNodeIfExists(xmlDoc, '//authorUrl', 'https://www.fabrikar.com');
    updateNodeIfExists(xmlDoc, '//url', 'https://www.fabrikar.com');
    updateNodeIfExists(xmlDoc, '//packagerurl', 'https://www.fabrikar.com');
    updateNodeIfExists(xmlDoc, '//packager', "Fabrikar");
    updateNodeIfExists(xmlDoc, '//commit', grunt.config.commit);

    var xmlType = '//extension';
    var ext = xmlDoc.get(xmlType);
    if (typeof ext == 'undefined') {
        /* Might be the cb plugin */
        xmlType = '//cbinstall';
        ext = xmlDoc.get(xmlType);
        if (typeof ext == 'undefined') return;
    }
    var attrs = ext.attrs();
    var newAttrs = {}
    for (var i = 0; i < attrs.length; i++) {
        k = attrs[i].name();
        var v = attrs[i].value();
        newAttrs[k] = v;
    }
    newAttrs.version = grunt.config.get('jversion')[0];
    xmlDoc.get(xmlType).attr(newAttrs);

    return xmlDoc.toString();
}

/**
 * Update Fabrik plugin/component/module XML file properties reading and writing the file
 * @param path
 * @param grunt
 */
var updateAFile = function (filePath, grunt) {

    try {
        if (!fs.statSync(filePath).isFile()) {
            console.log('not a file');
            return;
        }
        var xml = fs.readFileSync(filePath);

        console.log('--- updateAFile: ' + filePath);

        xml = updateXML(xml, grunt);

        try {
            fs.writeFileSync(filePath, xml);
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }
};

module.exports = { copyDir, zipPlugin, updateXML, updateAFile, sortDir, copyDirFiltered };