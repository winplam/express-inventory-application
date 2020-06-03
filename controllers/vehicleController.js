var Make = require('../models/make')
var Vehicle = require('../models/vehicle');
var VehicleInstance = require('../models/vehicleinstance')
var VehicleType = require('../models/vehicletype')
var async = require('async')
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display site home page
exports.index = function (req, res) {
    async.parallel({
        vehicleCount: function (callback) {
            Vehicle.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        vehicleInstanceCount: function (callback) {
            VehicleInstance.countDocuments({}, callback);
        },
        vehicleInstanceAvailableCount: function (callback) {
            VehicleInstance.countDocuments({status: 'Available'}, callback);
        },
        makeCount: function (callback) {
            Make.countDocuments({}, callback);
        },
        vehicleTypeCount: function (callback) {
            VehicleType.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', {title: 'ABC Vehicle Rental Company', error: err, data: results});
    });
};

// Display list of all vehicles.
exports.vehicleList = function (req, res, next) {
    Vehicle.find({})
        .populate('make vehicleType')
        .exec(function (err, listVehicle) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('vehiclelist', {title: 'Vehicle List', listVehicle});
        });
};

// Display detail page for a specific vehicle.
exports.vehicleDetail = function (req, res, next) {
    async.parallel({
        vehicle: function (callback) {
            Vehicle.findById(req.params.id)
                .populate('make')
                .populate('vehicleType')
                .exec(callback);
        },
        vehicleinstances: function (callback) {
            VehicleInstance.find({'vehicle': req.params.id})
                .populate('vehicle')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicle == null) { // No results.
            var err = new Error('Vehicle not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('vehicledetail', {
            title: results.vehicle.model,
            vehicle: results.vehicle,
            vehicleinstances: results.vehicleinstances
        });
    });
};

// Display vehicle create form on GET.
exports.vehicleCreateGet = function (req, res, next) {
    // Get all vehicles and vehicle types, which we can use for adding to our vehicle.
    async.parallel({
        makes: function (callback) {
            Make.find(callback);
        },
        vehicletypes: function (callback) {
            VehicleType.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        res.render('vehicleform', {
            title: 'Create Vehicle (CA)',
            makes: results.makes,
            vehicletypes: results.vehicletypes
        });
    });
};

// Handle vehicle create on POST.
exports.vehicleCreatePost = [
    // Convert the vehicle type to an array.
    (req, res, next) => {
        if (!(req.body.vehicleType instanceof Array)) {
            if (typeof req.body.vehicleType === 'undefined') {
                req.body.vehicleType = [];
            } else {
                req.body.vehicleType = new Array(req.body.vehicleType);
            }
        }
        next();
    },

    // Validate fields.
    body('model', 'Model must not be empty.').trim().isLength({min: 1}),
    body('make', 'Make must not be empty.').trim().isLength({min: 1}),
    body('price', 'Price must not be empty.').trim().isLength({min: 1}),
    body('vehicletype', 'Vehicle type must not be empty').trim().isLength({min: 1}),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        const errors = validationResult(req);

        var vehicle = new Vehicle(
            {
                model: req.body.model,
                make: req.body.make,
                price: req.body.price,
                vehicletypes: req.body.vehicletypes,
            });

        if (!errors.isEmpty()) {
            // Get all makes and vehicle types for form.
            async.parallel({
                make: function (callback) {
                    Make.find(callback);
                },
                vehicletype: function (callback) {
                    VehicleType.find(callback);
                },
            }, function (err, results) {
                if (err) {
                    return next(err);
                }

                for (let i = 0; i < results.vehicleType.length; i++) {
                    if (book.vehicleType.indexOf(results.genres[i]._id) > -1) {
                        results.vehicleType[i].checked = 'true';
                    }
                }
                res.render('vehicleform', {
                    title: 'Create Vehicle (CB)',
                    makes: results.makes,
                    vehicle: results.vehicle,
                    vehicletypes: results.vehicletypes,
                    errors: errors.array()
                });
            });
            return;
        } else {
            vehicle.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect(vehicle.url);
            });
        }
    }
];

// Display vehicle delete form on GET.
exports.vehicleDeleteGet = function (req, res, next) {
    async.parallel({
        vehicle: function (callback) {
            Vehicle.findById(req.params.id)
                .populate('make')
                .populate('vehicleType')
                .exec(callback);
        },
        vehicleinstances: function (callback) {
            VehicleInstance.find({'vehicle': req.params.id})
                .populate('vehicle')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicle == null) { // No results.
            res.redirect('/vehicles');
        }
        // Successful, so render.
        res.render('vehicledelete', {
            title: 'Delete Vehicle',
            vehicle: results.vehicle,
            vehicleinstances: results.vehicleinstances
        });
    });

};

// Handle vehicle delete on POST.
exports.vehicleDeletePost = function (req, res, next) {
    // Assume the post has valid id (ie no validation/sanitization).
    async.parallel({
        vehicle: function (callback) {
            Vehicle.findById(req.body.id).populate('make').populate('vehicletype').exec(callback);
        },
        vehicleinstances: function (callback) {
            VehicleInstance.find({'vehicle': req.body.id}).exec(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        // Success
        if (results.vehicleinstances.length > 0) {
            // Vehicle has vehicle instances. Render in same way as for GET route.
            res.render('vehicledelete', {
                title: 'Delete Vehicle',
                vehicle: results.vehicle,
                vehicleinstances: results.vehicleinstances
            });
            return;
        } else {
            // Vehicle has no Vehicle Instance objects. Delete object and redirect to the list of vehicles.
            Vehicle.findByIdAndRemove(req.body.id, function deleteVehicle(err) {
                if (err) {
                    return next(err);
                }
                // Success - got to books list.
                res.redirect('/vehicles');
            });

        }
    });
};


// Display vehicle update form on GET.
exports.vehicleUpdateGet = function (req, res, next) {
    async.parallel({
        vehicle: function (callback) {
            Vehicle.findById(req.params.id).populate('make').populate('vehicleType').exec(callback);
        },
        makes: function (callback) {
            Make.find(callback);
        },
        vehicletypes: function (callback) {
            VehicleType.find(callback);
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.vehicle == null) { // No results.
            var err = new Error('Vehicle not found');
            err.status = 404;
            return next(err);
        }
        for (var all_vt_iter = 0; all_vt_iter < results.vehicletypes.length; all_vt_iter++) {
            for (var vehicle_vt_iter = 0; vehicle_vt_iter < results.vehicle.vehicleType.length; vehicle_vt_iter++) {
                if (results.vehicletypes[all_vt_iter]._id.toString() == results.vehicle.vehicleType[vehicle_vt_iter]._id.toString()) {
                    results.vehicletypes[all_vt_iter].checked = 'true';
                }
            }
        }
        res.render('vehicleform', {
            title: 'Update Vehicle (UA)',
            makes: results.makes,
            vehicletypes: results.vehicletypes,
            vehicle: results.vehicle
        });
    });
};

// Handle vehicle update on POST.
exports.vehicleUpdatePost = [
    // Convert the vehicle type to an array
    (req, res, next) => {
        if (!(req.body.vehicletype instanceof Array)) {
            if (typeof req.body.vehicletype === 'undefined') {
                req.body.vehicletype = [];
            } else {
                req.body.vehicletype = new Array(req.body.vehicletype);
            }
        }
        next();
    },

    // Validate fields.
    body('model', 'Model must not be empty.').trim().isLength({min: 1}),
    body('make', 'Make must not be empty.').trim().isLength({min: 1}),
    body('price', 'Price must not be empty.').trim().isLength({min: 1}),
    // body('vehicletype', 'Vehicle type must not be empty').trim().isLength({min: 1}),

    // Sanitize fields.
    sanitizeBody('model').escape(),
    sanitizeBody('make').escape(),
    sanitizeBody('price').escape(),
    sanitizeBody('vehicletype.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Vehicle object with escaped/trimmed data and old id.
        var vehicle = new Vehicle(
            {
                model: req.body.model,
                make: req.body.make,
                price: req.body.price,
                vehicleType: (typeof req.body.vehicletype === 'undefined') ? [] : req.body.vehicletype,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            // Get all authors and genres for form.
            async.parallel({
                makes: function (callback) {
                    Make.find(callback);
                },
                vehicletypes: function (callback) {
                    VehicleType.find(callback);
                },
            }, function (err, results) {
                if (err) {
                    return next(err);
                }

                // Mark our selected vehicle type as checked.
                for (let i = 0; i < results.vehicletypes.length; i++) {
                    if (vehicle.vehicletypes.indexOf(results.vehicletypes[i]._id) > -1) {
                        results.vehicletypes[i].checked = 'true';
                    }
                }
                res.render('vehicleform', {
                    title: 'Update Vehicle (UB)',
                    makes: results.makes,
                    vehicletypes: results.vehicletypes,
                    errors: errors.array()
                });
            });
            return;
        } else {
            // Data from form is valid. Update the record.
            Vehicle.findByIdAndUpdate(req.params.id, vehicle, {}, function (err, thevehicle) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to book detail page.
                res.redirect(thevehicle.url);
            });
        }
    }
];
