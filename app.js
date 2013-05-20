var ElasticSearchClient = require('elasticsearchclient'),
    axon = require('axon'),
    async = require('async');

var serverOptions = {
    host: '192.168.200.208',
    port: 9200,
    secure: false
};

var push = axon.socket('push');
push.format('json')
push.bind(3001)

var elasticSearchClient = new ElasticSearchClient(serverOptions);
var results;

function next(offset, limit) {
    return objQuery = {
        "from": offset,
        "size": limit,
        "query": {
            "filtered": {
                "query": {
                    "bool": {
                        "must": [{
                            "match_all": {}
                        }]

                    }
                }

            }
        }
    }
}

var count = 0;
var start = new Date()
console.log("start %s", start)
async.whilst(
    function() {
        return count < 55000; //54995
    },

    function(callback) {
        var qryObj = next(count, 20)
        count += 20;
        elasticSearchClient.search('eastbnb', 'region', qryObj, function(err, data) {
            results = JSON.parse(data).hits.hits
            var _n = -20;
            results.forEach(function(r) {
                push.send({
                    name: r._source.name.en_US,
                    count: count + _n
                });
                _n++;
            })
            callback(err)
        })
    },

    function(err) {
        end = new Date()  
        c = end - start
        console.log("end %s",c )

        console.log('error ? %s ',err)
    }
);