/* binary classification threshold */
THRESHOLD = 0.5;
STEP_SIZE = 0.01; // for calculating ROC and PR


/* scales */
COLOR_SCALE = null;

RG_SCALE = d3.scale.linear().domain([0, 0.5, 1])
  .range([d3.rgb("#e74c3c"), "white", d3.rgb('#2ecc71')]);

OB_SCALE = d3.scale.linear().domain([0, 0.5, 1])
  .range(["#fd9430", "white", "#268bde"]);

MONO_SCALE = d3.scale.linear().domain([0, 1])
  .range([d3.rgb("#D9E0E8"), d3.rgb('#2c3e50')]);

BINARY_SCALE = d3.scale.threshold()
  .domain([THRESHOLD])
  .range(["#D9E0E8", "#2c3e50"]);

CORRECTNESS_SCALE = d3.scale.linear().domain([0, THRESHOLD, 1])
  .range([d3.rgb("#e74c3c"), "white", d3.rgb('#2ecc71')]);

CORRECTNESS_SCALE_GT1 = d3.scale.linear()
  .domain([0, Math.min(Math.max(THRESHOLD, 0.001), 0.999), 1])
  .range([d3.rgb("#e74c3c"), "white", d3.rgb('#2ecc71')]);

CORRECTNESS_SCALE_GT0 = d3.scale.linear()
  .domain([0, Math.min(Math.max(THRESHOLD, 0.001), 0.999), 1])
  .range([d3.rgb("#2ecc71"), "white", d3.rgb('#e74c3c')]);

SCALES = {
  'RG_SCALE': RG_SCALE,
  'OB_SCALE': OB_SCALE,
  'MONO_SCALE': MONO_SCALE,
  'BINARY_SCALE': BINARY_SCALE,
  'CORRECTNESS_SCALE': CORRECTNESS_SCALE
};

COLOR_SCALE = RG_SCALE;


/* matrix constants  */
CELL_SIZE = 12;
MATRIX_HEIGHT = 0;
MATRIX_WIDTH = 0;
GT_OFFSET = 8;

/* matrix data */
SELECTED_MODELS = {};
SELECTED_EXAMPLES = {};
MATRIX_DATA = [];
MATRIX_NUMROWS = 0;
MATRIX_NUMCOLS = 0;
SELECTED_MODEL = null;
SELECTED_EXAMPLE = null;

/* example data */
TABLE_COLUMNS = null;
RAW_DATA_KEYS = {};
RAW_DATA = {};
FILTER_GROUPS = {};
GROUPS = {};
