// TODO: switch to standard for UI5 Tooling module (log, config ...)
module.exports = function({
  resources,
  options
}) {
  const fs = require('fs');
  const httpProxy = require('http-proxy');
  const proxy = new httpProxy.createProxyServer();

  const settings = fs.readFileSync('./utils/backend.json');
  const credentials = fs.readFileSync('./utils/auth.json');
  const userdata = JSON.parse(credentials);
  const routing = JSON.parse(settings);
  routing.auth = userdata.user + ':' + userdata.password;
  // TODO: add settings and deletre route
  if (routing.sap.secure === false) {
    proxy.on('proxyRes', function(proxyRes, req, res) {
      const sc = proxyRes.headers['set-cookie'];
      if (Array.isArray(sc)) {
        proxyRes.headers['set-cookie'] = sc.map(sc => {
          return sc.split(';')
            .filter(v => v.trim().toLowerCase() !== 'secure')
            .join('; ');
        });
      }
    });
  }

  return function(req, res, next) {
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.header(200);
      // TODO: add log level
      // console.log(req.method + '(options): ' + req.url);
      next();
      return;
    }
    // get root directory name eg sdk, app, sap
    var dirname = req.url.replace(/^\/([^\/]*).*$/, '$1'); 
    // standard
    if (!routing[dirname]) {
      // TODO: add log level
      // console.log(req.method + ': ' + req.url + ' - ' + dirname);
      next();
    } else {
      // TODO: add log level
      // console.log(req.method + ' (redirect): ' + dirname + req.url);
      proxy.web(req, res, routing[dirname], function(err) {
        if (err) {
          next(err);
        }
      });
    }
  }
};