var csv = require('csv');
var fs = require('fs')
var _ = require('lodash'),
	ElasticSearchClient = require('elasticsearchclient'),
	async = require('async');
var counter = 0;
csv().from.stream(fs.createReadStream(__dirname + '/search_data.csv'))
.on('record', function(row, index) {
	q.push(formatJson(row, counter), function(err) {
		if (err) console.log(err)
	})
	counter = counter+1;
})
.on('end', function(count) {
	console.log('Number of lines: ' + count);
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
	host: '192.168.200.208',
	port: '9200'
};
var esClient = new ElasticSearchClient(serverOptions);


function saveJson(data, cb) {
	var qryObj = {
		"from": 0,
		"size": 1,
		"query": {
			"bool": {
				"should": {
					"multi_match": {
						"query": data.name,
						"operator": "and",
						"type": "phrase_prefix",
						"fields": ["name.en_US","name.zh_TW"]
					}
				}
			}
		}
	}

	esClient.search('eastbnb', 'regionT', qryObj)
		.on('data', function(_data) {
		var obj = JSON.parse(_data).hits.hits[0];
		if (obj) {
			if ( (typeof obj._source.clicks)=="string" || (typeof obj._source.clicks)=="undefined" ) {
				obj._source.clicks=0
			}
			obj._source.clicks = parseInt(obj._source.clicks,10) + parseInt(data.clicks,10);
			var id = obj._id;
			var src = obj._source;
			esClient.index('eastbnb', 'regionT', src, id)
			.on('data', function(_data) {
				console.log(data.counter);
				// console.log(data.name + "(" + JSON.parse(_data)["_id"] + "):" + data.percentile);
				cb();
			})
			.exec();
		} else {
			console.log("Can't find : " + data.name);
			cb();
		}
	})
	.on('done', function() {})
	.on('error', function(error) {
		console.log("Something wrong!");
		console.log(error);
		cb(error);
	})
	.exec();
}

function formatJson(data, counter) {
	var json = {
		name: data[0].toLowerCase(),
		clicks: data[1],
		counter: counter
	}
	// console.log(json);
	return json;
}