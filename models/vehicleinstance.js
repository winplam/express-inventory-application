const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');

const VehicleInstanceSchema = new Schema({
    vehicle: {type: Schema.Types.ObjectId, ref: 'Vehicle', required: true},
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Loaned', 'Reserved', 'Maintenance'],
        default: 'Maintenance'
    },
    year: {type: Number},
    customer: {type: String, min: 1, max: 100},
    dueBack: {type: Date, default: Date.now}
});

// Virtual for car's URL
VehicleInstanceSchema
    .virtual('url')
    .get(function () {
        return '/vehicleinstance/' + this._id;
    });

// Virtual for formatted due date
VehicleInstanceSchema
    .virtual('dueBackFormatted')
    .get(function () {
        return moment(this.dueBack).format('MMMM Do, YYYY');
    });

VehicleInstanceSchema
    .virtual('dueBack_yyyy_mm_dd')
    .get(function () {
        return moment(this.dueBack).format('YYYY-MM-DD');
    });

// Export model.
module.exports = mongoose.model('VehicleInstance', VehicleInstanceSchema);