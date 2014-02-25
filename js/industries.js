(function($) {

  // Define the sizes of the various charts.
  var dimensions = new Object();
  dimensions.industry = {
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    width: 139 - 10 - 10,  // margin-left, margin-right
    height: 104 - 10 - 10, // margin-top, margin-bottom
  };

  // Define the list of industries we wish to render.
  var industries = [
    'agriculture',
    'rawmaterials',
    'industry',
    'utilities',
    'construction',
    'culture',
    'transport',
    'communication',
    'government',
    'households',
    'service',
    'finance',
  ];

  // Create configuration array for the percentage tiles.
  var percentages = new Array();
  $.each(industries, function(i, item) {
    percentages.push({
      type: 'industry',
      municipality: 'all',
      filter: item,
      width: dimensions.industry.width,
      height: dimensions.industry.height,
      margin: dimensions.industry.margin,
    });
  });

  $(function() {
    $('#filter').change(function() {
      var id = this.value;
      $.each(percentages, function(i, pct) {
        percentage(pct.type, id, pct.filter);
      });
    });

    // Initialize percentage tiles.
    $.each(percentages, function(i, pct) {
      init_percentage(pct.type, pct.filter, pct.width, pct.height, pct.margin);
    });

    // Fire the change event to render the tiles.
    $('#filter').change();
  });

  // Initializes an SVG element for each percentage tile.
  function init_percentage(type, filter, width, height, margin) {
    var containerid = '#' + type + '-' + filter;
    var wrapperid = 'chart-' + type + '-' + filter;

    d3.select(containerid)
      .insert('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', wrapperid);
  }

  // Render a percentage tile.
  function percentage(type, id, filter) {
    var wrapperid = '#chart-' + type + '-' + filter;

    d3.json('./emissions/' + type + '/' + id + '.json', function (error, json) {
      if (error) return console.warn(error);

      // Calculate percentage for the current data point.
      var total = 0;
      $.each(json['2011'], function (industry, emissions) {
        // TODO: Only add the value if the element is in the industries array.
        total += parseInt(emissions.co2);
      });
      var current = parseInt(json['2011'][filter].co2);
      var data = [Math.round(current / total * 100)];

      var graph = d3.select(wrapperid)
      var number = graph.selectAll('text').data(data);

      // Create and position the text element.
      number
        .enter()
        .append('text')
        .text(0)
        .attr('x', 60)
        .attr('y', 54)
        .attr('text-anchor', 'middle')
        .attr('class', 'percentage');

      // Use a transition to move from the current value to the new value.
      number
        .transition()
        .duration(300)
        .tween('text', function(d) {
          var i = d3.interpolate(this.textContent.replace(/%/ig, ''), d);

          return function(t) {
            this.textContent = Math.round(i(t)) + '%';
          };
        });
    });
  }

})(jQuery);
