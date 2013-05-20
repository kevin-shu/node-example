select: function(result, $input) {
    if(LANG=='en_US'){
        var name = result.name.en_US;
    }
    else{
        if(result.name[LANG]){
            var name =result.name[LANG] + '('+result.name.en_US+')';
        }
        else{
           var name = result.name.en_US ; 
        }
    }

    var unusedCity = [];
    for (var _i in regionData) {
        if (regionData[_i].region_id !== result.region_id) {
            unusedCity.push(regionData[_i].region_id);
        }
    }
    var _data = {
                    chosenCity : result.region_id,
                    unusedCity : unusedCity
                };
    $.post( "/path/to/api/routing",
            _data
    ).always(function(){console.log(_data)});

    $input.val(name);
    $input.data('lat',result.position.lat);
    $input.data('lon',result.position.lon);
},