const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({ 
    name: {type: String, required: true}, 
    description: String,
    alias: String, 
    value: String, 
    public: Boolean
});

module.exports = mongoose.model('TagTemplate', schema);