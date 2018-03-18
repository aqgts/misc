// Karma configuration
// Generated on Sun Feb 25 2018 01:23:42 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      'src/global/pre-cdn.js',
      ...require('./tools/cdn').map(({src}) => ({pattern: src, watched: false, served: false})),
      'src/global/post-cdn.js',
      'spec/helpers/global.js',
      'spec/**/*-spec.js',
      {pattern: 'spec/resources/**/*', included: false},
      {pattern: 'src/**/*.js', included: false, served: false}
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/global/pre-cdn.js': 'browserify',
      'src/global/post-cdn.js': 'browserify',
      'spec/helpers/global.js': 'browserify',
      'spec/**/*-spec.js': 'browserify'
    },


    browserify: {
      debug: true,
      transform: [
        ['babelify', {
          plugins: [
            ['istanbul', {
              exclude: [
                'spec/**/*.js'
              ]
            }]
          ]
        }]
      ]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'coverage'],


    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadlessNoSandbox'],


    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,


    browserNoActivityTimeout: 60000
  })
}
