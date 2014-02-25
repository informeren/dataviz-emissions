(function($) {

  // TODO: Don't show graphs with no data.
  // TODO: Should we cache JSON files locally?

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
  dimensions.industry = {
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    width: 139 - 10 - 10,  // margin-left, margin-right
    height: 139 - 10 - 10, // margin-top, margin-bottom
  };

  // Configure all bar charts on the page.
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

  var percentages = new Array();
  $.each(['agriculture', 'rawmaterials', 'industry', 'utilities', 'construction', 'culture'], function(i, item) {
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
/*
      $.each(barcharts, function(i, barchart) {
        chart(barchart.type, id, barchart.filter1, barchart.filter2, barchart.width, barchart.height);
      });
*/

      $.each(percentages, function(i, pct) {
        percentage(pct.type, id, pct.filter, pct.width, pct.height);
      });

    });

    // Initialize bar charts.
/*
    $.each(barcharts, function(i, chart) {
      init_chart(chart.type, chart.filter1, chart.filter2, chart.width, chart.height, chart.margin);
    });
*/

    $.each(percentages, function(i, pct) {
      init_percentage(pct.type, pct.filter, pct.width, pct.height, pct.margin);
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
    var legendid = '#legend-' + type + '-' + filter1;
    if (filter2 != '') {
      wrapperid += '-' + filter2;
      legendid += '-' + filter2;
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

      var ymax = d3.max(data, function(d) { return d.value; });
      x.domain(data.map(function(d) { return d.key; }));
      y.domain([0, ymax]);

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
             $.each([1000000, 100000, 10000, 1000], function(i, value) {
               if (ymax > value) {
                 d = d/value;
                 $(legendid).html('Enhed: ' + addSeparator(value) + ' ton');
                 return false;
               }
               else {
                 $(legendid).html('Enhed: 1 ton');
               }
             });
             return d;
           });
    });
  }

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

  function percentage(type, id, filter, width, height) {
    var wrapperid = '#chart-' + type + '-' + filter;


    d3.json('./emissions/' + type + '/' + id + '.json', function (error, json) {
      if (error) return console.warn(error);

      var total = 0;
      $.each(json['2011'], function (industry, emissions) {
        total += parseInt(emissions.co2);
      });

      var current = parseInt(json['2011'][filter].co2);
      var percentage = Math.round(current / total * 100);
      var data = [percentage];

      var graph = d3.select(wrapperid)
      var number = graph.selectAll('text').data(data);

      number.enter()
            .append('text')
            .text(0)
            .attr('x', 20)
            .attr('y', 10)
            .attr('class', 'txt') // text-anchor?
            ;

      number.transition()
            .duration(300)
            .tween('text', function(d) {
              var i = d3.interpolate(this.textContent.replace(/\s%/ig, ''), d);

              return function(t) {
                this.textContent = Math.round(i(t)) + ' %';
              };
            });
    });
  }

  // !Utility functions

  function addSeparator(number) {
    number = number + '';
    var re = /(\d+)(\d{3})/;
    while (re.test(number)) {
      number = number.replace(re, '$1.$2');
    }
    return number;
  }

})(jQuery);
