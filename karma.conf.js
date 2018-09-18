/* global process */

module.exports = function(config) {

  var configuration = {
    frameworks: ['mocha', 'chai'],
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-story-reporter'
    ],
    files: [
      'dist/render.umd.js',
      'tests/{,**/}*-test.js',
      'tests/{,**/}*-tests.js',
    ],
    // browsers: [ 'Chrome', 'Firefox' ],
    browsers: [ 'ChromeHeadless', 'FirefoxHeadless' ],
    customLaunchers: {
      Chrome_no_sandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },
    singleRun: true,
    reporters: ['story'],
  };

  if(process.env.TRAVIS){
    configuration.browsers = [ 'Chrome_no_sandbox', 'Firefox' ];
    configuration.concurrency = 1;
  }

  if(process.env.DRONE){
    configuration.browsers = [ 'Chrome' ];
  }

  if(process.env.WERCKER){
    configuration.browsers = [ 'Chrome' ];
  }

  config.set(configuration);
};
