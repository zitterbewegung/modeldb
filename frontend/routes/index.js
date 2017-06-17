var numRows = 1000;
var numCols = 70;

var express = require('express');
var router = express.Router();
var api = require('../util/api.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/projects');
});

router.get('/heatmap', function(req, res, next) {
  // dummy test data
  response.cols['GT'] = {
    'id': 'GT',
    'index': 0,
    'show': true
  };

  for (var i=0; i<numRows; i++) {
    response.rows[i] = {
      'id': i,
      'index': c1++,
      'show': Math.random() < 0.07
    };
  }

  for (var i=0; i<numCols; i++) {
    response.cols[i] = {
      'id': i,
      'index': c2++,
      'show': true
    };
  }

  for (var i=0; i<numCols; i++) {
    for (var j=0; j<numRows; j++) {
      response.data.push({
        'x': i,
        'y': j,
        'value': Math.random()
      });
    }
  }

  for (var i=0; i<numRows; i++) {
    response.data.push({
      'x': 'GT',
      'y': i,
      'value': (Math.round(Math.random()))
    })
  }

  res.json(response);
});

router.get('/pipeline/:id', function(req, res, next) {
  var modelId = req.params.id;
  var response = {};
  response.model = modelId;
  response.stages = [];
  response.transitions = [];
  // stages
  for (var i=0; i<10; i++) {
    response.stages.push({
      'id': i,
      'title': Math.random().toString(36).substr(2, 5)
    });
  }

  for (var i=0; i<response.stages.length - 1; i++) {
    response.transitions.push({
      'id': i,
      'title': Math.random().toString(36).substr(2,5)
    });
  }
  res.json(response);
});

router.get('/columns', function(req, res, next) {
  // dummy test data
  var response = [];

  for (var i=0; i<10; i++) {
    response.push({
      data: "col-" + i,
      title: "col-" + i
    });
  }

  res.json(response);
});

router.get('/examples', function(req, res, next) {
  // dummy test data
  var response = [];
  for (var i=0; i<numRows; i++) {
    var example = {'id': i};
    for (var j=0; j<10; j++) {
      example['col-' + j] = Math.floor(Math.random() * (10)) + 1;
    }
    response.push(example);
  }
  res.json(response);
});

// json endpoint for predictions from the PredictionStore thrift server
router.get('/thrift-predictions', function(req, res, next) {
  api.getThriftPredictions(1, function(response) {
    res.json(response);
  });
});

module.exports = router;
