var Thrift = require('./thrift.js');

var async = require('async');
var csv = require('csvtojson');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var moment = require('moment');

module.exports = {

  getAnnotations: function(modelId, callback) {
    Thrift.client.getModel(modelId, function(err, response) {
      callback(response.annotations);
    });
  },

  getExperimentsAndRuns: function(projectId, callback) {
    Thrift.client.getRunsAndExperimentsInProject(projectId, function(err, response) {
      callback(response);
    });
  },

  getModel: function(modelId, callback) {
    Thrift.client.getModel(modelId, function(err, response) {
      var model_metrics = response.metrics;
      var metrics =[];
      response.show = false;
      for (key in model_metrics) {
        if (model_metrics.hasOwnProperty(key)) {
          var val = Object.keys(model_metrics[key]).map(function(k){return model_metrics[key][k]})[0];
          val = Math.round(parseFloat(val) * 1000) / 1000;
          metrics.push({
            "key": key,
            "val": val
          });
          response.show = true;
        }
      }
      response.metrics = metrics;
      console.log(response);
      callback(response);
    });
  },

  getModelAncestry: function(modelId, callback) {
    Thrift.client.computeModelAncestry(modelId, function(err, response) {
      //console.log(response);
      callback(response);
    });
  },

  getProjectColumns: function(projectId, callback) {
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
      callback(response);
    });
  },

  getProjectExamples: function(projectId, callback) {
    csv().fromFile(path.resolve('data/X_test.csv'), function(err, result) {
      callback(result);
    });
  },

  getProjectModels: function(projectId, callback) {
    var models = [];

    Thrift.client.getRunsAndExperimentsInProject(projectId, function(err, response) {
      var runs = response.experimentRuns;

      async.each(runs, function(item, finish) {
        Thrift.client.getExperimentRunDetails(item.id, function(err, response) {
          Array.prototype.push.apply(models,response.modelResponses);
          finish();
        });
      }, function(err) {

        // reformat metrics
        for (var i=0; i<models.length; i++) {
          var model_metrics = models[i].metrics;
          var metrics = [];
          models[i].show = false;
          for (key in model_metrics) {
            if (model_metrics.hasOwnProperty(key)) {
              var val = Object.keys(model_metrics[key]).map(function(k){return model_metrics[key][k]})[0];
              val = Math.round(parseFloat(val) * 1000) / 1000;
              metrics.push({
                "key": key,
                "val": val
              });
              models[i].show = true;
            }
          }

          models[i].metrics = metrics;
        }
        models = models.filter(function(model) {
          return model.show;
        });
        callback(models);
      });
    });
  },

  getProjectPredictions: function(projectId, callback) {
    var response = {};
    response.data = [];
    response.rows = {};
    response.cols = {};

    var promises = [];
    var c1 = 0;
    var c2 = 1;

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
        callback(response);
      });
    });
  },

  getProject: function(projectId, callback) {
    Thrift.client.getProjectOverviews(function(err, response) {
      for (var i=0; i<response.length; i++) {
        var project = response[i].project;
        if (project.id == projectId) {
          callback(project);
          return;
        }
      }
      callback(null);
    });
  },

  getProjects: function(callback) {
    //Project.getAll(callback);
    Thrift.client.getProjectOverviews(function(err, response) {
      callback(response);
    });
  },

  storeAnnotation: function(modelId, experimentRunId, string, callback) {
    var transformer = new Transformer({id: modelId});
    var fragment1 = new AnnotationFragment({
      type: "transformer",
      df: null,
      spec: null,
      transformer: transformer,
      message: null
    });

    var fragment2 = new AnnotationFragment({
      type: "message",
      df: null,
      spec: null,
      transformer: null,
      message: string
    });

    var annotationEvent = new AnnotationEvent({
      fragments: [fragment1, fragment2],
      experimentRunId: experimentRunId
    });

    console.log(annotationEvent);

    Thrift.client.storeAnnotationEvent(annotationEvent, function(err, response) {
      callback(response);
    });
  },

  editMetadata: function(modelId, kvPairs, callback) {
    var count = 0;
    var numKvPairs = Object.keys(kvPairs).length;
    for (var key in kvPairs) {
      var value = kvPairs[key];
      var valueType;
      if (isNaN(value)) {
        if (value === 'true' || value === 'false') {
          valueType = 'bool';
        } else {
          valueType = moment(value).isValid() ? 'datetime': 'string';
        }
      } else {
        var value = value.toString(); // thrift api takes in strings only
        if (value.indexOf('.') != -1) {
          valueType = 'double';
        } else {
          valueType = parseInt(value) > Math.pow(2, 31) - 1 ? 'long': 'int';
        }
      }
      Thrift.client.createOrUpdateScalarField(modelId, key, value, valueType, function(err, response) {
        if (err) {
          console.log('err', err);
        }
        count += 1;
        if (count === numKvPairs) {
          callback(response);
        }
      });
    }
  }

};
