/* eslint algolia/no-module-exports: 0, no-var: 0 */

module.exports = function (grunt) {
  grunt.initConfig({
    version: grunt.file.readJSON('package.json').version,

    buildDir: 'dist',

    banner: [
      '/*!',
      ' * Algolia Search For Zendesk\'s Help Center <%= version %>',
      ' * https://github.com/algolia/algoliasearch-zendesk',
      ' * Copyright <%= grunt.template.today("yyyy") %> Algolia, Inc. and other contributors; Licensed MIT',
      ' */'
    ].join('\n'),

    usebanner: {
      all: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: ['dist/*.js']
        }
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        banner: '<%= banner %>'
      },
      main: {
        src: '<%= buildDir %>/algoliasearch.zendesk-hc.js',
        dest: '<%= buildDir %>/algoliasearch.zendesk-hc.min.js'
      }
    },

    cssmin: {
      options: {
        report: 'gzip',
        sourceMap: true
      },
      target: {
        files: {
          'dist/algoliasearch.zendesk-hc.min.css': ['dist/algoliasearch.zendesk-hc.css']
        }
      }
    },

    concat: {
      css: {
        src: ['css/style.css'],
        dest: 'dist/algoliasearch.zendesk-hc.css'
      }
    },

    webpack: {
      main: {
        entry: './index.js',
        output: {
          path: '<%= buildDir %>',
          filename: 'algoliasearch.zendesk-hc.js',
          library: 'algoliasearchZendeskHC',
          libraryTarget: 'umd'
        },
        externals: {
          jquery: 'jQuery'
        },
        module: {
          loaders: [{
            test: /\.js$/, exclude: /node_modules/, loader: 'babel',
            query: {
              // If the build takes two much time, we can try this
              // cacheDirectory: true,
              presets: ['es2015']
            }
          }]
        }
      }
    },

    sed: {
      version: {
        pattern: '%VERSION%',
        replacement: '<%= version %>',
        recursive: true,
        path: '<%= buildDir %>'
      }
    },

    eslint: {
      options: {
        config: '.eslintrc'
      },
      src: ['index.js', 'src/**/*.js']
    },

    watch: {
      js: {
        files: ['index.js', 'src/**/*.js'],
        tasks: 'build'
      }
    },

    clean: {
      dist: 'dist'
    },

    connect: {
      server: {
        options: {port: 8888, keepalive: true}
      }
    },

    concurrent: {
      options: {logConcurrentOutput: true},
      dev: ['server', 'watch']
    },

    step: {
      options: {
        option: false
      }
    }
  });

  // aliases
  // -------

  grunt.registerTask('default', 'build');
  grunt.registerTask('build', ['clean', 'build:js', 'build:css']);
  grunt.registerTask('build:js', ['webpack', 'sed:version', 'usebanner', 'uglify']);
  grunt.registerTask('build:css', ['concat:css', 'cssmin']);
  grunt.registerTask('server', 'connect:server');
  grunt.registerTask('lint', 'eslint');
  grunt.registerTask('dev', 'concurrent:dev');
  grunt.registerTask('docs', 'docs:documentation.md');

  grunt.registerTask('docs:documentation.md', 'Retrieve the documentation part of the README and hosts it on the website.', function () {
    var done = this.async();

    var fs = require('fs');

    var readHeader = new Promise(function (resolve, reject) {
      fs.readFile('./docs/headers/documentation.yml', function (err, data) {
        if (err) return reject(err);
        resolve(data.toString());
      });
    });

    var readReadme = new Promise(function (resolve, reject) {
      fs.readFile('./README.md', function (err, data) {
        if (err) return reject(err);
        var arr = data.toString().split('\n');
        var keep = [];
        var keeping = false;
        for (var i = 0; i < arr.length; ++i) {
          var line = arr[i];
          if (keeping && line.match(/^##[^#]/)) break;
          if (keeping) keep.push(line);
          if (!keeping && line.match(/^## Documentation$/)) keeping = true;
        }
        resolve(keep.join('\n'));
      });
    });

    Promise.all([readHeader, readReadme]).then(function (data) {
      fs.writeFile('docs/documentation.md', data.join('\n'), function (err) {
        if (err) throw err;
        done();
      });
    });
  });

  // load tasks
  // ----------

  grunt.loadNpmTasks('grunt-sed');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-step');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
};
