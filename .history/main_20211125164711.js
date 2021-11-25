import './style.css'

import JC from './map/index.js'

const map = new JC.Map('map', {
	center: [91.09378952485076, 29.639223595896773],
	zoom: 6,
	minZoom: 3,
	maxZoom: 18,
	zoomShow: true
})
let marker = null

map.on('complete', function () {
	// 地图图块加载完成后触发

	new JC.Marker({
		map,
		position: [91.132212, 29.660361],
		offset: [-30, -20]
	})

	marker = new JC.Marker({
		map,
		position: [86.68290367524494, 30.114927158327994],
		offset: [-30, -20],
		content: `<div style='font-size: 12px;
		    line-height:1;
		    background-color: #FFF;
		    border: 1px solid blue;
		    padding: 2px 3px;
		}'>overlayMarker </div>` //设置文本标注内容
	})

	// 随机创建1000个要素
	// var markers = []
	// for (var i = 1; i <= 200; i++) {
	// 		var coordinates = [120.00 + Math.random(), 30.00 + Math.random()];
	// 		var feature = new ol.Feature(new ol.geom.Point(coordinates));
	// 		markers.addFeature(feature);
	// }
	// for (var i = 1; i <= 200; i++) {
	// 		var coordinates = [120.01 + Math.random(), 30.01 + Math.random()];
	// 		var feature = new ol.Feature(new ol.geom.Point(coordinates));
	// 		markers.addFeature(feature);
	// }
	// for (var i = 1; i <= 200; i++) {
	// 		var coordinates = [120.02 + Math.random(), 30.02 + Math.random()];
	// 		var feature = new ol.Feature(new ol.geom.Point(coordinates));
	// 		markers.addFeature(feature);
	// }
	// for (var i = 1; i <= 200; i++) {
	// 		var coordinates = [120.03 + Math.random(), 30.03 + Math.random()];
	// 		var feature = new ol.Feature(new ol.geom.Point(coordinates));
	// 		markers.addFeature(feature);
	// }
	// for (var i = 1; i <= 200; i++) {
	// 		var coordinates = [120.04 + Math.random(), 30.04 + Math.random()];
	// 		var feature = new ol.Feature(new ol.geom.Point(coordinates));
	// 		markers.addFeature(feature);
	// }

	var count = 1000 //创建一个要素数组
	var markers = new Array(count) //坐标偏移量
	var e = 180
	for (var i = 0; i < count; i++) {
		//要素坐标
		var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e] //新建点要素
		markers[i] = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: `<div style='font-size: 12px;
			    line-height:1;
			    background-color: #FFF;
			    border: 1px solid blue;
			    padding: 2px 3px;
			}'>${i}</div>` //设置文本标注内容
		})
	}

	new JC.MarkerClusterer(map, markers)
})

map.on('click', function (ev) {
	console.log('map---click', ev.coordinate)
	// const marker = new JC.Marker({
	// 	map,
	// 	position: ev.coordinate
	// })
	// marker.setPosition(ev.coordinate)
	// marker.setStyle({
	// 	label: '1123label-'
	// })
	// console.log(marker.getStyle())
	// console.log(marker.getStyle())
	// marker.setTop()
})
