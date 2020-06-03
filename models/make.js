const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MakeSchema = new Schema({
    manufacturer: {type: String, required: true, max: 100},
    country: {type: String, required: true, max: 100},
});

// Virtual for maker's URL
MakeSchema
    .virtual('url')
    .get(function () {
        return '/make/' + this._id;
    });

// Export model.
module.exports = mongoose.model('Make', MakeSchema);
