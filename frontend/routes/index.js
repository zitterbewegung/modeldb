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

router.get('/heatmap', function(req, res, next) {
  var response = {};
  response.data = [];
  response.rows = {};
  response.cols = {};

  c1 = 0;
  c2 = 0;

  for (var i=0; i<50; i++) {
    response.rows['ex ' + i] = c1++;
    response.cols['m ' + i] = c2++;
  }

  for (var i=0; i<50; i++) {
    for (var j=0; j<50; j++) {
      response.data.push({
        'x': 'm ' + i,
        'y': 'ex ' + j,
        'value': Math.random()
      });
    }
  }
  res.json(response);
});

router.get('/pipeline', function(req, res, next) {
  var response = {};
  response.model = Math.round(Math.random() * 1000);
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
