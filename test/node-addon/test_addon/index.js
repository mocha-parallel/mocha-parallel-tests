var bindings = require('bindings');
var test_addon = bindings('test_addon');
exports.strlen = test_addon.strlen;
