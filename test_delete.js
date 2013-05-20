var ElasticSearchClient = require('elasticsearchclient');

var serverOptions = {
	host: '192.168.200.208',
	port: '9200'
};


var esClient = new ElasticSearchClient(serverOptions);

var obj = {abc:123};

for(var i=0; i<1000; i++){
	esClient.index('test', 'oh', obj)
	.on('data', function(_data) {
		console.log(i);
	})
	.exec();
}

//  curl -XDELETE 'http://192.168.200.208:9200/test/oh'