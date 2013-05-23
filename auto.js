var
ElasticSearchClient = require('elasticsearchclient'),
	_ = require('lodash'),
	express = require('express');

var app = express();
app.listen(3200)

app.get('/', function(req, res) {
	var data = req.query;
	esCall(data, function(err, message) {
		res.send(message)
	})
})

var serverOptions = {
	host: '54.249.13.145',
	port: '9200'
};
var esClient = new ElasticSearchClient(serverOptions);


function esCall(data, callback) {
	var offset = (data.offset === undefined) ? 0 : data.offset;
	var limit = (data.limit === undefined) ? 30 : data.limit;
	var per = data.q;
	var per = per.split('').length;
	var tile = function(per){
		switch(per){
		case 1:
			return 1
			break
		case 2:
			return 2
			break			
		case 3:
			return 3
			break			
		default:
			return 4		
		}
	}(per);

	var objQuery = {
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
        "query": 
            {"bool":
                {"should":
                    {
                        "multi_match" : {
                                    "query" :data.q,
                                    "operator" : "and",
                                    "type" : "phrase_prefix",
                                    "fields" : [ "name.en_US", "name.zh_TW","name.ja_JP","name.zh_CN" ]
                                    }
                    }
                }
            },
        "filter" : {
                "and": [
                    {
                        "exists": {
                            "field": "position.lat"
                        }
                    }
                ]
            }
        }	;
    objQuery.fields = ['_id','name','position','type','region_id','percentile','percentileTotal','clicks','unuseful', 'rank'];



	esClient.search('eastbnb', 'eight_countries', objQuery)
	.on('data', function(data) {
		// console.log(data);
		b = JSON.parse(data)
		if (b.error) callback(b.error, null)
		else {
			o = {}
			o.count = b.hits.total;
			o.data = [];
			data = b.hits.hits;
			// console.log(data);
			_.each(data, function(d) {
				if (d['fields'].type == 'property') d['fields']._id = d._id
				o.data.push(d['fields'])

			})
			callback(null, o);
		}
	})
	.on('error', function(error) {
		callback(error, null)
	})
	.on('done', function(){
	})
	.exec()

}