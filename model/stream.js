var mongoose = require('mongoose');
var schema = mongoose.Schema;
var streamSchema = new schema({
    torrentId: Number,
    path: String
});


var stream = mongoose.model('stream', streamSchema);



module.exports = stream;