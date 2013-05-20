var ElasticSearchClient = require('elasticsearchclient');

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};
var esClient = new ElasticSearchClient(serverOptions);

var data = {
	q: "BLA BLA BLA BLA",
	locale: "en_US"
};

searchInRegion(data);

function searchInRegion(data) {

	data.q = encodeURI(data.q)

	var qryObj = {
			"from": 0,
			"size": 1,
			"query": {
				"bool": {
					"should": {
						"multi_match": {
							"query": data.q,
							"operator": "and",
							"type": "phrase_prefix",
							"fields": [ "name.en_US", "name.zh_TW","name.ja_JP","name.zh_CN" ]
						}
					}
				}
			}
		};

	esClient.search('eastbnb', 'region', qryObj)
	.on('data', function(_data) {
		var obj = JSON.parse(_data).hits.hits[0];
		if (obj) {
			console.log("Found!");
		} else {
			console.log("Not found in Region...");
			esClient.update(	
				'eastbnb', 'bench', data.q, 
				{script:"ctx._source.put('"+data.locale+"', ctx._source.get('"+data.locale+"')!=null ? ctx._source.get('"+data.locale+"')+1:1);"},
				function(err, _data){
					console.log(_data);
					// console.log(typeof _data);
					if ( JSON.parse(_data).error ) {
						console.log("Not found in Bench...")
						var new_data = {};
						new_data[data.locale] = 1;
						esClient.index(	
							'eastbnb', 'bench', 
							new_data,
							data.q,
							function(err, _data){
								console.log(_data);
							}
						);
					}
				}
			);
		}
	})
	.on('done', function() {})
	.on('error', function(error) {})
	.exec();

}

		

