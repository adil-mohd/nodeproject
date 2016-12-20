var timestamps = require('mongoose-timestamp');

module.exports = function(mongoose, modelName) {

    var schema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        _schools: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'school'
            }],
        },
        fromDate: {
            type: Date,
            required: true
        },
        toDate: {
            type: Date,
            required: true
        },
        isEnabled: {
            type: Boolean,
            default: true
        }
    });

    schema.plugin(timestamps);

    mongoose.model(modelName, schema);
};