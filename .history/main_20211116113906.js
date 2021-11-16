import './style.css'
import JC from './JCMap'

// 实例
const map = new JC.Map('map', {
	center: [91.132212, 29.660361],
	zoom: 6,
	minZoom: 3,
	maxZoom: 23
})

// 添加缩放控件
map.addControl(new JC.ZoomSlider())

let marker = new JC.Marker({ position: [91.132212, 29.660361] })

map.addMarker(marker)
