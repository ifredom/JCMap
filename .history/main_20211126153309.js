import './style.css'

import JC from './map/index.js'
const imgBase64 = 'https://openlayers.org/en/latest/examples/data/icon.png'
const map = new JC.Map('map', {
	center: [119.71080146997953, 30.63935456193297],
	zoom: 5,
	minZoom: 3,
	maxZoom: 18,
	zoomShow: true
})

map.on('complete', function () {
	// 地图图块加载完成后触发

	new JC.Marker({
		map,
		position: [91.132212, 29.660361],
		offset: [-30, -20]
	})

	const buildContent = function () {
		return `<img src="${imgBase64}" alt="">`
	}

	// 随机创建1000个要素
	let markers = []
	// for (let i = 1; i <= 200; i++) {
	// 	let coordinates = [120.0 + Math.random(), 30.0 + Math.random()]
	// 	let marker = new JC.Marker({
	// 		position: coordinates,
	// 		offset: [-30, -20]
	// 		// content: buildContent()
	// 	})
	// 	markers.push(marker)
	// }

	for (let i = 1; i <= 200; i++) {
		let coordinates = [110.07 + Math.random(), 31.07 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}

	// for (let i = 1; i <= 200; i++) {
	// 	let coordinates = [111.07 + Math.random(), 30.07 + Math.random()]
	// 	let marker = new JC.Marker({
	// 		position: coordinates,
	// 		offset: [-30, -20],
	// 		content: buildContent()
	// 	})
	// 	markers.push(marker)
	// }

	// for (let i = 1; i <= 10000; i++) {
	// 	let coordinates = [101.07 + Math.random(), 31.07 + Math.random()]
	// 	let marker = new JC.Marker({
	// 		position: coordinates,
	// 		offset: [-30, -20],
	// 		content: buildContent()
	// 	})
	// 	markers.push(marker)
	// }

	const markerClusterer = new JC.MarkerClusterer(map, markers)
	// markerClusterer.setMarkers(markerList)

	let marker2 = new JC.Marker({
		position: [118.44524715557696, 33.461747354231065],
		offset: [-30, -20],
		content: `<div style='font-size: 12px;
		    line-height:1;
		    background-color: #FFF;
		    border: 1px solid blue;
		    padding: 2px 3px;
		}'>overlayMarker </div>` //设置文本标注内容
	})

	let marker3 = new JC.Marker({
		position: [91.71752669278658, 35.53180280051738],
		offset: [-30, -20],
		content: `<div style='font-size: 12px;
		    line-height:1;
		    background-color: #FFF;
		    border: 1px solid blue;
		    padding: 2px 3px;
		}'>overlayMarker </div>` //设置文本标注内容
	})

	// markerClusterer.addMarker([marker2, marker3])

	// setTimeout(() => {
	// 	markerClusterer.removeMarker([marker2, marker3])
	// 	console.log(markerClusterer.getMarkers())
	// }, 3000)
})

map.on('click', function (ev) {
	console.log('map---click', ev.coordinate, map.getZoom())

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

// 1. 添加 非 OverlayMarker 的聚合情况
// 2. 添加事件
