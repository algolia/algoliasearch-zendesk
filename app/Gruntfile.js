/* eslint algolia/force-import-root: 0, algolia/no-module-exports: 0, no-var: 0 */

var webpack = require('webpack');

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

    env: {
      prod: {
        NODE_ENV: 'production'
      },
      dev: {
        NODE_ENV: 'development'
      }
    },

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
            test: /\.js$/, exclude: /node_modules/, loader: 'babel'
          }]
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
          })
        ]
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
        tasks: 'build:js'
      },
      css: {
        files: ['css/**/*.css'],
        tasks: 'build:css'
      },
      docs: {
        files: ['README.md'],
        tasks: 'build:docs'
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
      dev: ['build', 'server', 'watch']
    },

    step: {
      options: {
        option: false
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true,
          require: ['babel-core/register']
        },
        src: ['test/**/*.js']
      }
    }

  });

  // aliases
  // -------

  grunt.registerTask('default', 'build');

  grunt.registerTask('release', ['env:prod', 'build']);

  grunt.registerTask('build', ['clean', 'build:js', 'build:css', 'build:docs']);
  grunt.registerTask('build:js', ['webpack', 'sed:version', 'usebanner', 'uglify']);
  grunt.registerTask('build:css', ['concat:css', 'cssmin']);
  grunt.registerTask('build:docs', 'build:docs:documentation.md');
  grunt.registerTask('build:docs:documentation.md', require('./grunt/build/docs/documentation.md.js'));

  grunt.registerTask('server', 'connect:server');
  grunt.registerTask('dev', ['env:dev', 'concurrent:dev']);

  grunt.registerTask('lint', 'eslint');

  grunt.registerTask('test', 'mochaTest');

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
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-mocha-test');
};
