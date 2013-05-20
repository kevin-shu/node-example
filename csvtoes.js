var csv = require('csv');
var fs = require('fs')
var _ = require('lodash'),
	ElasticSearchClient = require('elasticsearchclient'),
	async = require('async');
var counter = 0;
csv().from.stream(fs.createReadStream(__dirname + '/percentile.csv'))
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
	// esClient.index('eastbnb', 'regionD', data)
	// 	.on('data', function(data) {
	// 	console.log(data)
	// })
	// 	.on('done', function() {
	// 	cb()
	// })
	// 	.exec()
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
						"fields": ["name.en_US"]
					}
				}
			}
		}
	}

	esClient.search('eastbnb', 'regionT', qryObj)
		.on('data', function(_data) {
		var obj = JSON.parse(_data).hits.hits[0];
		if (obj) {
			obj._source.percentile = data.percentile;
			var _id = obj._id;
			var _source = obj._source;
			esClient.index('eastbnb', 'regionT', _source, _id)
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
		percentile: parseFloat(data[4].split('%')[0]),
		counter: counter
	}
	// console.log(json);
	return json;
}