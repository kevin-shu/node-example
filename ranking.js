var ElasticSearchClient = require('elasticsearchclient');
var dataSource = {
	host: '54.249.13.145',
	port: '9200'
};
// var target = {
// 	host: '54.249.13.145',
// 	port: '9200'
// };
var esSource = new ElasticSearchClient(dataSource);
// var esBackup = new ElasticSearchClient(target);

var qryObj = {
		"size": 100000,
		"query": {
			"match_all" : { }
		}
	};

var counter = 0,
	sortfnCount = 0;

esSource.search('eastbnb', 'region', qryObj)
.on('data', function(data) {
	var hits = JSON.parse(data).hits.hits;
	hits.sort(sortFn);
	hits.forEach(ranking);
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
		esSource.index('eastbnb', 'region', src, hits[_i]._id)
		.on('data', function(_data) {
			// console.log(counter+" : "+src.rank);
			counter += 1;
		})
		.exec();
	}
}

function sortFn(a,b) {
	// console.log( "Sorting..."+(sortfnCount++) );
	return a._source.percentileTotal < b._source.percentileTotal
}

function ranking(elem, index) {
    if (index>=0 && index<5113) {
        elem._source.rank = 1;
    } else if (index>=5113 && index<10226) {
        elem._source.rank = 2;
    } else if (index>=10226 && index<25566) {
        elem._source.rank = 3;
    } else {
        elem._source.rank = 4;
    }
}