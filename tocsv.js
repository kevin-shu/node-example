var async = require('async');
var _ = require('lodash');
var redis = require("redis"),
client = redis.createClient();
var arr = []
var i =0;

var fs = require('fs');
var stream = fs.createWriteStream("my_file3.csv");
stream.once('open', function(fd) {
  stream.write("name,count\n");
});
client.hgetall('percentile',function(err,reply){
    Object.keys(reply).forEach(function(key){
        if(_.indexOf(arr,key)==-1){
            arr.push(key)
            stream.write('"' + key + '"' +','+ reply[key] + '\n')
        }
    })
    stream.end();
})