const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleTypeSchema = new Schema({
    name: {type: String, required: true, min: 2, max: 100},
    description: {type: String, min: 3, max: 100},
});

// Virtual for car's URL
VehicleTypeSchema
    .virtual('url')
    .get(function () {
        return '/vehicletype/' + this._id;
    });

// Export model.
mongoose.models = {}
module.exports = mongoose.model('VehicleType', VehicleTypeSchema);