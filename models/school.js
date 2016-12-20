var timestamps = require('mongoose-timestamp');

module.exports = function(mongoose, modelName) {

    var schema = new mongoose.Schema({
        name: {
            type: String,
            lowercase: true,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        code: {
            type: String,
            unique: true
        },
        address: {
            type: String
        },
        _events: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'schoolevent'
            }],
        },
        meta: {
            type: {}
        }
    });

    schema.plugin(timestamps);

    mongoose.model(modelName, schema);
}