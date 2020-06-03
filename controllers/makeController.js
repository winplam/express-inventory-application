const Make = require('../models/make')
const Vehicle = require('../models/vehicle')
var async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Makes.
exports.makeList = function (req, res, next) {
    Make.find()
        .sort([['manufacturer', 'ascending']])
        .exec(function (err, listMakes) {
            if (err) {
                return next(err);
            }
            //Successful, so render
            res.render('makelist', {title: 'Manufacturers List', listMakes});
        });
};

// Display detail page for a specific Make.
exports.makeDetail = function (req, res, next) {
    async.parallel({
        make: function (callback) {
            Make.findById(req.params.id)
                .exec(callback)
        },
        vehicles: function (callback) {
            // Vehicle.find({'manufacturer': req.params.id}, 'make model price')
            Vehicle.find({'make': req.params.id})
                .populate('make')
                .populate('vehicleType')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        } // Error in API usage.
        if (results.make == null) { // No results.
            var err = new Error('Make not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('makedetail', {
            title: 'Make Detail',
            make: results.make,
            vehicles: results.vehicles
        });
    });
};

// Display Make create form on GET.
exports.makeCreateGet = function (req, res, next) {
    res.render('makeform', {title: 'Create Make'});
};

// Handle Make create on POST.
exports.makeCreatePost = [
    // Validate fields.
    body('manufacturer').isLength({min: 2}).trim().withMessage('Make (manufacturer) must be specified.'),
    // .isAlphanumeric().withMessage('Make (manufacturer) has non-alphanumeric characters.'),
    body('country').isLength({min: 2}).trim().optional({checkFalsy: true})
        .isAlphanumeric().withMessage('Country has non-alphanumeric characters.'),
    // Sanitize fields.
    sanitizeBody('manufacturer').escape(),
    sanitizeBody('country').escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('makeform', {title: 'Create New Make', make: req.body, errors: errors.array()});
            return;
        } else {
            // Data from form is valid.
            // Check if Vehicle Type with same name already exists.
            Make.findOne({'manufacturer': req.body.manufacturer})
                .exec(function (err, found_make) {
                    if (err) {
                        return next(err);
                    }
                    if (found_make) {
                        res.redirect(found_make.url);
                    } else {
                        // Create an Make object with escaped and trimmed data.
                        var make = new Make(
                            {
                                manufacturer: req.body.manufacturer,
                                country: req.body.country,
                            });
                        make.save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            // Successful - redirect to new author record.
                            res.redirect(make.url);
                        });
                    }
                })
        }
    }
];

// Display Make delete form on GET.
exports.makeDeleteGet = function (req, res, next) {
    async.parallel({
        make: function (callback) {
            Make.findById(req.params.id).exec(callback)
        },
        makesvehicles: function (callback) {
            Vehicle.find({'make': req.params.id}).exec(callback)
        },
    }, function (err, results) {
        console.log('---------- RESULTS DELETE FORM GET')
        console.log(results)
        if (err) {
            return next(err);
        }
        if (results.make == null) { // No results.
            res.redirect('/makes');
        }
        // Successful, so render.
        res.render('makedelete', {
            title: 'Delete Make',
            make: results.make,
            makesvehicles: results.makesvehicles
        });
    });

};

// Handle Make delete on POST.
exports.makeDeletePost = function (req, res, next) {
    async.parallel({
        make: function (callback) {
            Make.findById(req.body.makeid).exec(callback)
        },
        makesvehicles: function (callback) {
            Vehicle.find({'make': req.body.makeid}).exec(callback)
        },
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        // Success
        if (results.makesvehicles.length > 0) {
            // Manufacturer has vehicle. Render in same way as for GET route.
            res.render('makedelete', {
                title: 'Delete Make',
                make: results.make,
                makesvehicles: results.makesvehicles
            });
            return;
        } else {
            // Manufacturer has no books. Delete object and redirect to the list of manufacturers.
            Make.findByIdAndRemove(req.body.makeid, function deleteMake(err) {
                if (err) {
                    return next(err);
                }
                // Success - go to manufacturer list
                res.redirect('/makes')
            })
        }
    });
};

// Display Make update form on GET.
exports.makeUpdateGet = function (req, res, next) {
    Make.findById(req.params.id, function (err, make) {
        if (err) {
            return next(err);
        }
        if (make == null) { // No results.
            var err = new Error('Make not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('makeform', {title: 'Update Make', make: make});
    });
};

// Handle Make update on POST.
exports.makeUpdatePost = [
    // Validate fields.
    body('manufacturer').isLength({min: 2}).trim().withMessage('Make (manufacturer) must be specified.'),
    // .isAlphanumeric().withMessage('Make (manufacturer) has non-alphanumeric characters.'),
    body('country').isLength({min: 2}).trim().optional({checkFalsy: true})
        .isAlphanumeric().withMessage('Country has non-alphanumeric characters.'),

    // Sanitize fields.
    sanitizeBody('manufacturer').escape(),
    sanitizeBody('country').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var make = new Make(
            {
                manufacturer: req.body.manufacturer,
                country: req.body.country,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('makeform', {title: 'Update Make', make, errors: errors.array()});
            return;
        } else {
            // Data from form is valid. Update the record.
            Make.findByIdAndUpdate(req.params.id, make, {}, function (err, theMake) {
                if (err) {
                    return next(err);
                }
                // Successful - redirect to genre detail page.
                res.redirect(theMake.url);
            });
        }
    }
];