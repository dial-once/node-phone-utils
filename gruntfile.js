module.exports = function (grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true,
        es5: true
      },
      target: ['lib/*.js', 'lib/*/*.js', 'tests/*.js', 'tests/**/*.js', 'tests/**/**/*.js']
    },
    simplemocha: {
      options: {
        globals: ['expect'],
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {src: ['tests/*spec.js', 'tests/**/*spec.js', 'tests/**/**/*spec.js']}
    },
    coverage: {
      default: {
        options: {
          thresholds: {
            'statements': 90,
            'branches': 90,
            'lines': 90,
            'functions': 90
          },
          dir: 'coverage',
          root: 'tests',
          coverageReporter: {
            type : 'json',
            dir : 'tests/coverage/'
          }
        }
      }
    },
    jsdoc : {
      dist: {
        src: ['lib/*.js', 'lib/*/*.js'],
        options: {
          destination: 'docs',
          template: 'node_modules/minami',
          recurse: true,
          recursive: true,
          private: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-istanbul-coverage');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('test', ['jshint', 'simplemocha']);
  grunt.registerTask('default', ['test', 'jsdoc']);

};