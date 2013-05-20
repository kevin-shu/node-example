var axon = require('axon');
var async = require('async');
var redis = require("redis"),
    client = redis.createClient();
var request = require('request')
var pull = axon.socket('pull');
pull.format('json')
pull.connect(3001)

var error = []
var qta = []
var url = 'http://api.ean.com/ean-services/rs/hotel/v3/list?apiKey=s29utvz48uh68g69ndhae3qh&cid=392174&city=';

var q = async.queue(function(msg, cb) {
    request.get(url + msg.name, function(a, b, c) {
        if (c == '<h1>403 Developer Over Qps</h1>') {
            console.log('quota ex')
            client.sadd("qto", msg.name, function(err, r) {
                cb()
            });
        } else {
            try {
                cd = JSON.parse(c)
                if (cd.HotelListResponse && cd.HotelListResponse.HotelList && cd.HotelListResponse.HotelList['@activePropertyCount']) {
                    client.hset("percentile", msg.name, cd.HotelListResponse.HotelList['@activePropertyCount'], function(err, r) {
                        cb()
                    });
                } else if (cd.HotelListResponse.EanWsError) {
                    client.hset("percentile", msg.name, 0, function(err, r) {
                        cb()
                    });
                }
            } catch (e) {
                console.log(c)
                console.log(msg.name)
                client.sadd("errparse", msg.name, function(err, r) {
                    cb()
                });
            }
        }
    })
}, 2);

pull.on('message', function(msg) {
    q.push(msg, function(err) {
        console.log(msg.count);
    })
})