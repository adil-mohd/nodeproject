var timestamps = require('mongoose-timestamp');

module.exports = function(mongoose, modelName) {

    var schema = new mongoose.Schema({
        username: {
            type: String,
            lowercase: true,
            unique: true
        },
        name: {
            type: String
        },
        password: {
            type: String,
            select: false
        },
        isEnabled: {
            type: Boolean,
            index: true,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        segments: {
            type: [String]
        },
        profilePic: {
            type: String,
            required: false
        },
        meta: {
            type: {}
        }
    });

    schema.plugin(timestamps);

    mongoose.model(modelName, schema);
}