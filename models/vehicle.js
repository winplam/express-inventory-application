const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VehicleSchema = new Schema({
    make: {type: Schema.Types.ObjectId, ref: 'Make', required: true},
    model: {type: String, required: true, max: 100},
    vehicleType: [{type: Schema.Types.ObjectId, ref: 'VehicleType'}],
    price: {type: Number},
});

// Virtual for car's URL
VehicleSchema
    .virtual('url')
    .get(function () {
        return '/vehicle/' + this._id;
    });

// Export model.
module.exports = mongoose.model('Vehicle', VehicleSchema);