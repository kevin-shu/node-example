var csv = require('csv');
var fs = require('fs')
var _ = require('lodash'),
	ElasticSearchClient = require('elasticsearchclient'),
	async = require('async');

var counter = 0;

var stream = fs.createWriteStream("doubleCheck.csv");
stream.once('open', function(fd) {});

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}


csv().from.stream(fs.createReadStream(__dirname + '/ranking.csv'))
.on('record', function(row, index) {
	q.push(formatJson(row, counter), function(err) {
		if (err) console.log(err)
	});
	counter = counter+1;
})
.on('end', function(count) {
	console.log('Number of lines: ' + count);
	// sleep(120000);
	// stream.end();
})
.on('error', function(error) {
	console.log(error.message);
});


q = async.queue(saveJson, 10);
var i = 0

q.drain = function() {
	console.log('q finished')
}

var serverOptions = {
	host: '54.249.13.145',
	port: '9200'
};
var esClient = new ElasticSearchClient(serverOptions);


function saveJson(data, cb) {

	var percentileOfClicks = parseFloat(data.percentileOfClicks);

	esClient.update("eastbnb","region", data.id, { 
		// script : "ctx._source.percentileTotal = ctx._source.percentile + percentileOfClicks; ctx._source.percentileOfClicks = percentileOfClicks",
	    // "params" : {
	    //     "percentileOfClicks" : percentileOfClicks
	    // }
	    script : "ctx._source.percentileTotal = ctx._source.percentile + ctx._source.clicks"
	})
	.on("data", function(_data){
		// data = JSON.parse(data);
		console.log(data.counter);
		cb();
	})
	.exec();
	
}

function formatJson(data, counter) {
	var json = {
		id: data[0],
		percentileOfClicks: parseFloat(data[4])*100,
		counter: counter
	}
	return json;
}
