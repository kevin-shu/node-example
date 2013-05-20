var ElasticSearchClient = require('elasticsearchclient'),
	express = require('express');

var dataSource = {
	host: '54.249.13.145',
	port: '9200'
};

var app = express();
app.listen(3200);

app.get('/', function(req, res) {
	var data = req.query;
	esCall(data, function(err, message) {
		res.send(message)
	})

})

var esSource = new ElasticSearchClient(dataSource);


function esCall(data, cb) {

	var offset= (data.offset===undefined)?0:data.offset;
	var limit= (data.limit===undefined)?30:data.limit;
	var per = data.q;
	per = per.split('').length;

	var conditions = function(per){
		switch(per){
		case 1:
			return {rank:1,qryType:0}
			break
		case 2:
			return {rank:2,qryType:0}
			break			
		case 3:
			return {rank:3,qryType:1}
			break			
		default:
			return {rank:4,qryType:1}		
		}
	}(per)

	var queryObjects = [
		{	
			"bool":{
            	"should":{
                    "multi_match" : {
                        "query" :data.q,
                        "operator" : "and",
                        "type" : "phrase_prefix",
                        "fields" : [ "name.en_US", "name.zh_TW","name.ja_JP","name.zh_CN" ]
                    }
                }
            }
        },
        {
			"bool":{
				"should":[
					{ "wildcard":{ "name.en_US" : "*"+data.q+"*" } },
					{ "wildcard":{ "name.zh_TW" : "*"+data.q+"*" } },
					{ "wildcard":{ "name.ja_JP" : "*"+data.q+"*" } },
					{ "wildcard":{ "name.zh_CN" : "*"+data.q+"*" } }
				],
    			"minimum_number_should_match" : 1,
    			"boost" : 1.0
			}
		}
	];

    var qryObj ={
        "from" : offset, "size" : limit,
        "sort": [
			{
				"percentileTotal": {
					"order": "desc"
				}
			},
			{
				"percentile": {
					"order": "desc"
				}
			}
		],
        "query": queryObjects[conditions.qryType],
        "filter" : {
            "and": [
                {
                    "exists": {
                        "field": "position.lat"
                    }
                },
				{
					"numeric_range": {
						"rank": {
							"lte": conditions.rank
						}
					}
				}
            ]
        }
    };


	esSource.search('eastbnb', 'region', qryObj)
	.on('data', function(data) {
		console.log(JSON.parse(data));
		var hits = JSON.parse(data).hits.hits;
		var result = [];
		for (var _i in hits) {
			result.push(hits[_i]._source.name);
		}
		cb(null, result);
	})
	.on('done', function(){})
	.on('error', function(error){
		console.log("Something wrong!");
	    console.log(error);
	})
	.exec();

}