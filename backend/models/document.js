const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attributeSchema = new Schema({ 
    name: {type: String, required: true},
    value: String
});

const tagSchema = new Schema({ 
    identifier: {type: Schema.Types.ObjectId, required: true},
    value: String
});

const metricSchema = new Schema({ 
    identifier: {type: Schema.Types.ObjectId, required: true},
    alias: String,
    key: {type: String, required: true},
    tags: [tagSchema]
});

// Should be a link to any other metric schema document
const relationSchema = new Schema({ 
    identifier: {type: Schema.Types.ObjectId, required: true},
    alias: String,
    document: Schema.Types.ObjectId,
    link: Schema.Types.ObjectId
});

const documentSchema = new Schema({ 
    name: {type: String, required: true},
    description: String,
    template: {type: Schema.Types.ObjectId, required: true}, 
    parent: {type: Schema.Types.ObjectId}, 
    attributes: [attributeSchema],
    metrics: [metricSchema],
    relations: [relationSchema]
});

documentSchema.index({name: 'text', description: 'text'});

module.exports = mongoose.model('Document', documentSchema);