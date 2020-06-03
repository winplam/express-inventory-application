var express = require('express');
var router = express.Router();

// Require controller modules.
var vehicleController = require('../controllers/vehicleController');
var makeController = require('../controllers/makeController');
var vehicleTypeController = require('../controllers/vehicletypeController');
var vehicleInstanceController = require('../controllers/vehicleinstanceController');

/// ---------- VEHICLE ROUTES ---------- ///

// GET catalog home page.
router.get('/', vehicleController.index);
// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/vehicle/create', vehicleController.vehicleCreateGet);

// POST request for creating Book.
router.post('/vehicle/create', vehicleController.vehicleCreatePost);

// GET request to delete Book.
router.get('/vehicle/:id/delete', vehicleController.vehicleDeleteGet);

// POST request to delete Book.
router.post('/vehicle/:id/delete', vehicleController.vehicleDeletePost);

// GET request to update Book.
router.get('/vehicle/:id/update', vehicleController.vehicleUpdateGet);

// POST request to update Book.
router.post('/vehicle/:id/update', vehicleController.vehicleUpdatePost);

// GET request for one Book.
router.get('/vehicle/:id', vehicleController.vehicleDetail);

// GET request for list of all Book items.
router.get('/vehicles', vehicleController.vehicleList);

/// ---------- MAKE ROUTES ---------- ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display make).
router.get('/make/create', makeController.makeCreateGet);

// POST request for creating Author.
router.post('/make/create', makeController.makeCreatePost);

// GET request to delete Author.
router.get('/make/:id/delete', makeController.makeDeleteGet);

// POST request to delete Author.
router.post('/make/:id/delete', makeController.makeDeletePost);

// GET request to update Author.
router.get('/make/:id/update', makeController.makeUpdateGet);

// POST request to update Author.
router.post('/make/:id/update', makeController.makeUpdatePost);

// GET request for one Author.
router.get('/make/:id', makeController.makeDetail);

// GET request for list of all Authors.
router.get('/makes', makeController.makeList);

/// ---------- VEHICLE TYPE ROUTES ---------- ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/vehicletype/create', vehicleTypeController.vehicleTypeCreateGet);

//POST request for creating Genre.
router.post('/vehicletype/create', vehicleTypeController.vehicleTypeCreatePost);

// GET request to delete Genre.
router.get('/vehicletype/:id/delete', vehicleTypeController.vehicleTypeDeleteGet);

// POST request to delete Genre.
router.post('/vehicletype/:id/delete', vehicleTypeController.vehicleTypeDeletePost);

// GET request to update Genre.
router.get('/vehicletype/:id/update', vehicleTypeController.vehicleTypeUpdateGet);

// POST request to update Genre.
router.post('/vehicletype/:id/update', vehicleTypeController.vehicleTypeUpdatePost);

// GET request for one Genre.
router.get('/vehicletype/:id', vehicleTypeController.vehicleTypeDetail);

// GET request for list of all Genre.
router.get('/vehicletypes', vehicleTypeController.vehicleTypeList);

/// ---------- VEHICLE INSTANCE ROUTES ---------- ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get('/vehicleinstance/create', vehicleInstanceController.vehicleinstanceCreateGet);

// POST request for creating BookInstance.
router.post('/vehicleinstance/create', vehicleInstanceController.vehicleinstanceCreatePost);

// GET request to delete BookInstance.
router.get('/vehicleinstance/:id/delete', vehicleInstanceController.vehicleinstanceDeleteGet);

// POST request to delete BookInstance.
router.post('/vehicleinstance/:id/delete', vehicleInstanceController.vehicleinstanceDeletePost);

// GET request to update BookInstance.
router.get('/vehicleinstance/:id/update', vehicleInstanceController.vehicleinstanceUpdateGet);

// POST request to update BookInstance.
router.post('/vehicleinstance/:id/update', vehicleInstanceController.vehicleinstanceUpdatePost);

// GET request for one BookInstance.
router.get('/vehicleinstance/:id', vehicleInstanceController.vehicleinstanceDetail);

// GET request for list of all BookInstance.
router.get('/vehicleinstances', vehicleInstanceController.vehicleinstanceList);

module.exports = router;
