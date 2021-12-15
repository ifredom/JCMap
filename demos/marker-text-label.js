import JC from '../map/index.js'
import onlineImg from '../assets/style/map_online.png'

const map = new JC.Map('map', {
	center: [116.48538303047181, 39.99969219049072],
	zoom: 6,
	minZoom: 3,
	maxZoom: 18
})

map.on('click', e => {
	console.log(e.coordinate)
})

let isShowAllLpn = true

// 矢量图标
const marker = new JC.Marker({
	map: map,
	fontSize: '12px',
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	fontColor: '#000',
	placement: 'point', // 默认为point
	labelBgColor: '#FFF', // 背景颜色
	borderColor: '#000', // 边框颜色
	borderWidth: '1', // 边框宽度
	textBaseline: 'bottom', // t  似乎无效
	textAlign: 'centrer', //文本对齐方式 ,似乎无效，设置会让文本消失
	labelXOffset: 0, // 水平文本偏移量
	labelYOffset: -30, // 垂直文本偏移量
	padding: [5, 5, 5, 5],
	// 上面为默认配置
	position: [116.478935, 39.997761],
	icon: 'https://webapi.amap.com/images/car.png',
	label: '矢量图标的label信息',
	labelYOffset: -40,
	padding: [5, 5, 5, 5],
	labelBgColor: 'skyblue', // 背景颜色
	angle: -90
})

// content 会覆盖 icon
const marker1 = new JC.Marker({
	map: map,
	position: [111.75027560859681, 40.81268047174071],
	icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
	content: `<img src="${onlineImg}" alt="" style="vertical-align:middle;">`
	// offset: [-40, -40]
})

const marker2 = new JC.Marker({
	map: map,
	position: [116.12283420234681, 43.93279765924071],
	icon: 'https://webapi.amap.com/images/car.png',
	offset: [-26, -13],
	angle: 180,
	label: {
		content: `<div class='info'>我是 marker 的 label 标签 2</div>`,
		offset: [-132, -50]
	}
})

const marker3 = new JC.Marker({
	map: map,
	position: [122.14334201484681, 43.51531719049071],
	content: `<img src="${onlineImg}" alt="" style="vertical-align:middle;">`,
	offset: [-26, -34],
	label: {
		content: `<div class='info'>我是 marker 的 label 标签 3</div>`,
		offset: [-132, -68]
	}
})

const vehicleDom = document.getElementById('vehicle')

vehicleDom.onchange = function (e) {
	console.log('111', e.target.checked)
	isShowAllLpn = e.target.checked
	marker1.setContent(buildMarkerContent())
}

function buildMarkerContent() {
	let item = {
		lpn: '川A123456789',
		colName: '黄色',
		id: '113123'
	}
	let lpnAndCol = ''
	if (isShowAllLpn) {
		lpnAndCol = item.lpn + '(' + item.colName + ')'
	} else {
		lpnAndCol = ''
	}

	let content =
		'<div class="self-marker-box">' +
		'  <div class="marker-title">' +
		'    <span class="lpn">' +
		lpnAndCol +
		'</span>' +
		'  </div>' +
		'  <img id="marker_img_' +
		item.id +
		'" class="marker-img" src="' +
		onlineImg +
		'" alt="">' +
		'</div>'
	return content
}
