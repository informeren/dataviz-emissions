(function($) {

  // Define the size of the canvasses
  var margin = {top: 10, right: 10, bottom: 32, left: 37},
      width = 280 - margin.left - margin.right,
      height = 240 - margin.top - margin.bottom;

  $(function() {
    $('#municipality').change(function() {
      chart('type', this.value, 'co2');
      chart('type', this.value, 'ch4');
      chart('type', this.value, 'no');
      chart('type', this.value, 'gwp');
    });

    init_type_chart('co2');
    init_type_chart('ch4');
    init_type_chart('no');
    init_type_chart('gwp');
  });

  function init_type_chart(filter) {
    var containerid = '#type-' + filter;
    var wrapperid = 'chart-type-' + filter;

    d3.select(containerid)
      .insert('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', wrapperid)
      .append('g')
      .attr('class', 'y axis');

    chart('type', 'all', filter);
  }

  function chart(type, id, filter) {
    var wrapperid = '#chart-type-' + filter;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);
      
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
      data.push({key: year, value: emissions[filter]});
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
