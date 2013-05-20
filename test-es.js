var ElasticSearchClient = require('elasticsearchclient');

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};

var esClient = new ElasticSearchClient(serverOptions);

var qryObj = {
		"size": 100000,
		"query": {
			"match_all" : { }
		}
	};

esClient.search('eastbnb', 'region', qryObj)
.on('data', function(data) {
	var arr = JSON.parse(data).hits.hits;
	// console.log(data);
	var count = 0;
	for (var i in arr) {
		if ( (typeof arr[i]._source.unuseful)=="undefined" ) {
			console.log(arr[i]._id);
			count++;
		}
		// console.log(arr[i]);
	}
	console.log(count);
	// for (var i in arr) {
	// 	var obj = arr[i];
	// 	if ( !obj._source.clicks ) {
	// 		obj._source.clicks=0;
	// 	}
	// 	if ( !obj._source.unuseful ) {
	// 		obj._source.unuseful=0;
	// 	}
	// 	if ( !obj._source.percentile ) {
	// 		obj._source.percentile=0;
	// 	}
	// 	updateRegion(obj);
	// }
})
.on('done', function(){
    //always returns 0 right now
})
.on('error', function(error){
	console.log("Something wrong!");
    console.log(error);
})
.exec();

function updateRegion(obj, cb){
	var _id = obj._id;
	var _source = obj._source;
	var data = _source;
	data._id = _id;
	esClient.index('eastbnb', 'region', _source, _id)
	.on('data', function(data) {
	    console.log(data);
	    // cb();
	})
	.exec(); 
}

// curl -XGET 'http://192.168.200.208:9200/eastbnb/region/_search' -d '{query: {term :Taipei"}}'

// curl -XGET 'http://192.168.200.208:9200/eastbnb/region/_count' -d '{ query:{"version" : 1} }'