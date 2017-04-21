THRESHOLD = 0.5;
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

SCALES = {
  'RG_SCALE': RG_SCALE,
  'OB_SCALE': OB_SCALE,
  'MONO_SCALE': MONO_SCALE,
  'BINARY_SCALE': BINARY_SCALE
};

COLOR_SCALE = RG_SCALE;
STEP_SIZE = 0.01;