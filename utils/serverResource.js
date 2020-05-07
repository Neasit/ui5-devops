// TODO: switch to standard for UI5 Tooling module (log, config ...)
module.exports = function({
  resources,
  options
}) {
  const fs = require('fs');
  const serverStatic = require('serve-static');
  // TODO: mass resources in array
  const settings = fs.readFileSync('./utils/resource.json');
  const parsedSettings = JSON.parse(settings);

  const serverResource = serverStatic(parsedSettings.source, {
    fallthrough: parsedSettings.fallthrough,
  });

  return function(req, res, next) {
    // get root directory name eg sdk, app, sap
    var dirname = req.url.replace(/^\/([^\/]*).*$/, '$1');
    // standard
    if (dirname === 'resources') {
      // console.log(req.method + ': ' + req.url + ' - ' + dirname);
      serverResource(req, res, next);
    }
    else {
      next();
    }
  };
};