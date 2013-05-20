var ElasticSearchClient = require('elasticsearchclient'),
	async = require('async'),
	fs = require('fs');

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};

var esClient = new ElasticSearchClient(serverOptions);

var stream = fs.createWriteStream("ranking.csv");
stream.once('open', function(fd) {
	stream.write("id,percentile,clicks,unuseful,\n");
});

var qryObj = {
		"size": 100000,
		"query": {
			"match_all" : { }
		}
	};

esClient.search('eastbnb', 'regionT', qryObj)
.on('data', function(data) {
	var arr = JSON.parse(data).hits.hits;
	// obj._source.percentile = 83.48;
	//console.log(data);
	for (var i in arr) {
		var obj = arr[i],
			str = "";
		// console.log(obj);
		str = str + obj._id + "," +
			  (obj._source.percentile?obj._source.percentile:0) + "," +
			  (obj._source.clicks?obj._source.clicks:0) + "," +
			  (obj._source.unuseful?obj._source.unuseful:0) + "\n";
		console.log(str);
		stream.write(str);
	}
	// stream.end();
})
.on('done', function(){
    //always returns 0 right now
})
.on('error', function(error){
	console.log("Something wrong!");
    console.log(error);
})
.exec();