import './style.css'

import JC from './map/index.js'
const imgBase64 =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHrSURBVEjHrdW9a1NxFMbxT9qmNWmaRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIoggFCko4lJEEaq296aNtvk5JIG2NGmSOjzbuV9+9zzPOUcIwUbCvg7uYGtD9RsVdDCSJh7iT5ofONEyFLkeJvcw/5EQCE8JvRTSjKG9KSiOdvMtz0KxAqzqK+E4cZZ3GNgQikQXV7PET9bAVmqZMMbfNPM4UxOK/iwvB5mfqQNcqTeEHcQ93EVqFRRDaWZHKS41CKzqN2GYQoYv2BtCoJNrvRRe1PnwPeFGpZ+1am5TSrGQ5CJc2E1UqlH8nJCuKFN5WS3wIIUko5DIMjVOab3CEUIbASFLeFwD+Kgct09or/b0cI54rsWXRoQ+Yhxb5X4PDy9TbKWnlyj28mC9SO1MEX9u0v0P5b+YQ9+64e/i+iniZqBHiJLk603Ulm6+P2sQeI9Slmm01Z19DO8iWmog9LmyOYcaWihZ3t5kuR40z2KWiWa21P4eCj/rTFjFnG1N7dMME3kW1wJLhANE7ZxvZUlvTxFNr4GOl82ZQqKlc9LJlZNEVeBseVRjHGz5RiGZYWayAj3HQoZbmz58OD1A9JqQ4hdym4ZWIvaqn8UEZ//Lia5GrJP79cxZqX+cR1gC9S9TwAAAAABJRU5ErkJggg==' // 图标的url
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
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.0 + Math.random(), 30.0 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.02 + Math.random(), 30.02 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.03 + Math.random(), 30.03 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.06 + Math.random(), 30.06 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}

	let markerList = []
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.07 + Math.random(), 30.07 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markerList.push(marker)
	}
	map.addMarker(markers)
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

	markerClusterer.addMarker([marker2, marker3])

	setTimeout(() => {
		markerClusterer.removeMarker([marker2, marker3])
		// console.log(markerClusterer.getMarkers())
	}, 3000)
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

// 1. 添加 非 OverlayMarker 的聚合情况
// 2. 添加事件
