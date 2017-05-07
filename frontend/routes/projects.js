var express = require('express');
var router = express.Router();
var api = require('../util/api.js');


/* GET projects listing. */
router.get('/', function(req, res, next) {
  api.getProjects(function(response) {
    res.render('projects', {
      title: 'Projects',
      path: {
        'labels': ['Projects'],
        'links': ['/projects']
      },
      menu: false,
      projects: response
    });
  });
});

/* get details for specific project */
router.get('/:id', function(req, res, next) {
  var projectId = req.params.id;
  api.getProject(projectId, function(response) {
    res.json(response);
  });
});

/* get all experiments and runs for a specific project */
router.get('/:id/experiments', function(req, res, next) {
  var projectId = req.params.id;
  api.getExperimentsAndRuns(projectId, function(response) {
    res.json(response);
  });
});

/* get all models for specific project */
router.get('/:id/models', function(req, res, next) {
  var id = req.params.id;
  res.render('models', {
    title: 'Models',
    path: {
      'labels': ['Projects', 'Models'],
      'links': ['/projects', '/projects/' + id + '/models']
    },
    menu: false,
    id: id
  });
});

router.get('/:id/ms', function(req, res, next) {
  var projectId = req.params.id;
  api.getProjectModels(projectId, function(response) {
    res.json(response);
  });
});

router.get('/:id/table', function(req, res, next) {
  var projectId = req.params.id;
  api.getProjectModels(projectId, function(response) {
    res.render('card', {
      models: response
    });
  });
});

// render the predictions page for a selected project
router.get('/:id/predictions', function(req, res, next) {
  var id = req.params.id;
  var modelIds = req.query.ids;
  res.render('predictions', {
    title: 'Predictions',
      path: {
        'labels': ['Projects', 'Models', 'Predictions'],
        'links': ['/projects', '/projects/' + id + '/models', '/projects/' + id + '/predictions']
      },
      menu: true,
      id: id,
      modelIds: modelIds
  });
});

// get raw predictions values in a selected project
router.get('/:id/predictions/predictions', function(req, res, next) {
  var projectId = req.params.id;
  api.getProjectPredictions(projectId, function(response) {
    res.json(response);
  });
});

// get columns (features) of raw data in a selected project
router.get('/:id/predictions/columns', function(req, res, next) {
  var projectId = req.params.id;
  api.getProjectColumns(projectId, function(response) {
    res.json(response);
  });
});

// get raw data for examples in a selected project
router.get('/:id/predictions/examples', function(req, res, next) {
  var projectId = req.params.id;
  api.getProjectExamples(projectId, function(response) {
    res.json(response);
  });
});

module.exports = router;
