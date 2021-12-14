import JC from './map/index.js'
import './assets/style/style.css'

// https://openlayers.org/en/latest/examples/data/icon.png
const imgBase64 =
	'data:image/png;base64,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'

const buildContent = function () {
	return `<img src="${imgBase64}" alt="">`
}

const map = new JC.Map('map', {
	center: [116.48538303047181, 39.99969219049072],
	zoom: 16,
	minZoom: 3,
	maxZoom: 18
})

map.on('complete', function () {
	// 地图图块加载完成后触发
	console.log('map：complete-----')
})

new JC.Marker({
	map,
	position: [91.132212, 29.660361],
	offset: [-30, -20]
})

// 随机创建n个要素聚合物
const markerClusterer = inintMarkerClusterer(map)

const [marker1, marker2] = inintMarkers(map)

function inintMarkers(map) {
	let marker1 = new JC.Marker({
		position: [118.44524715557696, 33.461747354231065],
		offset: [-30, -20]
	})

	let marker2 = new JC.Marker({
		position: [112.76034654153298, 33.59101293004363],
		offset: [-30, -20],
		id: '11111111',
		content: `<div style='font-size: 12px;
          line-height:1;
          background-color: #FFF;
          border: 1px solid blue;
          padding: 2px 3px;
      }'>overlayMarker111111 </div>` //设置文本标注内容
	})

	marker2.on('click', function (ev) {
		marker2.setTop()
		console.log('marker2-------click')
	})
	marker1.on('click', function (ev) {
		console.log('marker1-------click', ev)
	})

	marker2.on('dblclick', function (ev) {
		console.log('marker2-------dblclick', ev)
	})

	return [marker1, marker2]
}

function inintMarkerClusterer(map) {
	// 随机创建1000个要素
	let markers = []
	for (let i = 1; i <= 200; i++) {
		let coordinates = [120.0 + Math.random(), 30.0 + Math.random()]

		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20]
			// content: buildContent()
		})
		markers.push(marker)

		marker.on('click', e => {
			console.log('Markers---click--------', e)
		})
	}

	for (let i = 1; i <= 200; i++) {
		let coordinates = [110.07 + Math.random(), 31.07 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)
	}

	for (let i = 1; i <= 200; i++) {
		let coordinates = [111.07 + Math.random(), 30.07 + Math.random()]
		let marker = new JC.Marker({
			position: coordinates,
			offset: [-30, -20],
			content: buildContent()
		})
		markers.push(marker)

		marker.on('click', e => {
			console.log('overlayerMarkers---click', e)
		})
	}

	// for (let i = 1; i <= 10000; i++) {
	// 	let coordinates = [101.07 + Math.random(), 31.07 + Math.random()]
	// 	let marker = new JC.Marker({
	// 		position: coordinates,
	// 		offset: [-30, -20],
	// 		content: buildContent()
	// 	})
	// 	markers.push(marker)
	// }

	const markerClusterer = new JC.MarkerCluster(map, markers)

	return markerClusterer
}

let marker3 = new JC.Marker({
	position: [112.76034654153298 * 1.02, 33.59101293004363 * 1.03],
	offset: [-30, -20],
	content: `<div style='font-size: 12px;
        line-height:1;
        background-color: #FFF;
        border: 1px solid blue;
        padding: 2px 3px;
    }'>overlayMarker22222222 </div>` //设置文本标注内容
})

let marker4 = new JC.Marker({
	position: [112.76034654153298 * 1.05, 33.59101293004363 * 1.05],
	offset: [-30, -20],
	content: `<div style='font-size: 12px;
        line-height:1;
        background-color: #FFF;
        border: 1px solid blue;
        padding: 2px 3px;
    }'>overlayMarker22222222 </div>` //设置文本标注内容
})

map.add(marker1, marker2, marker3, marker4)

marker3.on('click', () => {
	marker3.setTop()
	// console.log(marker3.getOverlayElement());
	console.log('marker3-------click')
})

map.add(marker2, marker3)
// markerClusterer.add(marker2, marker3)

markerClusterer.on('click', function (ev) {
	console.log('markerClusterer-------')
})

let graph = new JC.VectorGraph(map)
// graph.activate("Rectangle");
graph.on('done', e => {
	// graph.deactivate()
	console.log(e, '绘制完')
})
graph.on('modifyend', e => {
	console.log(e, '编辑完')
})
let point1 = graph.Point([116.47966187864304, 39.99695633729553], null, { name: '点' })
point1.on('click', e => {
	console.log(e.target.getExtData())
})
let line1 = graph.Line(
	[
		[116.47764753967286, 39.9971494563446],
		[116.48007762104035, 39.99650572618103]
	],
	null,
	{ name: '线' }
)
line1.on('click', e => {
	console.log(e.target.getExtData())
})
let circle1 = graph.Circle([116.47614550262452, 39.99763225396728], 81.75489888771256, null, { name: '圆' })
circle1.on('click', e => {
	console.log(e.target.getExtData())
})
let polygon1 = graph.Polygon(
	[
		[116.47699844509125, 39.9982652552948],
		[116.47721838623048, 39.997278202377316],
		[116.47869360118867, 39.99738549073791],
		[116.47857558399201, 39.9979058392868],
		[116.47837710052491, 39.99842618783569]
	],
	null,
	{ name: '多边形' }
)
polygon1.on('click', e => {
	console.log(e.target.getExtData())
})
let rectangle1 = graph.Rectangle([116.48053896099091, 39.99640916665649, 116.48225557476044, 39.99715482076263], null, { name: '矩形' })
rectangle1.on('click', e => {
	console.log(e.target.getExtData())
})

let Single = new JC.InfoWindow({
	// content: document.querySelector('#single'),
	// content: `<div>123</div>`,
	title: '标记点',
	content: '这是一个标记点喔',
	// offset: [-100, -146],
	offset: [0, 0],
	width: 200,
	height: 100
})
// map.addOverlays(Single)
let marker5 = new JC.Marker({
	position: [116.46873189838723, 39.99656413395958],
	// offset: [-10, -20],
	extData: { name: '大林' },
	content: buildContent()
})

let marker6 = new JC.Marker({
	position: [116.47023189838723, 39.99156413395958],
	// offset: [-10, -20],
	extData: { name: '大鹏' },
	content: buildContent()
})
map.add(marker5, marker6)

marker5.on('click', e => {
	Single.open(map, e.target)
	// let d = document.querySelector('.control')
	// Single.setContent(d)
	Single.setContent(e.target.getExtentData().name)
})

marker6.on('click', e => {
	Single.open(map, e.target)
	// Single.setContent(document.querySelector('#edit'))
	Single.setContent(e.target.getExtentData().name)
})
// Single.open(map, [116.357969621871, 39.87414636555371])

const clusterermarker1 = new JC.Marker({
	position: [116.47648317130837, 40.00343952433769],
	offset: [-30, -20],
	content: buildContent()
})
const clusterermarker2 = new JC.Marker({
	position: [116.47648317130837, 40.00343952433769],
	offset: [-30, -20],
	content: buildContent()
})

markerClusterer.add(clusterermarker1, clusterermarker2)

clusterermarker1.on('click', e => {
	clusterermarker1.setAnimation('JCMAP_ANIMATION_BOUNCE')
	setTimeout(function () {
		clusterermarker1.setAnimation('JCMAP_ANIMATION_NONE')
	}, 1000)
})

map.on('click', e => {
	console.log(e.coordinate)

	// const marker = new JC.Marker({
	// 	map,
	// 	position: e.coordinate,
	// 	content: buildContent()
	// })

	// marker.setAnimation('JCMAP_ANIMATION_BOUNCE')
	// window.animationMarkerTimer = setTimeout(function () {
	// 	marker.setAnimation('JCMAP_ANIMATION_NONE')
	// }, 1000)
})

let graphSelect = document.querySelector('#selected')
graphSelect.onchange = () => {
	if (graphSelect.value === '') {
		graph.deactivate()
	} else {
		graph.activate(graphSelect.value)
	}
}

let graphEdit = document.querySelector('#edit')
graphEdit.onclick = () => {
	graph.editPaint()
}

let rotateShape = document.querySelector('.rotate-box')

let costomControl = new JC.Control({
	element: rotateShape,
	target: document.querySelector('#map')
})
map.addControl(costomControl)

let contextMenu = new JC.ContextMenu()

let contextMenuPositon = []
map.on('contextmenu', e => {
	contextMenu.open(map, e.coordinate)
	contextMenuPositon = e.coordinate
})

contextMenu.addMenu({
	title: '添加标点',
	callBack: () => {
		const marker = new JC.Marker({
			map,
			position: contextMenuPositon,
			content: buildContent()
		})

		marker.setAnimation('JCMAP_ANIMATION_BOUNCE')
		window.animationMarkerTimer = setTimeout(function () {
			marker.setAnimation('JCMAP_ANIMATION_NONE')
		}, 1000)
	}
})

// contextMenu.removeMenu('放大一级')
