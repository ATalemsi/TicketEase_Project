module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'], // Add 'karma-typescript' here
    files: [
      'src/**/*.ts', // Include all TypeScript files
      'src/**/*.spec.ts' // Include all test files
    ],
    exclude: [],
    preprocessors: {
      '**/*.ts': ['karma-typescript'] // Preprocess all TypeScript files
    },
    reporters: ['progress', 'karma-typescript'], // Add 'karma-typescript' reporter
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    concurrency: Infinity,
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json', // Path to your tsconfig.json
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/, // Only bundle test files
        transforms: [require('karma-typescript-angular2-transform')] // Add Angular transform
      },
      compilerOptions: {
        module: 'commonjs' // Use CommonJS module system
      }
    }
  });
};
