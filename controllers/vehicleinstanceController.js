var VehicleInstance = require('../models/vehicleinstance');
var Make = require('../models/make');
var Vehicle = require('../models/vehicle')
var async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all VehicleInstances.
exports.vehicleinstanceList = function (req, res, next) {
    VehicleInstance.find()
        .populate('vehicle')
        .exec(function (err, listVehicleInstances) {
            if (err) {
                return next(err);
            }
            // Successful, so render
            res.render('vehicleinstances', {title: 'Vehicle Instance List', listVehicleInstances});
        });
};

// Display detail page for a specific VehicleInstance.
exports.vehicleinstanceDetail = function (req, res, next) {
    async.parallel({
        vehicleinstance: function (callback) {
            VehicleInstance.findById(req.params.id)
                .populate('vehicle')
                .exec(callback)
        },
        //TODO: ADD MAKE (MANUFACTURER)
        // make: function (callback) {
        // Make.findById()
        //     .exec(callback)
        // },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicleinstance == null) { // No results.
            var err = new Error('Vehicle not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('vehicleinstancedetail', {
            title: 'Vehicle: ' + results.vehicleinstance.vehicle.model,
            // make: results.make.manufacturer,
            vehicleinstance: results.vehicleinstance
        });
    })
};

// Display VehicleInstance create form on GET.
exports.vehicleinstanceCreateGet = function (req, res, next) {
    Vehicle.find({}, 'model')
        .exec(function (err, vehicles) {
            console.log('---------- VEHICLES')
            console.log(vehicles)
            if (err) {
                return next(err);
            }
            // Successful, so render.
            res.render('vehicleinstanceform', {title: 'Create Vehicle Instance (CA)', vehiclelist: vehicles});
        });
};

// Handle VehicleInstance create on POST.
exports.vehicleinstanceCreatePost = [
    // Validate fields.
    body('customer', 'Customer name must be specified').trim().isLength({min: 1}),
    body('dueBack', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    // Sanitize fields.
    sanitizeBody('vehicle').escape(),
    sanitizeBody('customer').escape(),
    sanitizeBody('dueBack').toDate(),
    sanitizeBody('status').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var vehicleinstance = new VehicleInstance(
            {
                vehicle: req.body.vehicle,
                status: req.body.status,
                customer: req.body.customer,
                dueBack: req.body.dueBack
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Vehicle.find({}, 'model')
                .exec(function (err, books) {
                    if (err) {
                        return next(err);
                    }
                    // Successful, so render.
                    res.render('vehicleinstanceform', {
                        title: 'Create Vehicle Instance (CB)',
                        vehiclelist: books,
                        vehicleinstance,
                        errors: errors.array()
                    });
                });
            return;
        } else {
            // Data from form is valid.
            vehicleinstance.save(function (err) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to new record.
                res.redirect(vehicleinstance.url);
            });
        }
    }
];

// Display VehicleInstance delete form on GET.
exports.vehicleinstanceDeleteGet = function (req, res, next) {
    VehicleInstance.findById(req.params.id)
        .populate('vehicle')
        .exec(function (err, vehicleinstance) {
            console.log(vehicleinstance)
            if (err) {
                return next(err);
            }
            if (vehicleinstance == null) { // No results.
                res.redirect('/vehicleinstances');
            }
            // Successful, so render.
            res.render('vehicleinstancedelete', {title: 'Delete Vehicle Instance', vehicleinstance: vehicleinstance});
        })
};

// Handle VehicleInstance delete on POST.
exports.vehicleinstanceDeletePost = function (req, res, next) {
    // Assume valid BookInstance id in field.
    VehicleInstance.findByIdAndRemove(req.body.id, function deleteVehicleInstance(err) {
        if (err) {
            return next(err);
        }
        // Success, so redirect to list of BookInstance items.
        res.redirect('/vehicleinstances');
    });
};


// Display VehicleInstance update form on GET.
exports.vehicleinstanceUpdateGet = function (req, res, next) {
    // Get vehicle, makes and vehicle types for form.
    async.parallel({
        vehicleinstance: function (callback) {
            VehicleInstance.findById(req.params.id).populate('vehicle').exec(callback)
        },
        vehicles: function (callback) {
            Vehicle.find(callback)
        },

    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicleinstance == null) { // No results.
            var err = new Error('Vehicle instance not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('vehicleinstanceform', {
            title: 'Update Vehicle Instance (UA)',
            vehiclelist: results.vehicles,
            selectedvehicle: results.vehicleinstance.vehicle._id,
            vehicleinstance: results.vehicleinstance
        });
    });
};

// Handle vehicleinstance update on POST.
exports.vehicleinstanceUpdatePost = [
    // Validate fields.
    body('vehicle', 'Vehicle must be specified').isLength({min: 1}).trim(),
    body('customer', 'Customer must be specified').isLength({min: 1}).trim(),
    body('dueBack', 'Invalid date').optional({checkFalsy: true}).isISO8601(),

    // Sanitize fields.
    sanitizeBody('vehicle').escape(),
    sanitizeBody('customer').escape(),
    sanitizeBody('dueBack').toDate(),
    sanitizeBody('status').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a VehicleInstance object with escaped/trimmed data and current id.
        var vehicleinstance = new VehicleInstance(
            {
                vehicle: req.body.vehicle,
                customer: req.body.customer,
                dueBack: req.body.dueBack,
                status: req.body.status,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Vehicle.find({}, 'vehicle')
                .exec(function (err, vehicles) {
                    if (err) {
                        return next(err);
                    }
                    // Successful, so render.
                    res.render('vehicleinstanceform', {
                        title: 'Update Vehicle Instance (UB)',
                        vehiclelist: vehicles,
                        selectedvehicle: vehicleinstance.vehicle._id,
                        vehicleinstance: vehicleinstance,
                        errors: errors.array(),
                    });
                });
            return;
        } else {
            // Data from form is valid.
            VehicleInstance.findByIdAndUpdate(req.params.id, vehicleinstance, {}, function (err, theVehicleInstance) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to detail page.
                res.redirect(theVehicleInstance.url);
            });
        }
    }
];
