var numRows = 1000;
var numCols = 70;

var express = require('express');
var router = express.Router();
var api = require('../util/api.js');
var csv = require('csvtojson');
var fs = require('fs');
var path = require('path');
var readline = require('readline');

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
      menu: true
  });
});

router.get('/heatmap', function(req, res, next) {
  var response = {};
  response.data = [];
  response.rows = {};
  response.cols = {};

  var promises = [];
  c1 = 0;
  c2 = 1;

  // get all prediction files
  fs.readdir(path.resolve('data/predictions'), function(err, items) {
    // filter out hidden files
    items = items.filter(function(item){
      return !(/(^|\/)\.[^\/\.]/g).test(item)
    });

    // load ground truth
    var promise = new Promise(function(resolve, reject) {
        response.cols['GT'] = {
          'id': 'GT',
          'index': c1++,
          'show': true
        };

        var rd = require('readline').createInterface({
          input: require('fs').createReadStream(path.resolve('data/Y_test.csv')),
          terminal: false
        });

        rd.on('line', function (line) {
          var p = line.split(',');
          response.data.push({
            'x': 'GT',
            'y': p[0],
            'value': parseFloat(p[1])
          });
        });

        rd.on('close', function() {
          resolve();
        });
    });
    promises.push(promise);

    for (var i=0; i<items.length; i++) {
      // make a promise to load each file
      var promise = new Promise(function(resolve, reject) {
        // initialize line reader
        var rd = require('readline').createInterface({
          input: require('fs').createReadStream(path.join('data/predictions', items[i])),
          terminal: false
        });

        // read each line
        rd.on('line', function (line) {
          var p = line.split(',');

          // add prediction
          response.data.push({
            'x': p[0],
            'y': p[1],
            'value': parseFloat(p[2])
          });

          // add col if not yet seen
          if (!response.cols.hasOwnProperty(p[0])) {
            response.cols[p[0]] = {
              'id': p[0],
              'index': c1++,
              'show': true
            };
          }

          // add row if not yet seen
          if (!response.rows.hasOwnProperty(p[1])) {
            response.rows[p[1]] = {
              'id': p[1],
              'index': c2++,
              'show': Math.random() < 0.10
            };
          }

        }); // end read each line

        rd.on('close', function() {
          resolve(); // resolve promise when finished reading
        });

      });

      promises.push(promise);
    }

    // wait for all promises to resolve
    Promise.all(promises).then(function(values) {
      res.json(response);
    });
  });

  /*
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
  */
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
  var rd = readline.createInterface({
      input: fs.createReadStream(path.resolve('data/columns.csv')),
      terminal: false
  });

  rd.on('line', function(line) {
    var cols = line.split(',');
    var response = [];
    cols.forEach(function(col) {
      response.push({
        data: col,
        title: col
      });
    });
    res.json(response);
  });

  /*
  // dummy test data
  var response = [];

  for (var i=0; i<10; i++) {
    response.push({
      data: "col-" + i,
      title: "col-" + i
    });
  }

  res.json(response);
  */
});

router.get('/examples', function(req, res, next) {
  csv().fromFile(path.resolve('data/X_test.csv'), function(err, result) {
    res.json(result);
  });

  /*
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
  */
});

module.exports = router;
