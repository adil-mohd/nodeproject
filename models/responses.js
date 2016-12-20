var timestamps = require('mongoose-timestamp');

module.exports = function(mongoose, modelName) {

    var schema = new mongoose.Schema({
       studentName: {
           type: String,
           required: true
       },
       studentRoll: {
           type: String,
           required: true
       },
       _school: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'school'
       },
       _event: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'schoolevent'
       },
       date: {
           type: String
       },
       image: {
           type: String
       }
    });

    schema.plugin(timestamps);

    mongoose.model(modelName, schema);
};