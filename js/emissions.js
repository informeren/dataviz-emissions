(function($) {

  // TODO: Don't show graphs with no data.
  // TODO: Use array.forEach to loop over data elements.
  // TODO: x-axis gets added on each re-draw!

  var basewidth = 220;
  if ($(window).width() < 400) {
    basewidth = 300;
  }

  // Define the sizes of the various charts.
  var dimensions = new Object();
  dimensions.type = {
    margin: {top: 15, right: 5, bottom: 32, left: 32},
    width: basewidth - 32 - 5, // margin-left, margin-right
    height: 200 - 15 - 32,     // margin-top, margin-bottom
  };
  dimensions.source = {
    margin: {top: 10, right: 5, bottom: 24, left: 32},
    width: basewidth - 32 - 5, // margin-left, margin-right
    height: 100 - 10 - 24,     // margin-top, margin-bottom
  };

  // Configure all bar charts on the page.
  // TODO: move this to a separata .json file?
  var barcharts = new Array();
  $.each(['co2', 'ch4', 'no', 'gwp'], function(i, filter) {
    barcharts.push({
      type: 'type',
      municipality: 'all',
      filter1: filter,
      filter2: '',
      width: dimensions.type.width,
      height: dimensions.type.height,
      margin: dimensions.type.margin,
    });
  });
  $.each(['fossil_fuels', 'unrelated', 'renewables'], function(i, filter1) {
    $.each(['co2', 'ch4', 'no', 'gwp'], function(i, filter2) {
      barcharts.push({
        type: 'source',
        municipality: 'all',
        filter1: filter1,
        filter2: filter2,
        width: dimensions.source.width,
        height: dimensions.source.height,
        margin: dimensions.source.margin,
      });
    });
  });
  barcharts.splice(12, 1); // remove the renewables/co2 combination

  $(function() {
    $('#filter').change(function() {
      var id = this.value;
      $.each(barcharts, function(i, barchart) {
        chart(barchart.type, id, barchart.filter1, barchart.filter2, barchart.width, barchart.height);
      });
    });

    // Initialize bar charts.
    $.each(barcharts, function(i, chart) {
      init_chart(chart.type, chart.filter1, chart.filter2, chart.width, chart.height, chart.margin);
    });

    $('#filter').change();
  });

  function init_chart(type, filter1, filter2, width, height, margin) {
    var containerid = '#' + type + '-' + filter1;
    var wrapperid = 'chart-' + type + '-' + filter1;

    if (filter2 != '') {
      containerid += '-' + filter2;
      wrapperid += '-' + filter2;
    }

    d3.select(containerid)
      .insert('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', wrapperid)
      .append('g')
      .attr('class', 'y axis');
  }

  function chart(type, id, filter1, filter2, width, height) {
    var wrapperid = '#chart-' + type + '-' + filter1;

    if (filter2 != '') {
      wrapperid += '-' + filter2;
    }

	  var x = d3.scale.ordinal()
	      .rangeRoundBands([0, width], .3);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .innerTickSize(0)
        .outerTickSize(0)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .innerTickSize(0)
        .outerTickSize(0)
        .tickPadding(0)
        .orient('left')
        .ticks(5, 'd')
        .tickFormat(d3.format('.2s'));

    d3.json('./emissions/' + type + '/' + id + '.json', function (error, json) {
      if (error) return console.warn(error);

      // Grab the year and the desired emission type, and add it to a list.
      var data = new Array();
      $.each(json, function (year, emissions) {
        switch (type) {
          case 'type':
            data.push({key: year, value: emissions[filter1]});
            break;
          case 'source':
            data.push({key: year, value: emissions[filter1][filter2]});
            break;
        }
      });

      x.domain(data.map(function(d) { return d.key; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      var graph = d3.select(wrapperid)
      var bars = graph.selectAll('rect.bar').data(data);

      bars.enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', function(d) { return x(d.key); })
          .attr('width', x.rangeBand());

      bars.transition()
          .duration(300)
          .ease('quad')
          .attr('height', function(d) { return height - y(d.value); })
          .attr('y', function(d) { return y(d.value); });

      graph.append('g')
           .attr('class', 'x axis')
           .attr('transform', 'translate(0,' + height + ')')
           .call(xAxis)
           .selectAll('.x.axis text')
           .attr('transform', 'rotate(90)translate(14, -6)');

      graph.select('.y.axis')
           .transition()
           .duration(300)
           .ease('exp')
           .call(yAxis);
    });
  }
})(jQuery);
