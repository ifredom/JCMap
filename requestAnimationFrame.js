var progress = 0;
var moveFeature2 = function () {
  var speed = 200;
  progress += 1;
  if (progress % speed == 0) {
    var currentPoint = new ol.geom.Point(routeCoords[progress / speed]);
    var dx =
      routeCoords[progress / speed][0] - routeCoords[progress / speed - 1][0];
    var dy =
      routeCoords[progress / speed][1] - routeCoords[progress / speed - 1][1];
    var rotation = Math.atan2(dy, dx);
    var styleGeomarker = new ol.style.Style({
      image: new ol.style.Icon({
        src: "images/taxi.png",
        rotateWithView: false,
        rotation: -rotation,
      }),
    });
    var feature = new ol.Feature(currentPoint);
    vectorLayer2.getSource().clear();
    vectorLayer2.getSource().addFeature(feature);
    vectorLayer2.setStyle(styleGeomarker);
  }
  if (progress % speed != 0) {
    var arcGenerator = new arc.GreatCircle(
      {
        x: routeCoords[Math.floor(progress / speed)][0],
        y: routeCoords[Math.floor(progress / speed)][1],
      },
      {
        x: routeCoords[Math.floor(progress / speed + 1)][0],
        y: routeCoords[Math.floor(progress / speed + 1)][1],
      }
    );
    var arcLine = arcGenerator.Arc(speed, { offset: 0 }); //在两个点之间生成100个点 js地址为https://api.mapbox.com/mapbox.js/plugins/arc.js/v0.1.0/arc.js
    var line = new ol.geom.LineString(arcLine.geometries[0].coords);
    var lineFeature = new ol.Feature({
      type: "route",
      geometry: line,
    });
    var currentPoint = new ol.geom.Point(
      arcLine.geometries[0].coords[progress % speed]
    );
    var dx =
      arcLine.geometries[0].coords[progress % speed][0] -
      arcLine.geometries[0].coords[(progress % speed) - 1][0];
    var dy =
      arcLine.geometries[0].coords[progress % speed][1] -
      arcLine.geometries[0].coords[(progress % speed) - 1][1];
    var rotation = Math.atan2(dy, dx);
    var styleGeomarker = new ol.style.Style({
      image: new ol.style.Icon({
        src: "images/taxi.png",
        rotateWithView: false,
        rotation: -rotation,
      }),
    });
    var feature = new ol.Feature(currentPoint);
    vectorLayer2.getSource().clear();
    vectorLayer2.getSource().addFeature(feature);
    helpTooltipElement.innerHTML =
      "名称：测试" +
      "<br>" +
      "当前速度：75km/h" +
      "<br>" +
      "当前电量：90%" +
      "<br>" +
      "经纬度：" +
      (arcLine.geometries[0].coords[progress % 100][0] + "").substring(0, 8) +
      "," +
      (arcLine.geometries[0].coords[progress % 100][1] + "").substring(0, 7);
    helpTooltip.setPosition(arcLine.geometries[0].coords[progress % 100]);
  }
  if (progress / speed < routeLength - 1) {
    requestAnimationFrame(moveFeature2);
  }
};
