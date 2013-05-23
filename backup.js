var ElasticSearchClient = require('elasticsearchclient');
var dataSource = {
	host: '54.249.13.145',
	port: '9200'
};
var target = {
	host: '54.249.13.145',
	port: '9200'
};
var esSource = new ElasticSearchClient(dataSource);
var esBackup = new ElasticSearchClient(target);

var qryObj = {
		"size": 100000,
		"query": {
			"match_all" : { }
		}
	};

var counter = 0;

esSource.search('eastbnb', 'region', qryObj)
.on('data', function(data) {
	var hits = JSON.parse(data).hits.hits;
	backup(hits);
})
.on('done', function(){})
.on('error', function(error){
	console.log("Something wrong!");
    console.log(error);
})
.exec();

function backup(hits) {
	for (var _i in hits) {
		var src = hits[_i]._source;
		esBackup.index('eastbnb', 'regionT', src, hits[_i]._id)
		.on('data', function(_data) {
			console.log(counter);
			counter += 1;
		})
		.exec();
	}
}
//  curl -XDELETE 'http://54.249.13.145:9200/eastbnb/regionT'