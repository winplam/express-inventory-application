var VehicleType = require('../models/vehicleType');
var Vehicle = require('../models/vehicle');
var async = require('async');
const validator = require('express-validator');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all VehicleType.
exports.vehicleTypeList = function (req, res, next) {
    VehicleType.find()
        .sort([['typeName', 'ascending']])
        .exec(function (err, listTypes) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('vehicletypelist', {title: 'Vehiclel Type List', listTypes});
        });
};

// Display detail page for a specific VehicleType.
exports.vehicleTypeDetail = function (req, res, next) {
    async.parallel({
        vehicletype: function (callback) {
            VehicleType.findById(req.params.id)
                .exec(callback);
        },
        vehicles: function (callback) {
            Vehicle.find({'vehicleType': req.params.id})
                .populate('make')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicletype == null) { // No results.
            var err = new Error('Vehicle type not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('vehicletypedetail', {
            vehicletype: results.vehicletype,
            vehicles: results.vehicles,
        })
    });
};

// Display VehicleType create form on GET.
exports.vehicleTypeCreateGet = function (req, res, next) {
    res.render('vehicletypeform', {title: 'Create Vehicle Type'});
};

// Handle VehicleType create on POST.
exports.vehicleTypeCreatePost = [
    // Validate that the name field is not empty.
    validator.body('name', 'Vehicle type name required').trim().isLength({min: 2}),
    // Sanitize (escape) the name field.
    validator.sanitizeBody('name').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validator.validationResult(req);

        // Create a vehicle type object with escaped and trimmed data.
        var vehicleType = new VehicleType(
            {name: req.body.name}
        );

        if (!errors.isEmpty()) {
            console.error('---------- There are errors. Render the form again with sanitized values/error messages.')
            res.render('vehicletypeform', {title: 'Create New Vehicle Type', vehicleType, errors: errors.array()});
            return;
        } else {
            // Data from form is valid.
            // Check if Vehicle Type with same name already exists.
            VehicleType.findOne({'name': req.body.name})
                .exec(function (err, found_vehicleType) {
                    if (err) {
                        return next(err);
                    }

                    if (found_vehicleType) {
                        console.warn('--------- Vehicle Type exists, redirect to its detail page.')
                        res.redirect(found_vehicleType.url);
                    } else {
                        console.info('--------- Creating new vehicle type')
                        vehicleType.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            // Vehicle Type saved. Redirect to Vehicle Type detail page.
                            res.redirect(vehicleType.url);
                        });
                    }
                });
        }
    }
];

// Display VehicleType delete form on GET.
exports.vehicleTypeDeleteGet = function (req, res, next) {
    async.parallel({
        vehicletype: function (callback) {
            VehicleType.findById(req.params.id).exec(callback);
        },
        vehicles: function (callback) {
            Vehicle.find({'vehicleType': req.params.id}).populate('make').exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicletype == null) { // No results.
            res.redirect('/vehicletypes');
        }
        // Successful, so render.
        res.render('vehicletypedelete', {
            title: 'Delete Vehicle Type',
            vehicletype: results.vehicletype,
            vehicles: results.vehicles
        });
    });
};

// Handle VehicleType delete on POST.
exports.vehicleTypeDeletePost = function (req, res, next) {
    async.parallel({
        vehicletype: function (callback) {
            VehicleType.findById(req.params.id).exec(callback);
        },
        vehicles: function (callback) {
            Vehicle.find({'vehicleType': req.params.id}).exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        // Success
        if (results.vehicles.length > 0) {
            // Vehicle type has vehicles. Render in same way as for GET route.
            res.render('vehicletypedelete', {
                title: 'Delete Vehicle Type',
                vehicletype: results.vehicletype,
                vehicles: results.vehicles
            });
            return;
        } else {
            // Vehicle type has no books. Delete object and redirect to the list of vehicle types.
            VehicleType.findByIdAndRemove(req.body.id, function deleteVehicleType(err) {
                if (err) {
                    return next(err);
                }
                // Success - go to genres list.
                res.redirect('/vehicletypes');
            });
        }
    });
};

// Display VehicleType update form on GET.
exports.vehicleTypeUpdateGet = function (req, res, next) {
    VehicleType.findById(req.params.id, function (err, vehicletype) {
        if (err) {
            return next(err);
        }
        if (vehicletype == null) { // No results.
            var err = new Error('Vehicle type not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('vehicletypeform', {title: 'Update Vehicle Type', vehicletype});
    });

};

// Handle VehicleType update on POST.
exports.vehicleTypeUpdatePost = [
    // Validate that the name field is not empty.
    body('name', 'Vehicle type name required').isLength({min: 2}).trim(),

    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request .
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data (and the old id!)
        var vehicletype = new VehicleType(
            {
                name: req.body.name,
                description: (typeof req.body.description === 'undefined') ? [] : req.body.description,
                _id: req.params.id
            }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('vehicletypeform', {title: 'Update Vehicle Type', vehicletype, errors: errors.array()});
            return;
        } else {
            // Data from form is valid. Update the record.
            VehicleType.findByIdAndUpdate(req.params.id, vehicletype, {}, function (err, thevehicletype) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to genre detail page.
                res.redirect(thevehicletype.url);
            });
        }
    }
];
