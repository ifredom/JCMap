import * as turf from '@turf/turf'
import JC from '../map/index.js'

const speedInput = document.getElementById('speed')
const distanceInput = document.getElementById('distance')

const startButton = document.getElementById('start')
const pauseButton = document.getElementById('pause')
const resumeButton = document.getElementById('resume')
const stopButton = document.getElementById('stop')

const map = new JC.Map('map', {
	center: [116.48538303047181, 39.99969219049072],
	zoom: 16,
	minZoom: 3,
	maxZoom: 18
})

var line = turf.lineString([
	[109.502991, 29.68718],
	[108.837829, 32.969237],
	[113.567871, 37.200787]
])
var options = { units: 'miles' }

var length = turf.length(line, options)

var along = turf.along(line, length * 0.3, options)

let startPos = turf.point([116.48538303047181, 39.99969219049072])
let endPos = turf.point([116.48538303047181, 39.99969219049072])
let bearing = turf.bearing(startPos, endPos)

console.log('line 30% 长度 位置的点对象 ：', along.geometry, bearing)

const marker = new JC.Marker({
	map: map,
	position: [116.478935, 39.997761],
	// icon: 'https://webapi.amap.com/images/car.png',
	content: `<div><img src="https://webapi.amap.com/images/car.png" alt="" style="vertical-align:middle;"></div>`,
	angle: -90
})

let animating = ''

const lineArr = [
	[116.478935, 39.997761],
	[116.478939, 39.997825],
	[116.478912, 39.998549],
	[116.478912, 39.998549],
	[116.478998, 39.998555],
	[116.478998, 39.998555],
	[116.479282, 39.99856],
	[116.479658, 39.998528],
	[116.480151, 39.998453],
	[116.480784, 39.998302],
	[116.480784, 39.998302],
	[116.481149, 39.998184],
	[116.481573, 39.997997],
	[116.481863, 39.997846],
	[116.482072, 39.997718],
	[116.482362, 39.997718],
	[116.483633, 39.998935],
	[116.48367, 39.998968],
	[116.484648, 39.999861],
	[116.4889679286499, 40.003822062536884],
	[116.49177741676331, 40.00160192330932],
	[116.48720693260194, 39.9987695105896]
]

let polyline = new JC.Polyline({
	map,
	path: lineArr,
	map: map,
	showDir: true,
	strokeColor: '#28F', //线颜色
	strokeWeight: 6, //线宽
	extData: null // 自定义信息
})

// console.log(polyline);

var passedPolyline = new JC.Polyline({
	map: map,
	// path: lineArr,
	strokeColor: '#000', //线颜色
	// strokeOpacity: 1,     //线透明度
	strokeWeight: 6, //线宽
	// strokeStyle: "solid"  //线样式
	zIndex: 8
})

// marker.setAnimation('AMAP_ANIMATION_BOUNCE');

// passedPolyline.setPath(lineArr);
marker.on('moving', function (e) {
	// console.log('moving', e)
	// console.log(marker.getRatio());
	distanceInput.value = marker.getRatio() * 10
})

marker.on('click', function () {
	console.log('click-------')
	marker.pauseMove()
})
marker.on('dblclick', function () {
	console.log('1111111111111111111')
	marker.resumeMove()
})

function startAnimation() {
	animating = 'start'
	marker.moveAlong(lineArr, Number(speedInput.value))
}

speedInput.onchange = e => {
	marker.updateMoveSpeed(e.target.value)
}

distanceInput.onchange = e => {
	marker.moveAlong(lineArr, Number(speedInput.value))
	marker.updateMoveDistance(e.target.value / 1000)
}

function pauseAnimation() {
	marker.pauseMove()
}

function resumeAnimation() {
	marker.resumeMove(lineArr, 100)
}

function stopAnimation() {
	animating = false
	startButton.textContent = 'Start Animation'
	marker.stopMove()
}

startButton.addEventListener('click', function () {
	startAnimation()
})
pauseButton.addEventListener('click', function () {
	pauseAnimation()
})

resumeButton.addEventListener('click', function () {
	resumeAnimation()
})

stopButton.addEventListener('click', function () {
	stopAnimation()
})

// map.on('click', e => {
// 	console.log(e.coordinate)
// })
// map.on('dblclick', e => {
// 	console.log('dblclick', e.coordinate)
// })

// 2. 事件绑定，隐藏旧的图形，并提高层级
// 3. 设置驶过轨迹线 ， 通过获取到的分段驶过线，分段设置动画
