#! /usr/bin/env node

console.info('This script populates some test vehicles, makes, vehicle types and vehicle instances to your database.' +
    'Specify database as argument - e.g.: ' +
    'mongodb://127.0.0.1/car_rental_database or ' +
    'populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0] || !userArgs[0].startsWith('mongodb')) {
    console.info('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

const async = require('async')
const Make = require('./models/make')
const Vehicle = require('./models/vehicle')
const VehicleInstance = require('./models/vehicleinstance')
const VehicleType = require('./models/vehicletype')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var makes = []
var vehicles = []
var vehicleInstances = []
var vehicleTypes = []

function makeCreate(manufacturer, country, cb) {
    const makeDetail = {manufacturer, country}
    const make = new Make(makeDetail);
    make.save(function (err) {
        if (err) {
            console.error('---------- ERROR CREATING Make: ' + make);
            cb(err, null)
            return
        }
        makes.push(make)
        console.info('---------- New Make: ' + make);
        cb(null, make)
    });
}

function vehicleCreate(make, model, vehicleType, price, cb) {
    const vehicleDetail = {
        make,
        model,
    }
    if (vehicleType != false) vehicleDetail.vehicleType = vehicleType
    if (price != false) vehicleDetail.price = price

    var vehicle = new Vehicle(vehicleDetail);
    vehicle.save(function (err) {
        if (err) {
            console.error('---------- ERROR CREATING Vehicle: ' + vehicle);
            cb(err, null)
            return
        }
        vehicles.push(vehicle)
        console.info('---------- New Vehicle: ' + vehicle);
        cb(null, vehicle)
    });
}

function VehicleInstanceCreate(vehicle, status, year, customer, due_back, cb) {
    const vehicleInstanceDetail = {
        vehicle,
    }
    if (status != false) vehicleInstanceDetail.status = status
    if (year != false) vehicleInstanceDetail.year = year
    if (customer != false) vehicleInstanceDetail.customer = customer
    if (due_back != false) vehicleInstanceDetail.dueBack = due_back

    const vehicleInstance = new VehicleInstance(vehicleInstanceDetail);
    vehicleInstance.save(function (err) {
        if (err) {
            console.error('---------- ERROR CREATING VehicleInstance: ' + vehicleInstance);
            cb(err, null)
            return
        }
        vehicleInstances.push(vehicleInstance)
        console.info('---------- New VehicleInstance: ' + vehicleInstance);
        cb(null, vehicle)
    });
}

function vehicleTypeCreate(name, description, cb) {
    const vehicleType = new VehicleType({name});
    if (description != false) vehicleType.description = description
    vehicleType.save(function (err) {
        if (err) {
            console.error('---------- ERROR CREATING VehicleType: ' + vehicleType);
            cb(err, null);
            return;
        }
        vehicleTypes.push(vehicleType)
        console.info('---------- New VehicleType: ' + vehicleType);
        cb(null, vehicleType);
    });
}

function createMakes(cb) {
    async.series([
            function (callback) {
                makeCreate('Ford', 'America', callback);
            },
            function (callback) {
                makeCreate('Honda', 'Japan', callback);
            },
            function (callback) {
                makeCreate('Tesla', 'America', callback);
            },
            function (callback) {
                makeCreate('Toyota', 'Japan', callback);
            },
            function (callback) {
                makeCreate('Volkswagen', 'Germany', callback);
            },
        ],
        // optional callback
        cb);
}

function createVehicleTypes(cb) {
    async.series([
            function (callback) {
                vehicleTypeCreate('Luxury',
                    'A luxury vehicle is intended to provide the driver and passengers with increased comfort, a higher level of equipment and increased perception of quality than regular cars for an increased price. The term is subjective and can be based on either the qualities of the car itself or the brand image of its manufacturer.',
                    callback);
            },
            function (callback) {
                vehicleTypeCreate('Minivan',
                    'Minivan is an American car classification for vehicles designed to transport passengers in the rear seating row, with reconfigurable seats in two or three rows. The equivalent terms in British English are multi-purpose vehicle, people carrier and people mover.',
                    callback);
            },
            function (callback) {
                vehicleTypeCreate('Sedan',
                    'A sedan, or saloon, is a passenger car in a three-box configuration with separate compartments for engine, passenger, and cargo. Sedan\'s first recorded use as a name for a car body was in 1912. The name comes from a 17th-century development of a litter, the sedan chair, a one-person enclosed box with windows and carried by porters.',
                    callback);
            },
            function (callback) {
                vehicleTypeCreate('Sport',
                    'A sports car is designed to emphasise handling, performance, or thrill of driving. Sports cars originated in Europe in the early 1900s and are currently produced by many manufacturers around the world.',
                    callback);
            },
            function (callback) {
                vehicleTypeCreate('SUV',
                    'Sport utility vehicle is a category of motor vehicles that combine elements of road-going passenger cars with features from off-road vehicles, such as raised ground clearance and four-wheel drive. There is no commonly agreed definition of an SUV, and usage varies between countries.',
                    callback);
            },
            function (callback) {
                vehicleTypeCreate('Truck',
                    'A truck or lorry is a motor vehicle designed to transport cargo. Trucks vary greatly in size, power, and configuration; smaller varieties may be mechanically similar to some automobiles. Commercial trucks can be very large and powerful and may be configured to be mounted with specialized equipment, such as in the case of refuse trucks, fire trucks, concrete mixers, and suction excavators.',
                    callback);
            },
        ],
        // optional callback
        cb);
}

function createVehicles(cb) {
    async.parallel([
            function (callback) {
                vehicleCreate(makes[0], 'Mustang', [vehicleTypes[0],], '73.95', callback);
            },
            function (callback) {
                vehicleCreate(makes[1], 'CRV', [vehicleTypes[4],], '64.25', callback);
            },
            function (callback) {
                vehicleCreate(makes[2], 'Model 3', [vehicleTypes[0],], '90.95', callback);
            },
            function (callback) {
                vehicleCreate(makes[3], 'Camry', [vehicleTypes[2],], '54.90', callback);
            },
            function (callback) {
                vehicleCreate(makes[4], 'Jetta', [vehicleTypes[2],], '61.00', callback);
            },
        ],
        // optional callback
        cb);
}

function createVehicleInstances(cb) {
    async.parallel([
            function (callback) {
                VehicleInstanceCreate(vehicles[0], 'Available', '2018', '', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[1], 'Loaned', '2019', 'Sean Estelle', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[2], 'Reserved', '2020', 'Anya Pasha', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[3], 'Maintenance', '2020', '', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[4], 'Available', '2019', '', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[0], 'Loaned', '2018', 'Celia Judy', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[1], 'Reserved', '2020', 'Leena Plouffe', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[2], 'Available', '2019', '', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[3], 'Loaned', '2018', 'Neville Menjivar', '', callback)
            },
            function (callback) {
                VehicleInstanceCreate(vehicles[4], 'Available', '2020', '', '', callback)
            },
        ],
        // Optional callback
        cb);
}

async.series([
        createMakes,
        createVehicleTypes,
        createVehicles,
        createVehicleInstances,
    ],
// Optional callback
    function (err, results) {
        if (err) {
            console.error('---------- FINAL ERROR ----------: ' + err);
        } else {
            console.info('---------- DONE CREATING VEHICLE INSTANCES ----------: ' + vehicleInstances);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });
