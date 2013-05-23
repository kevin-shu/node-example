var ElasticSearchClient = require('elasticsearchclient'),
	mongojs= require('mongojs'),
	ObjectId = mongojs.ObjectId,
	db = mongojs("192.168.200.135:27017/production_eastbnb"),
	mycollection = db.collection('area');
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


mycollection.find({"parent.pid" : "176"},function(err, doc){
	console.log(doc);
});

nestedSearch(["37", "77", "89", "94", "104", "108", "161", "176"]);

function nestedSearch(region_ids) {
	for (var i=region_ids.length-1; i>=0; i--) {
		// console.log(region_ids[i]);

		mycollection.find({"parent.pid" : region_ids[i]},function(err, docs){
			region_ids = docs.map(function(input){return input.region_id});
			// console.log(region_ids);
			nestedSearch(region_ids);
		});
		var qryObj = {
			"query": {
				"match" : { "region_id" : region_ids[i] }
			}
		};

		esSource.search('eastbnb', 'region', qryObj)
		.on('data', function(data) {
			var hits = JSON.parse(data).hits;
			if(hits){
				// console.log(JSON.parse(data).hits);
				hits = hits.hits;
				if (hits[0]) {
					esBackup.index('eastbnb', 'eight_countries', hits[0]._source, hits[0]._id)
					.on('data', function(_data) {
						console.log(_data);
					})
					.exec();
				}
			}
		})
		.exec();
	}
}