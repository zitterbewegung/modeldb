var express = require('express');
var router = express.Router();
var api = require('../util/api.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/projects');
});

router.get('/predictions', function(req, res, next) {
  res.render('predictions', {
    title: 'Predictions',
      path: {
        'labels': ['Predictions'],
        'links': ['/predictions']
      },
      menu: false
  });
});

router.get('/examples/:id', function(req, res, next) {
  var exampleId = req.params.id;
  var response = {};
  response['id'] = exampleId;
  for (var i=0; i<5; i++) {
    response[Math.random().toString(36).substr(2, 5)] = Math.random().toString(36).substr(2, 5);
  }
  res.json(response);
});

router.get('/heatmap', function(req, res, next) {
  var response = {};
  response.data = [];
  response.rows = {};
  response.cols = {};

  var numRows = 50;
  var numCols = 50;

  c1 = 0;
  c2 = 1;

  response.cols['GT'] = {
    'id': 'GT',
    'index': 0,
    'show': true
  };

  for (var i=0; i<numRows; i++) {
    response.rows[i] = {
      'id': i,
      'index': c1++,
      'show': true
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

router.get('/table-columns', function(req, res, next) {
  var response = [];

  for (var i=0; i<20; i++) {
    response.push({
      data: "col " + i,
      title: "col " + i
    });
  }

  res.json(response);
});

router.get('/table-data', function(req, res, next) {
  var response = [];

  for (var i=0; i<100; i++) {
    var row = {};
    for (var j=0; j<20; j++) {
      row["col " + j] = (Math.random().toString(36).substr(2, 5));
    }
    response.push(row);
  }
  res.json(response);
});

module.exports = router;
