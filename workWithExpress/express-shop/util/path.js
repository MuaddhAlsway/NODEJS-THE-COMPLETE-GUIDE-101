const path = require("path")
// require('path') loads Node’s built-in path utilities.

// require.main.filename gives the path of the main application file.

// path.dirname(...) returns the directory containing that file.

module.exports = path.dirname(require.main.filename);