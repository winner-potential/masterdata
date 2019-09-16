const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({ 
    group: {type: String, required: true}, 
    identifier: {type: Schema.Types.ObjectId, required: true}, 
    text: {type: String}
});

schema.index({text: 'text'});

var model = mongoose.model('Index', schema);
model.search = function(group, text, callback) {
    if(group) {
        model.find({$text: {$search: text}, group: group}, callback)
    } else {
        model.find({$text: {$search: text}}, callback)
    }
}
model.clean = function(group, identifier, callback) {
    if(!group || !identifier) {
        callback("Missing group or identifier");
        return;
    }
    model.deleteMany({identifier: identifier, group: group}, callback);
}
model.refresh = function(group, identifier, text, callback) {
    if(!group || !identifier) {
        callback("Missing group or identifier");
        return;
    }
    model.clean(group, identifier, function(err) {
        if(err) {
            callback(err);
        } else {
            model.create({identifier: identifier, group: group, text: text}, callback);
        }
    })
}
module.exports = model;