import './style.css'

// import JC from './map/index.js'

// const map = new JC.Map('map', {
// 	center: [87.59605808530915, 49.00832147325181],
// 	zoom: 5,
// 	minZoom: 3,
// 	maxZoom: 18,
// 	zoomShow: true
// })
// let marker = null

// map.on('complete', function () {
// 	// 地图图块加载完成后触发

// 	marker = new JC.Marker({
// 		map,
// 		position: [91.132212, 29.660361],
// 		offset: [-30, -20],
// 		content: `<div style='font-size: 12px;
// 		    line-height:1;
// 		    background-color: #FFF;
// 		    border: 1px solid blue;
// 		    padding: 2px 3px;
// 		}'>Marker </div>` //设置文本标注内容
// 	})

// 	new JC.Marker({
// 		map,
// 		position: [116.43987300838496, 39.89695039561123],
// 		offset: [-30, -20],
// 		content: `<div style='font-size: 12px;
// 		    line-height:1;
// 		    background-color: #FFF;
// 		    border: 1px solid blue;
// 		    padding: 2px 3px;
// 		}'>Marker222222 </div>` //设置文本标注内容
// 	})
// 	// marker.setContent('content')
// 	// marker.setExtentData({
// 	// 	name: '自定义信息'
// 	// })
// 	// console.log(marker.getExtentData())
// 	// console.log(marker.getId())
// 	// marker.setId('2112dasdas')
// 	// setTimeout(() => {
// 	// 	map.removeMarker(marker)
// 	// }, 5000)
// 	// map.addMarker(marker)
// 	// marker.on('click', function (ev) {
// 	// 	console.log('click-------1')
// 	// 	// marker.setTop()
// 	// })

// 	// marker.on('dblclick', function (ev) {
// 	// 	console.log('dblclick-------dblclick')
// 	// })

// 	// marker.on('contextmenu', function (ev) {
// 	// 	console.log('contextmenu-------')
// 	// })

// 	// marker.on('dblclick', function (ev) {
// 	// 	console.log('dblclick')
// 	// })
// 	// marker.on('contextmenu', function (ev) {
// 	// 	ev.preventDefault()
// 	// 	console.log('contextmenu')
// 	// })

// 	// marker.off('click')
// })

// map.on('click', function (ev) {
// 	console.log('map---click', ev.coordinate)
// 	// const marker = new JC.Marker({
// 	// 	map,
// 	// 	position: ev.coordinate
// 	// })
// 	// marker.setPosition(ev.coordinate)
// 	// marker.setStyle({
// 	// 	label: '1123label-'
// 	// })
// 	// console.log(marker.getStyle())
// 	// console.log(marker.getStyle())
// 	// marker.setTop()
// })

//天地图路网
var tian_di_tu_road_layer = new ol.layer.Tile({
	//title: "天地图路网",
	source: new ol.source.XYZ({
		url: 'http://t4.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=49ea1deec0ffd88ef13a3f69987e9a63'
	})
})
//天地图注记
var tian_di_tu_annotation = new ol.layer.Tile({
	title: '天地图文字标注',
	source: new ol.source.XYZ({
		url: 'http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=49ea1deec0ffd88ef13a3f69987e9a63'
	})
})
//天地图卫星影像
var tian_di_tu_satellite_layer = new ol.layer.Tile({
	title: '天地图卫星影像',
	source: new ol.source.XYZ({
		url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=49ea1deec0ffd88ef13a3f69987e9a63'
	})
})
var map = new ol.Map({
	target: 'g2map', //地图标签id
	layers: [],
	view: new ol.View({
		center: [12519281, 4118382], //地图中心点位置
		zoom: 12
	})
})
map.addLayer(tian_di_tu_road_layer) //天地图路网
map.addLayer(tian_di_tu_annotation) //天地图注记
//map.addLayer(tian_di_tu_satellite_layer);//天地图卫星影像
