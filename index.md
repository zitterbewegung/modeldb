# ModelDB: A system to manage machine learning models

Companies often build hundreds of models a day (e.g., churn, recommendation, credit default). However, there is no practical way to manage all the models that are built over time.
This lack of tooling leads to insights being lost, resources wasted on re-generating old results, and difficulty collaborating.
ModelDB is an end-to-end system that tracks models as they are built, extracts and stores relevant metadata (e.g., hyperparameters, data sources) for models, and makes this data available for easy querying and visualization.

<!-- ## Why ModelDB?
 -->

## Use Cases
- Tracking Modeling Experiments
- Versioning Models
- Ensuring Reproducibility
- Visual exploration of models and results
- Collaboration

## Demo
Visit the [ModelDB client demo](http://modeldb.csail.mit.edu:3000) to try ModelDB's scikit-learn integration in Jupyter Notebook. See your results and those of others at the [ModelDB server demo](http://modeldb.csail.mit.edu:8000).

## How it works
Use a set of ModelDB native clients (currently ```spark.ml``` and ```scikit-learn```) to log modeling data to ModelDB. Using the ModelDB client API requires minimal changes to a modeling workflow.

For example, in ```spark.ml```, it requires the following changes:

 {% highlight java %}
  estimator.fit(data) --> estimator.fitSync(data)
  transformer.transform(data) --> transformer.transformSync(data)
  model.predict(data) --> model.predictSync(data)
 {% endhighlight %}

  And similarly in ```scikit-learn```:

 {% highlight ruby %}
  model.fit(data) --> model.fit_sync(data)
  preprocessor.transform(data) --> preprocessor.transform_sync(data)
  model.predict(data) --> model.predict_sync(data)
 {% endhighlight %}

  Once you run a workflow that has been instrumented with ModelDB, all the relevant modeling data is logged to the server.
  Now you can use the frontend to query and visualize this data.

  <img src="images/frontend-1.png" width="70%">
  
  Overview Page
  <!-- <img src="images/frontend-2.png" width="70%"> -->
  
  <img src="images/frontend-3.png" width="70%">
  
  Table View of Models
  
  <img src="images/frontend-4.png" width="70%">
  
  Charting capabilities

#### Architecture
ModelDB adopts a modular client-server architecture (below). Native clients for different languages (and ML packages) log data to the ModelDB server. All communication takes place through the ModelDB Thrift API. As a result, adding a native client for another language is straightforward.
The web frontend surfaces data in the backend for query, visualization and updates.

<img src="images/arch.png" width="60%">

## Getting Started
The ModelDB Getting Started Guides for [spark.ml]() and [scikit-learn]() are a good place to start. Please use the ModelDB mailing list or [Google Group](https://groups.google.com/forum/#!forum/modeldb) for quesions.

## Papers
- [Short paper](papers/hilda_modeldb.pdf) at HILDA workshop, SIGMOD 2016
<!-- - [Harihar's Masters thesis]() on software design aspects of ModelDB -->
- Full paper (coming soon)

## Contributors
- [Manasi Vartak](http://people.csail.mit.edu/mvartak/), PhD Student, MIT CSAIL
- [Harihar Subramanyam](https://www.linkedin.com/in/harihar-subramanyam-0862b353/), MEng, MIT
- [Wei-En Lee](https://www.linkedin.com/in/weienlee/), MEng Student MIT
- [Srinidhi Viswanathan](https://www.linkedin.com/in/srinidhi-viswanathan-16b50b7b/), MEng, MIT
- [Samuel Madden](http://db.csail.mit.edu/madden/), Faculty, MIT CSAIL
- [Matei Zaharia](https://cs.stanford.edu/~matei), Faculty, Stanford University

## Contact us
Send questions to modeldb \_at\_ csail.mit.edu
