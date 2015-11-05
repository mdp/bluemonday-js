var Benchmark = require('benchmark')
var bluemonday = require('../index')

var input = '<a onblur="alert(secret)" href="http://www.google.com">Google</a><p>Yo</p>'
var policy = bluemonday.UGCPolicy()

function bluemondayBench() {
  policy.Sanitize(input)
}
var suite = new Benchmark.Suite

// add tests
suite.add('UGCPolicy', function() {
  bluemondayBench()
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('error', function(error) {
  console.log(error);
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ 'async': false });

