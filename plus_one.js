var ElasticSearchClient = require('elasticsearchclient');

// Change here!!!
var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};

var esClient = new ElasticSearchClient(serverOptions);

// Change here!!!
plus('6200819', ['3518','6178032']);

function plus(clicked, unused) {
	recordClicked(clicked);
	recordUnuseful(unused);
}

function recordClicked(clicked){
	var qryObj = {
			"from": 0,
			// "size": 10,
			"query": {
				"bool": {
					"should": {
						"multi_match": {
							"query": clicked,
							"operator": "and",
							"type": "phrase_prefix",
							"fields": ["region_id"]
						}
					}
				}
			}
		};

	esClient.search('eastbnb', 'region', qryObj)
	.on('data', function(data) {
		var objs = JSON.parse(data).hits.hits;
		console.log(objs);
		for (var i in objs) {
			var obj = objs[i];
			var src = obj._source;

			if( !src.clicks ) {
				src.clicks = 0;
			} if( !src.unuseful ) {
				src.unuseful = 0;
			} if( (typeof src.percentile) === "undefined" ) {
				src.percentile = 0;
			}

			src.clicks = parseInt(src.clicks,10)+1;
			src.point = parseInt(src.clicks,10)+parseInt(src.percentile,10)-parseInt(src.unuseful,10);
			esClient.index('eastbnb', 'region', src, obj._id)
			.on('data', function(_data) {
			})
			.exec();
		}
	})
	.on('done', function(){})
	.on('error', function(error){
		console.log("Something wrong!");
	    console.log(error);
	})
	.exec();
}

function recordUnuseful(unused) {

	for (var i in unused) {

		var qryObj = {
				"from": 0,
				// "size": 10,
				"query": {
					"bool": {
						"should": {
							"match": {
								"region_id": unused[i]
							}
						}
					}
				}
			};

		esClient.search('eastbnb', 'region', qryObj)
		.on('data', function(data) {
			var objs = JSON.parse(data).hits.hits;
			console.log(objs);
			for (var i in objs) {
				var obj = objs[i];
				var src = obj._source;

				if( !src.clicks ){
					src.unuseful = 0;
				} if( !src.unuseful ) {
					src.unuseful = 0;
				} if( (typeof src.percentile) === "undefined" ) {
					src.percentile = 0;
				}

				src.unuseful = parseInt(src.unuseful,10)+1;
				src.point = parseInt(src.clicks,10)+parseInt(src.percentile,10)-parseInt(src.unuseful,10);

				esClient.index('eastbnb', 'region', src, obj._id)
				.on('data', function(_data) {})
				.exec();
			}
		})
		.on('done', function(){})
		.on('error', function(error){
			console.log("Something wrong!");
		    console.log(error);
		})
		.exec();

	}
}