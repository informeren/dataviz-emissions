(function($) {

  // Define the sizes of the various charts.
  var dimensions = new Object();
  dimensions.type = {
    margin: {top: 15, right: 5, bottom: 32, left: 32},
    width: 220 - 32 - 5,   // margin-left, margin-right
    height: 200 - 15 - 32, // margin-top, margin-bottom
  };
  dimensions.source = {
    margin: {top: 10, right: 5, bottom: 24, left: 32},
    width: 220 - 32 - 5,   // margin-left, margin-right
    height: 100 - 10 - 24, // margin-top, margin-bottom
  };

  $(function() {
    $('#municipality').change(function() {
      chart('type', this.value, 'co2', '', dimensions.type);
      chart('type', this.value, 'ch4', '', dimensions.type);
      chart('type', this.value, 'no', '', dimensions.type);
      chart('type', this.value, 'gwp', '', dimensions.type);

      chart('source', this.value, 'fossil_fuels', 'co2', dimensions.source);
      chart('source', this.value, 'unrelated', 'co2', dimensions.source);

      chart('source', this.value, 'fossil_fuels', 'ch4', dimensions.source);
      chart('source', this.value, 'unrelated', 'ch4', dimensions.source);
      chart('source', this.value, 'renewables', 'ch4', dimensions.source);

      chart('source', this.value, 'fossil_fuels', 'no', dimensions.source);
      chart('source', this.value, 'unrelated', 'no', dimensions.source);
      chart('source', this.value, 'renewables', 'no', dimensions.source);

      chart('source', this.value, 'fossil_fuels', 'gwp', dimensions.source);
      chart('source', this.value, 'unrelated', 'gwp', dimensions.source);
      chart('source', this.value, 'renewables', 'gwp', dimensions.source);
    });

    // TODO: run through init_chart's, then just fire the change event

    init_chart('type', 'co2', '', dimensions.type); // TODO: turn this into an array, have straight width,height on it
    init_chart('type', 'ch4', '', dimensions.type);
    init_chart('type', 'no', '', dimensions.type);
    init_chart('type', 'gwp', '', dimensions.type);

    init_chart('source', 'fossil_fuels', 'co2', dimensions.source);
    init_chart('source', 'unrelated', 'co2', dimensions.source);

    init_chart('source', 'fossil_fuels', 'ch4', dimensions.source);
    init_chart('source', 'unrelated', 'ch4', dimensions.source);
    init_chart('source', 'renewables', 'ch4', dimensions.source);

    init_chart('source', 'fossil_fuels', 'no', dimensions.source);
    init_chart('source', 'unrelated', 'no', dimensions.source);
    init_chart('source', 'renewables', 'no', dimensions.source);

    init_chart('source', 'fossil_fuels', 'gwp', dimensions.source);
    init_chart('source', 'unrelated', 'gwp', dimensions.source);
    init_chart('source', 'renewables', 'gwp', dimensions.source);
  });

  function init_chart(type, filter1, filter2, dimensions) {
    var containerid = '#' + type + '-' + filter1;
    var wrapperid = 'chart-' + type + '-' + filter1;

    if (filter2 != '') {
      containerid += '-' + filter2;
      wrapperid += '-' + filter2;
    }

    d3.select(containerid)
      .insert('svg')
      .attr('width', dimensions.width + dimensions.margin.left + dimensions.margin.right)
      .attr('height', dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + dimensions.margin.left + ',' + dimensions.margin.top + ')')
      .attr('id', wrapperid)
      .append('g')
      .attr('class', 'y axis');

    chart(type, 'all', filter1, filter2, dimensions);
  }

  function chart(type, id, filter1, filter2, dimensions) {
    var width = dimensions.width;
    var height = dimensions.height;

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
        .ticks(5, 'd');

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
          .attr('class', 'bar');
  
      bars.exit()
          .transition()
          .duration(300)
          .ease('exp')
          .attr('width', 0)
          .remove();
  
      bars.transition()
          .duration(300)
          .ease('quad')
          .attr('x', function(d) { return x(d.key); })
          .attr('y', function(d) { return y(d.value); })
          .attr('height', function(d) { return height - y(d.value); })
          .attr('width', x.rangeBand());

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
           .call(yAxis)
           .selectAll('.y.axis text')
           .text(function(d) {
             return d/1000;
           });
    });
  }

})(jQuery);
