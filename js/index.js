(function($) {

  var dimensions = {};
  dimensions = {
    margin: {top: 20, right:  60, bottom: 30, left: 40},
    width: 940 - 40 - 60,  // margin-left, margin-right
    height: 200 - 20 - 30, // margin-top, margin-bottom
  };

  $(function() {
    $('#filter').change(function() {
      var id = this.value;
      chart('stacked-co2-gwp', ['co2', 'gwp'], id, dimensions.width, dimensions.height);
      chart('stacked-ch4-no', ['ch4', 'no'], id, dimensions.width, dimensions.height);
    });

    init_chart('stacked-co2-gwp', dimensions.width, dimensions.height, dimensions.margin);
    init_chart('stacked-ch4-no', dimensions.width, dimensions.height, dimensions.margin);

    $('#filter').change();
  });

  function init_chart(element, width, height, margin) {
    var wrapper = d3.select('#' + element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', element + '-wrapper');

    wrapper.insert('g')
      .attr('class', 'x axis');
    wrapper.insert('g')
      .attr('class', 'y axis');
  }

  function chart(element, gasses, id, width, height) {
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().range([height, 0]);

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

    var color = d3.scale.ordinal().range(['#252525', '#d00']); //'#737373', '#969696'
    color.domain(gasses);

    var years = d3.scale.ordinal().rangePoints([0,11]);
    years.domain([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011]);

    d3.json('./emissions/type/' + id + '.json', function (error, json) {
      if (error) { return console.warn(error) };

      var data = [];
      for (var year in json) {
        color.domain().forEach(function(type) {
          if (typeof data[gasses.indexOf(type)] === 'undefined') {
            data[gasses.indexOf(type)] = [];
          }
          data[gasses.indexOf(type)].push({
            x: years(year),
            y: json[year][type],
            year: year,
            name: type,
          });
        });
      }

      data = d3.layout.stack()(data);

      x.domain(data[0].map(function(d) { return d.year; }));
      y.domain([0, d3.max(data, function(d) { return d3.max(d, function(e) { return e.y + e.y0; }); }) ]);

      var graph = d3.select('#' + element + '-wrapper');
      var layers = graph.selectAll('g.layer').data(data);

      layers.enter()
        .append('g')
        .style('fill', function(d, i) { return color(i); })
        .attr('class', 'layer');

      var bars = layers.selectAll('rect.stacked').data(function(d) { return d; });

      bars.enter()
        .append('rect')
        .attr('class', 'stacked')
        .attr('width', x.rangeBand())
        .attr('x', function(d) { return x(d.year); })
        .attr('y', 350)
        .attr('height', 0);

      bars.transition()
        .delay(function(d, i) { return i * 20; })
        .duration(300)
        .ease('quad')
        .attr('y', function(d) { return y(d.y) + y(d.y0) - height; })
        .attr('height', function(d) { return height - y(d.y); });

      graph.select('.x.axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(xAxis);

      graph.select('.y.axis')
        .transition()
        .duration(300)
        .ease('quad')
        .call(yAxis);

      legend = graph.selectAll('.legend')
        .data(gasses)
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
