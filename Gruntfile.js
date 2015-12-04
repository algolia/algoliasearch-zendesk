'use strict';

module.exports = function(grunt) {
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
      main: {
        src: '<%= buildDir %>/algoliasearch.zendesk-hc.js',
        dest: '<%= buildDir %>/algoliasearch.zendesk-hc.min.js'
      }
    },

    webpack: {
      main: {
        entry: './index.js',
        devtool: 'source-map',
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
      src: ['index.js', 'src/**/*.js', 'Gruntfile.js']
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
  grunt.registerTask('build', ['webpack', 'sed:version', 'uglify', 'usebanner']);
  grunt.registerTask('server', 'connect:server');
  grunt.registerTask('lint', 'eslint');
  grunt.registerTask('dev', 'concurrent:dev');

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
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-webpack');
};
