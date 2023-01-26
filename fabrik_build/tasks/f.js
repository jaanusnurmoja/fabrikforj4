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
    xmlDoc.get('//creationDate').text(createDate);
    xmlDoc.get('//copyright').text('Copyright (C) 2005-' + date.getFullYear() + ' Media A-Team, Inc. - All rights reserved.');
    xmlDoc.get('//version').text(version);

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

module.exports = { copyDir, zipPlugin, updateXML, updateAFile };