import './style.css'
import JC from './map/index.js'

const map = new JC.Map('map', {
	center: [88.132212, 38.660361],
	zoom: 6,
	minZoom: 3,
	maxZoom: 18,
	zoomShow: true
})
let marker = null

map.on('complete', function () {
	// 地图图块加载完成后触发

	// marker = new JC.Marker({
	// 	map,
	// 	position: [91.132212, 29.660361]
	// })
	marker = new JC.Marker({
		map,
		position: [91.132212, 29.660361],
		offset: [-30, -20],
		content: `<div style='font-size: 12px;
		    line-height:1;
		    background-color: #FFF;
		    border: 1px solid blue;
		    padding: 2px 3px;
		}'>Marker </div>` //设置文本标注内容
	})

	new JC.Marker({
		map,
		position: [91.132212, 29.660361],
		offset: [-30, -20],
		content: `<div style='font-size: 12px;
		    line-height:1;
		    background-color: #FFF;
		    border: 1px solid blue;
		    padding: 2px 3px;
		}'>Marker222222 </div>` //设置文本标注内容
	})
	// marker.setContent('content')
	// marker.setExtentData({
	// 	name: '自定义信息'
	// })
	// console.log(marker.getExtentData())
	// console.log(marker.getId())
	// marker.setId('2112dasdas')
	// setTimeout(() => {
	// 	map.removeMarker(marker)
	// }, 5000)
	// map.addMarker(marker)
	marker.on('click', function (ev) {
		console.log('click-------1')
		// marker.setTop()
	})

	marker.on('dblclick', function (ev) {
		console.log('dblclick-------dblclick')
	})

	marker.on('contextmenu', function (ev) {
		console.log('contextmenu-------')
	})

	// marker.on('dblclick', function (ev) {
	// 	console.log('dblclick')
	// })
	// marker.on('contextmenu', function (ev) {
	// 	ev.preventDefault()
	// 	console.log('contextmenu')
	// })

	// marker.off('click')
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
