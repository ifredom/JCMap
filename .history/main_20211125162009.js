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

	var count = 1000 //创建一个要素数组
	var markers = new Array(count) //坐标偏移量
	var e = 8500000
	for (var i = 0; i < count; i++) {
		//要素坐标
		var coordinates = [3 * e * Math.random() - e, 2 * e * Math.random() - e] //新建点要素
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

// var features = new Array(dataSource.length)
// for (var i = 0; i < dataSource.length; i++) {
// 	var coordinate = [lat[i], lon[i]]
// 	coordinate.map(parseFloat)
// 	//  console.log("转换后经纬度：" + coordinate);

// 	var attr = {
// 		userName: userName[i],
// 		lat: lat[i],
// 		lon: lon[i]
// 	}
// 	features[i] = new ol.Feature({
// 		geometry: new ol.geom.Point(coordinate),
// 		attribute: attr
// 	})
// } //创建要素的数量 //10000个点没有任何压力，50000个点稍微有些卡了，100000个点可以把浏览器卡崩溃
