import { OlCluster, Marker, OlPoint, OverlayMarker, OlFeature } from './inherit'
import { Fill, Stroke, Style, Text, Icon } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { fromExtent } from 'ol/geom/Polygon'
import { transform, fromLonLat } from 'ol/proj'

import img0 from '../assets/image/map/m0.png'
import img1 from '../assets/image/map/m1.png'
import img2 from '../assets/image/map/m2.png'
import img3 from '../assets/image/map/m3.png'

// 默认 marker icon 样式
const defaulticonStyle = () => ({
	src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHrSURBVEjHrdW9a1NxFMbxT9qmNWmaRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIoggFCko4lJEEaq296aNtvk5JIG2NGmSOjzbuV9+9zzPOUcIwUbCvg7uYGtD9RsVdDCSJh7iT5ofONEyFLkeJvcw/5EQCE8JvRTSjKG9KSiOdvMtz0KxAqzqK+E4cZZ3GNgQikQXV7PET9bAVmqZMMbfNPM4UxOK/iwvB5mfqQNcqTeEHcQ93EVqFRRDaWZHKS41CKzqN2GYQoYv2BtCoJNrvRRe1PnwPeFGpZ+1am5TSrGQ5CJc2E1UqlH8nJCuKFN5WS3wIIUko5DIMjVOab3CEUIbASFLeFwD+Kgct09or/b0cI54rsWXRoQ+Yhxb5X4PDy9TbKWnlyj28mC9SO1MEX9u0v0P5b+YQ9+64e/i+iniZqBHiJLk603Ulm6+P2sQeI9Slmm01Z19DO8iWmog9LmyOYcaWihZ3t5kuR40z2KWiWa21P4eCj/rTFjFnG1N7dMME3kW1wJLhANE7ZxvZUlvTxFNr4GOl82ZQqKlc9LJlZNEVeBseVRjHGz5RiGZYWayAj3HQoZbmz58OD1A9JqQ4hdym4ZWIvaqn8UEZ//Lia5GrJP79cxZqX+cR1gC9S9TwAAAAABJRU5ErkJggg==' // 图标的url
})

// 默认 marker text 样式
const defaultLabelStyle = () => ({
	font: '12px sans-serif',
	text: '',
	placement: 'point', // 默认为point
	backgroundFill: null, // 文字背景填充
	backgroundStroke: null, // 文本背景进行设置描边样式
	offsetX: '', // 水平文本偏移量
	offsetY: '', // 垂直文本偏移量
	padding: [0, 0, 0, 0],
	fill: new Fill({
		// 文字颜色
		color: '#000'
	})
})

// marker Icon 样式处理
function setSingleIconStyle({ img = '', rotateWithView = true, rotation = 0 }) {
	const sIconStyle = {
		crossOrigin: 'anonymous', // 图片跨域允许
		anchor: [0.5, 0.5], // 原点位置
		anchorOrigin: 'top-left', // 原点位置偏移方向
		anchorXUnits: 'fraction', // 基于原点位置百分比
		anchorYUnits: 'fraction', // 基于原点位置像素
		offset: [0, 0], // 偏移量设置，相对于原点
		scale: 1, // 图标缩放比例
		opacity: 1, // 透明度
		src: img,
		img: undefined, // 图标的url
		rotateWithView, // 是否旋转
		rotation // 旋转角度
	}
	!img && delete sIconStyle.src
	return sIconStyle
}
// marker Text样式处理
function setSingleTextStyle({
	label = '',
	labelYOffset = 0,
	labelXOffset = 0,
	fontColor = '#000',
	fontSize = '12px',
	fontFamily = 'sans-serif',
	fontWeight = 'normal',
	font = '',
	labelBgColor = '#fff',
	borderColor = '#000',
	borderWidth = '1',
	textBaseline = 'bottom',
	textAlign = 'centrer'
}) {
	return {
		text: label,
		offsetX: labelXOffset,
		offsetY: labelYOffset,
		fill: new Fill({
			// 字体颜色
			color: fontColor
		}),
		font: font || `${fontWeight} ${fontSize} ${fontFamily}`, // 字体样式
		backgroundFill: new Fill({
			// 背景颜色
			color: labelBgColor
		}),
		backgroundStroke: new Stroke({
			// 边框样式
			color: borderColor,
			width: borderWidth,
			lineCap: 'square', // 线帽风格  butt, round, 或者 square 默认 round
			lineJoin: 'bevel', // 线连接方式 bevel, round, 或者 miter 默认 round
			lineDash: [], // 线间隔模式 这个变化与分辨率有关 默认为undefined Internet Explorer 10和更低版本不支持
			lineDashOffset: 0, // 线段间隔偏移 默认0
			miterLimit: 10 // 默认10
		}),
		padding: [5, 5, 5, 5]
		// textBaseline // 似乎无效
		// textAlign //文本对齐方式,似乎无效，设置会让文本消失
	}
}

/**
 * 创建 Marker 样式
 * @param {*} style
 * @param {*} zIndex 2
 * @returns
 */

function createMarkerStyle(style = {}, zIndex = 2) {
	let textStyle = defaultLabelStyle()
	let iconStyle = defaulticonStyle()

	const {
		img = '',
		rotateWithView = true,
		rotation = 0,
		label = '',
		labelYOffset = -30,
		labelXOffset = 0,
		fontColor = '#000',
		fontSize = '12px',
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		font = '',
		labelBgColor = '#fff',
		borderColor = '#000',
		borderWidth = '1',
		textBaseline = 'bottom',
		textAlign = 'centrer'
	} = style

	const sIconStyle = { img, rotateWithView, rotation }

	const sTextStyle = {
		label,
		labelYOffset,
		labelXOffset,
		fontColor,
		fontSize,
		fontFamily,
		fontWeight,
		font,
		labelBgColor,
		borderColor,
		borderWidth,
		textBaseline,
		textAlign
	}
	iconStyle = Object.assign({}, iconStyle, setSingleIconStyle(sIconStyle))
	textStyle = Object.assign({}, textStyle, setSingleTextStyle(sTextStyle))
	// console.log(iconStyle)
	// console.log(textStyle)
	return new Style({
		image: new Icon(iconStyle),
		text: new Text(textStyle),
		zIndex
	})
}

// 设置聚合要素样式
function createClusterStyle(styleCache, feature, resolution) {
	const size = feature.get('features').length // 获取该要素所在聚合群的要素数量
	let style = styleCache[size]

	if (!style) {
		const zIndex = 2 // 设置层级

		const labelStyle = defaultLabelStyle()
		const iconStyle = defaulticonStyle()
		labelStyle.text = size.toString()

		if (size == 1) {
			return null
		} else if (size < 11) {
			iconStyle.src = img0
		} else if (size < 101) {
			iconStyle.src = img1
		} else if (size < 1001) {
			iconStyle.src = img2
		} else {
			iconStyle.src = img3
		}

		style = [
			new Style({
				image: new Icon(iconStyle),
				text: new Text(labelStyle),
				zIndex: 1 // 设置层级
			})
		]
		styleCache[size] = style
	}
	return style
}

// Cluster change 单个 maker 添加
const addOverlaysAction = (map, clusterSource, features, showViewExtent) => {
	//获取可视区域范围
	const extent = map.getView().calculateExtent(map.getSize())
	//获取可视区域范围的几何对象
	const viewGeometry = fromExtent(extent)
	// console.log(viewGeometry.getBottomLeft())
	features.forEach(feature => {
		if (!feature.get('features')) {
			//不存在 features 即为 单个 feature 应该 添加overlayMarker
			const overlayMarker = feature.get('overlayMarker')
			if (overlayMarker) {
				// 获取 overlayMarker id
				const id = overlayMarker.getId()
				// 获取 overlayMarker 经纬度
				const coordinate = overlayMarker.getPosition()
				// 判断是否在可视区域内
				const inViewGeometry = viewGeometry.intersectsCoordinate(coordinate)
				// 判断是否已经添加
				const inOverlaysList = clusterSource.overlaysList.includes(id)

				if (!inOverlaysList) {
					// 未被添加的 overlayMarker
					if (inViewGeometry && showViewExtent) {
						//只添加在可视区域
						clusterSource.overlaysList.push(id)
						map.addOverlay(overlayMarker)
					}
					if (!showViewExtent) {
						// 可视区域外的也添加
						clusterSource.overlaysList.push(id)
						map.addOverlay(overlayMarker)
					}
				}
			}
		}
	}, 100)
}

//创建要素聚合数据来源
function createClusterSource(map, vectorSource, options) {
	const { distance = 40, minDistance = 30, showViewExtent = true } = options || {}

	// 创建要素聚合数据来源
	const clusterSource = new OlCluster({
		distance: parseInt(distance, 10), // 要素将聚集在一起的距离（以像素为单位）
		minDistance: parseInt(minDistance, 10), //  簇之间的最小距离（以像素为单位）
		source: vectorSource,
		createCluster(point, features) {
			if (features.length == 1) {
				// 创建聚合对象时候，只有一个聚合物情况
				if (features[0].JCTYPE === 'Marker') {
					console.log(point, features)
					return new OlFeature({
						geometry: point,
						features
					})
				}
				const overlayMarker = features[0].get('overlayMarker')
				return new OlFeature({
					overlayMarker
				})
			} else {
				const cluster = new OlFeature({
					geometry: point,
					features
				})
				return cluster
			}
		}
	})

	// 拖动变化-主动触发 clusterSource  change
	map.on('moveend', e => clusterSource.changed(e))

	/**
	 * 监听聚合物体变化 ，用于清除聚合状态下 自定义overlays数量
	 * 	addFeatures/removeFeature 也会触发
	 */

	// clusterSource.on('change', function (e) {
	// 	const features = e.target.getFeatures()
	// 	// 添加前先清除所有 overlayMarker
	// 	clusterSource.overlaysList.forEach(item => {
	// 		const overlayMarker = map.getOverlayById(item)
	// 		map.removeMarker(overlayMarker)
	// 	})

	// 	clusterSource.overlaysList = []

	// 	if (features.length > 0) {
	// 		// 添加每个聚合物相应的 OverlayMarker
	// 		addOverlaysAction(map, clusterSource, features, showViewExtent)
	// 	}
	// })

	return clusterSource
}

/**
 * 创建聚合物覆盖群
 * @param {object} map
 * @param {object} options distance = 40, minDistance = 30
 * @param {object} features
 * @returns
 */
function createMarkerClusterer(map, markers, options) {
	const styleCache = {}

	const features = markers.map(marker => {
		let olMarker = marker[marker.JCTYPE]
		return olMarker
	})

	// 创建要素数据来源
	const vectorSource = new VectorSource({
		features
	})

	// const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
	// 创建要素聚合数据来源
	const clusterSource = createClusterSource(map, vectorSource, options)

	// 创建一个图层
	const clusterLayer = new VectorLayer({
		className: 'ol-layer jc-clusterer-layer',
		source: clusterSource,
		style: (feature, resolution) => createClusterStyle(styleCache, feature, resolution)
	})

	// 默认添加图层
	map.addLayer(clusterLayer) // 初始默认数据添加图层

	return clusterLayer
}

function JCMarkerClusterer(map, features = [], options) {
	const clusterLayer = createMarkerClusterer(map, features, options)

	map.markerCluster = this

	this.map = map

	this.clusterLayer = clusterLayer // 聚合图层

	this.getView = () => map.getView() // 获取地图的初始化 View 信息

	this.getVectorSource = () => this.clusterLayer.getSource().getSource() //  Marker集合数据对象

	this.getClusterSource = () => this.clusterLayer.getSource() //  聚合物集合数据对象

	this.getDistance = () => this.getClusterSource().getDistance() // 聚合的距离

	this.setDistance = distance => this.clusterLayer.getSource().setDistance(distance)

	this.getMinDistance = () => this.clusterLayer.getSource().getMinDistance() // 聚合物的最小间距

	this.setMinDistance = minDistance => this.clusterLayer.getSource().setMinDistance(minDistance)

	// 获取聚合类的所有基础Marker集合
	this.getMarkers = () => {
		return this.getVectorSource().getFeatures()
	}

	// 将Marker集合添加到聚合
	this.setMarkers = features => {
		const distance = this.getDistance()
		const minDistance = this.getMinDistance()
		if (Array.isArray(features) && features.length > 0) {
			this.clusterLayer && map.removeLayer(this.clusterLayer)
			this.clusterLayer = createMarkerClusterer(map, features, { distance, minDistance })
			return this.clusterLayer
		}
	}

	// 添加Marker
	this.addMarker = (...args) => {
		if (args.length === 1) {
			if (Array.isArray(args[0])) {
				const markers = args[0].filter(marker => marker.JCTYPE === 'OVERLAYMARKER')
				this.getVectorSource().addFeatures(markers.map(m => m.OVERLAYMARKER))
			} else {
				args[0].JCTYPE === 'OVERLAYMARKER' && this.getVectorSource().addFeature(args[0].OVERLAYMARKER)
			}
		} else {
			const markers = args.filter(marker => marker instanceof Marker)
			this.getVectorSource().addFeatures(markers)
		}
	}

	// 从地图上 删除 overlayMarker
	this.removeOverlayMarker = marker => {
		map.removeMarker(marker)
	}

	// 删除Marker
	this.removeMarker = (...args) => {
		if (args.length === 1) {
			// 单参数或者数组
			if (Array.isArray(args[0])) {
				args[0].forEach(marker => this.removeMarker(marker))
			} else if (args[0].JCTYPE === 'OVERLAYMARKER') {
				// removeFeature 时候 触发 change 事件，并且会 remove overlayMarker
				this.getVectorSource().removeFeature(args[0].OVERLAYMARKER)
			}
		} else {
			// 多个参数
			args.forEach(marker => this.removeMarker(marker))
		}
	}

	// 清空 Markers
	this.clearMarkers = () => {
		// 遍历清空已经渲染OverlayMarkers
		this.getClusterSource().overlaysList.forEach(item => {
			const overreMarker = map.getOverlayById(item)
			map.removeMarker(overreMarker)
		})
		this.getClusterSource().overlaysList = [] // 清空overlayMarkers 数据
		this.getVectorSource().clear() // 清空 Marker集合数据对象
	}
}

export default JCMarkerClusterer
