var
ElasticSearchClient = require('elasticsearchclient'),
	_ = require('lodash'),
	express = require('express');

var app = express();
app.listen(3200)

app.get('/', function(req, res) {
	var data = req.query
	esCall(data, function(err, message) {
		res.send(message)
	})

})

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};
var esClient = new ElasticSearchClient(serverOptions);


function esCall(data, callback) {
	var offset = (data.offset === undefined) ? 0 : data.offset;
	var limit = (data.limit === undefined) ? 100 : data.limit;
	var per = data.q
	per.split('').length
	
	var tile = function(per){
		switch(per){
		case 1:
			return 95
			break
		case 2:
			return 90
			break			
		case 3:
			return 80
			break			
		default:
			return 10			
		}
	}(per)

	var objQuery = {
		"from": offset,
		"size": limit,
		"sort": [{
			"percentile": {
				"order": "desc"
			}
		}],
		"query": {
			"bool": {
				"should": {
					"multi_match": {
						"query": data.q,
						"operator": "and",
						"type": "phrase_prefix",
						"fields": ["name.en_US","name.zh_TW"]
					}
				}
			}
		}
		,
		"filter": {
			"numeric_range": {
				"percentile": {
					"gte": tile
				}
			}
		}
	}
	objQuery.fields = ['name', 'percentile']



	esClient.search('eastbnb', 'region', objQuery)
		.on('data', function(data) {
		// console.log(data);
		b = JSON.parse(data)
		if (b.error) callback(b.error, null)
		else {
			o = {}
			o.count = b.hits.total;
			o.data = [];
			data = b.hits.hits;
			// console.log(data);
			_.each(data, function(d) {
				if (d['fields'].type == 'property') d['fields']._id = d._id
				o.data.push(d['fields'])

			})
			callback(null, o)
		}
	})

		.on('error', function(error) {
		callback(error, null)
	})
		.exec()

}