const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attributeSchema = new Schema({ 
    name: {type: String, required: true},
    type: {type: String, required: true},
    should: Boolean
});

const documentTemplateSchema = new Schema({ 
    name: {type: String, required: true}, 
    description: String, 
    alias: String, 
    public: Boolean, 
    extends: Schema.Types.ObjectId,
    attributes: [attributeSchema],
    identifier: {type: String, required: true}, 
    metrics: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('DocumentTemplate', documentTemplateSchema);