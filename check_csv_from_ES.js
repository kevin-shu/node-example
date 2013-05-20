var csv = require('csv');
var fs = require('fs')
var _ = require('lodash'),
	ElasticSearchClient = require('elasticsearchclient'),
	async = require('async');

var stream = fs.createWriteStream("doubleCheck.csv");
stream.once('open', function(fd) {});

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}


csv().from.stream(fs.createReadStream(__dirname + '/percentile.csv'))
.on('record', function(row, index) {
	q.push(formatJson(row), function(err) {
		if (err) console.log(err)
	})
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

	esClient.search('eastbnb', 'region', qryObj)
	.on('data', function(_data) {
		var obj = JSON.parse(_data).hits.hits[0];
		if (obj) {
			obj._source.percentile = data.percentile;
			var _id = obj._id;
			var _source = obj._source;
			stream.write('"' + obj._source.name.en_US + '"\n');
			cb();
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

function formatJson(data) {
	var json = {
		name: data[0].toLowerCase(),
		percentile: parseFloat(data[4].split('%')[0]),
	}
	// console.log(json);
	return json;
}