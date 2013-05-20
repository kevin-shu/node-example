var ElasticSearchClient = require('elasticsearchclient');

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};

var esClient = new ElasticSearchClient(serverOptions);

getData();
console.log("WHY!");

function getData(){
	esClient.update("eastbnb","regionT", "50bef58d5865f4e3060043ac", { 
		doc:{percentileOfClicks:99} ,
		script : "ctx._source.percentileTotal = ctx._source.percentile + percentileOfClicks",
	    "params" : {
	        "percentileOfClicks" : 99
	    }
	})
	// esClient.get("eastbnb","regionT","50bef58d5865f4e3060043ac")
	.on("data", function(data){
		data = JSON.parse(data);
		console.log(data);
	})
	.on('done', function() {
		console.log("finished!");
	})
	.exec();
}
