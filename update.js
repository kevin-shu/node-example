// Update "高雄"、"台中"、"台南"三個城市的rank

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

console.log("start");

var qryObj = {
		"query": {
			"bool": {
				"should": [
						{ "match": { "name.en_US" : "Kaohsiung"} },
						{ "match": { "name.en_US" : "Taichung"} },
						{ "match": { "name.en_US" : "Tainan"} }
					]
			}
		}
	};

	//["Kaohsiung","Taichung","Tainan"]

var counter = 0;

esSource.search('eastbnb', 'region', qryObj)
.on('data', function(data) {
	var hits = JSON.parse(data).hits.hits;
	update(hits);
})
.on('done', function(){})
.on('error', function(error){
	console.log("Something wrong!");
    console.log(error);
})
.exec();

function update(hits) {
	for (var _i in hits) {
		console.log(hits[_i])
	}
}