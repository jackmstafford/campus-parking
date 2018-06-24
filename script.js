function initMap() {
    //console.log('initMap called');
    initTime();
    $('#aCheck input')
        .prop('checked', true)
        .change(aCheckChange);
    var maps = google.maps
    var campus = {lat: 40.764238, lng: -111.845855}; 
    map = new maps.Map(
            $('#map')[0], 
            {
                zoom: 15, 
                center: campus,
                mapTypeId: 'satellite',
                tilt: 0,
            });
    map.addListener('click', mapClicked);
    infoWindow = new google.maps.InfoWindow();
    var lotColors = { 
        a: '#785128', 
        u: '#ff0000',
    };
    lotData = {colors: lotColors};
    makeLots(coords, lotData);
}

function mapClicked() {
    infoWindow.close();
    console.log('mapClicked');
}

function initTime() {
    var $timeSel = $('#time');
    $timeSel.change(timeChange);
    for(var i = 0; i < 24; i++)
        $timeSel.append($('<option>').val(i).text(convert24to12(i)));
    var now = new Date().getHours();
    $timeSel.find('[value=' + now + ']').prop('selected', true);
}

function getTime() {
    return parseInt($('#time :selected').val());
}

function timeChange() {
    updateLots(lotPolygons, lotData);
}

function aCheckChange() {
    updateLots(lotPolygons, lotData);
    //console.log('aCheckChange');
}

function showALots() {
    return $('#aCheck input').prop('checked');
}

function makeLots(coords, data) {
    lotPolygons = {a: [], u:[]};
    var fillOpacity = 0.3;
    var colors = data.colors;
    var defaultSwitchTime = 2400;
    $.each(coords, function(lotName, lotCoords) {
        var switchTime = lotCoords.switchTime;
        if(switchTime == undefined)
            switchTime = defaultSwitchTime; 
        var name = lotCoords.niceName;
        $.each(lotCoords, function(lotType, coords) {
            if(lotType in colors) {
                var color = colors[lotType];
                var wsLot = new google.maps.Polygon({
                    path: coords,
                    fillColor: color,
                    fillOpacity: fillOpacity,
                    lotName: lotName,
                    lotType: lotType,
                    niceName: name,
                    strokeColor: color,
                    switchTime: switchTime,
                });
                wsLot.setMap(map);
                wsLot.addListener('click', polygonClicked);
                lotPolygons[lotType].push(wsLot);
            }
        });
    });
    // handle time logic
    updateLots(lotPolygons, lotData);
}

function updateLots(lotPolygons, data) {
    var time = getTime();
    var colors = data.colors;
    $.each(lotPolygons.a, function(i, polygon) {
        // switch to u lot
        var color = colors.a;
        var vis = showALots();
        if(polygon.switchTime <= time) {
            color = colors.u;
            vis = true;
        }
        polygon.setOptions({
            fillColor: color,
            strokeColor: color,
            visible: vis,
        });
    });
}

function polygonClicked(clickInfo) {
    infoWindow.close();
    var $lotInfo = $('<div class="lotInfo">');
    $lotInfo.append($('<div>').append($('<b>').text(this.niceName)));
    if(this.lotType == 'u')
        $lotInfo.append($('<div>').text('Always U'));
    else
        $lotInfo.append($('<div>').text('A until ' + convert24to12(this.switchTime)));
    infoWindow.setOptions({
        position: clickInfo.latLng,
        content: $lotInfo[0],
    });
    infoWindow.open(map);
}

function convert24to12(hours) {
    var ap = hours < 12 ? ' AM' : ' PM';
    var newHours = ((hours + 11) % 12 + 1);
    return newHours + ap;
}
