const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({ 
    name: {type: String, required: true}, 
    description: String, 
    alias: String, 
    public: Boolean, 
    unit: String, 
    tags: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('MetricTemplate', schema);