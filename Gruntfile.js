/*
    Base grunt script on PSL INT(PM) for build and deploy SAP UI5 Application
    version: 2.0
    1.1 - added ESLint, Server.js
    1.2 - added babel task and manage versions
    2.0 - move tools to npm package (grunt-tdevopsui5)
    author: T-Systems RUS, Andrey Danilin
*/
module.exports = function(grunt) {
  var fs = require('fs');
  var yaml = require('js-yaml');
  var process = require('process');
  var path = require('path');

  var oConfig = grunt.file.readJSON('gruntConfig.json');
  var oDeployConfig;
  if (grunt.file.exists('deployConfig.json')) {
    oDeployConfig = grunt.file.readJSON('deployConfig.json');
  }
  var oPkg = grunt.file.readJSON('package.json');
  var oServerInfo = {
    URL: '',
    Client: '',
  };
  var oDir = {
    src: 'webapp', // webapp - for app; src - for libs
    dest: 'dist',
    temp: 'temp',
    resourceDir: '<%= conf.ui5Path %>',
  };

  if (oDeployConfig) {
    let sSystem = oDeployConfig.WBRequest.slice(0, 3);
    if (sSystem) {
      oServerInfo.fullURL =
        oConfig.servers[sSystem].serverURL + ':' + oConfig.servers[sSystem].serverPort;
      oServerInfo.URL = oConfig.servers[sSystem].serverURL;
      oServerInfo.Client = oConfig.servers[sSystem].serverClient;
    }
  }

  var updateMTAVersion = function(Localgrunt, srcVersion, scrMTA) {
    var relativePath = path.relative(process.cwd(), srcVersion);
    var versionPath = srcVersion + '/version.json';
    relativePath = path.relative(process.cwd(), scrMTA);
    var mtaPath = scrMTA + '/mta.yaml';
    var sData = '{}';
    if (fs.existsSync(versionPath)) {
      sData = fs.readFileSync(versionPath, { encoding: 'utf-8' });
    }
    var oVersion = JSON.parse(sData);
    var sCurrentVersion =
      oVersion.current && oVersion.current.version ? oVersion.current.version : '0.0.1';
    var yamlContent;
    var yamlParsed;
    try {
      yamlContent = fs.readFileSync(mtaPath, { encoding: 'utf-8' });
      yamlParsed = yaml.safeLoad(yamlContent);
    } catch (e) {
      Localgrunt.log.writeln('Error by read mta.yaml');
      Localgrunt.log.writeln(e);
    }
    if (yamlParsed) {
      if (!yamlParsed.parameters) {
        yamlParsed.parameters = {};
      }
      yamlParsed.parameters['hcp-deployer-version'] = sCurrentVersion;
      if (yamlParsed.modules && yamlParsed.modules.length) {
        yamlParsed.modules.forEach(function(item) {
          if (!item.parameters) {
            item.parameters = {};
          }
          item.parameters.version = sCurrentVersion;
        });
      }

      yamlContent = yaml.safeDump(yamlParsed);
      fs.writeFileSync(mtaPath, yamlContent);
    }
    return true;
  };

  grunt.initConfig({
    pkg: oPkg,
    conf: oConfig,
    depConf: oDeployConfig,
    server: oServerInfo,

    dir: oDir,

    run: {
      options: {},
      mta_build: {
        exec: 'npm run mtabuild',
      },
    },

    tdevopsui5_build: {
      default: {
        options: {
          appName: '<%= pkg.name %>',
          // folders
          src: '<%= dir.src %>',
          dest: '<%= dir.dest %>',
          tmp: '<%= dir.temp %>',
          ui5Resource: '<%= dir.resourceDir %>',
          // options
          babel: true,
          // preload
          appIndex: '<%= conf.appIndex %>',
          ui5version: '<%= conf.ui5version %>',
          library: false,
          lib_comp: false,
          lib_to_resources: false,
          customOptions: {}, // not used for now
        },
      },
    },

    tdevopsui5_version: {
      options: {
        dest: '<%= dir.src %>',
        user: '<%= depConf.user %>',
        transport: '<%= depConf.WBRequest %>',
      },
      dev: {
        options: {
          type: 'D',
          tag: false,
          tagText: '',
          note: 'Small fix (micro version)',
        },
      },
      main: {
        options: {
          type: 'M',
          tag: false,
          tagText: '',
          note: 'Maintenance version (minor version)',
        },
      },
      prod: {
        options: {
          type: 'P',
          tag: true,
          tagText: 'Release version',
          note: 'Production version (major version)',
        },
      },
    },

    tdevopsui5_deploy: {
      options: {
        // abap options
        package: '<%= conf.abapPackage %>',
        bspcontainer: '<%= conf.BSPApp %>',
        bspcontainer_text: '<%= conf.BSPDesc %>',
        transportno: '<%= depConf.WBRequest %>',
        calc_appindex: true,
        // folder
        dest: '<%= dir.dest %>',
        // server info
        server: '<%= server.fullURL %>',
        client: '<%= server.Client %>',
        useStrictSSL: false,
        // credentional
        user: '<%= depConf.user %>',
        pwd: '<%= depConf.pwd %>',
      },
      main: {
        options: {
          // version
          version: 'M', // 'D', 'P', 'M'
        },
      },
      prod: {
        options: {
          // version
          version: 'P', // 'D', 'P', 'M'
        },
      },
      dev: {
        options: {
          // version
          version: 'D', // 'D', 'P', 'M'
        },
      },
      simple: {
        options: {
          // version
          version: null, // 'D', 'P', 'M'
        },
      },
    },

    tdevopsui5_server: {
      server: {
        options: {
          remoteServer: '<%= server.URL %>',
          remoteUrlPrefix: '/sap',
          user: '<%= depConf.user %>',
          pwd: '<%= depConf.pwd %>',
          localPort: '3020',
          // resources
          ui5resources: '<%= dir.resourceDir %>',
          appSource: '<%= dir.src %>',
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-tdevopsui5');

  grunt.loadNpmTasks('grunt-run');

  grunt.registerTask('updateMTAVersion', 'Update MTA Version from version.json', function() {
    grunt.log.writeln('starting running updateMTAVersion');
    updateMTAVersion(
      grunt,
      path.join(process.cwd(), this.args[0]),
      path.join(process.cwd(), this.args[1])
    );
    grunt.log.writeln('finish running updateMTAVersion');
  });

  // default task
  grunt.registerTask('default', ['tdevopsui5_build:default']);

  grunt.registerTask('build', [
    'updateMTAVersion:webapp:.',
    'tdevopsui5_build:default',
    'run:mta_build',
  ]);

  grunt.registerTask('server', ['tdevopsui5_server:server']);

  grunt.registerTask('deploy', ['tdevopsui5_deploy:simple']);

  grunt.registerTask('deployd', ['tdevopsui5_version:dev', 'tdevopsui5_deploy:simple']);
  grunt.registerTask('deploym', ['tdevopsui5_version:main', 'tdevopsui5_deploy:simple']);
  grunt.registerTask('deployp', ['tdevopsui5_version:prod', 'tdevopsui5_deploy:simple']);

  grunt.registerTask('versiond', ['tdevopsui5_version:dev']);
  grunt.registerTask('versionm', ['tdevopsui5_version:main']);
  grunt.registerTask('versionp', ['tdevopsui5_version:prod']);
};
