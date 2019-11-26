require("babel-polyfill"); //https://github.com/facebook/jest/issues/3126
require("blah");
module.exports = require("babel-jest").createTransformer({
  presets: ["es2015", "react", "stage-1"]
});
