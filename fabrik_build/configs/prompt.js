module.exports = {
  "target": {
    "options": {
      "questions": [
        {
          "config": "pkg.version",
          "type": "input",
          "message": "Fabrik version:",
          "default": "4.0Epsilon"
        },
        {
          "config": "jversion",
          "type": "input",
          "message": "Joomla target version #",
          "default": "4.[0123456789]"
        },
        {
          "config": "updateserver",
          "type": "input",
          "message": "override update server address",
          "default": "https://skurvishenterprises.com/"
        },
        {
          "config": "upload.zips",
          "type": "confirm",
          "message": "Upload Zips to update server?",
          "default": false
        },
        {
          "config": "upload.xml",
          "type": "confirm",
          "message": "Upload update XML files to update server?",
          "default": false
        }
      ]
    }
  }
};
