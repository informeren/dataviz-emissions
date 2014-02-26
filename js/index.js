(function($) {

  var dimensions = new Object();
  dimensions = {
    margin: {top: 20, right:  60, bottom: 30, left: 40},
    width: 940 - 40 - 60,  // margin-left, margin-right
    height: 400 - 20 - 30, // margin-top, margin-bottom
  };

  $(function() {
    $('#filter').change(function() {
      var id = this.value;
      chart(id, dimensions.width, dimensions.height);
    });

    init_chart(dimensions.width, dimensions.height, dimensions.margin);

    $('#filter').change();
  });

  function init_chart(width, height, margin) {
    d3.select('#stacked')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'wrapper')
      .append('g')
      .attr('class', 'y axis');
  }

  function chart(id, width, height) {
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().rangeRound([height, 0]);

    var color = d3.scale.ordinal().range(['#252525', '#d00', '#737373', '#969696']);

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

    d3.json('./emissions/type/' + id + '.json', function (error, json) {
      if (error) return console.warn(error);

      color.domain(['co2', 'ch4', 'no', 'gwp']);

      var data = new Array();
      $.each(json, function(year, emissions) {
        prev = 0;

        var item = color.domain().map(function(name) {
          return {year: year, name: name, y: prev, y1: prev += +emissions[name]};
        });

        data.push(item);
      });

      x.domain(data.map(function(d) { return d[0].year; }));
      y.domain([0, d3.max(data, function(d) { return d[3].y1; })]);

      var graph = d3.select('#wrapper');
      var bars = graph.selectAll('rect.bar').data(data)

      bars.enter()
        .append('g')
        .attr('class', 'bar')
        .attr('transform', function(d) { return 'translate(' + x(d[0].year) + ',0)'; });

      bars.selectAll('rect')
        .data(function(d) { return d; })
        .enter().append('rect')
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d.y1); })
        .attr('height', function(d) { return y(d.y) - y(d.y1); })
        .style('fill', function(d) { return color(d.name); });

      graph.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

      graph.select('.y.axis')
        .transition()
        .duration(300)
        .ease('exp')
        .call(yAxis)

      legend = graph.selectAll('.legend')
        .data(color.domain().slice().reverse())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

      legend.append('rect')
        .attr('x', 880 - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

      legend.append('text')
        .attr('x', 880 - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d) { return d; });
   });
  }
})(jQuery);
