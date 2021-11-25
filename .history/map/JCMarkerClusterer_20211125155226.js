import { OlCluster, Marker, OlPoint, OverlayMarker, OlFeature } from './inherit'
import VectorSource from 'ol/source/Vector'
import { fromExtent } from 'ol/geom/Polygon'

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

/**
 * 创建聚合物覆盖群
 * @param {object} map
 * @param {object} options distance = 40, minDistance = 30
 * @param {object} features
 * @returns
 */
function createMarkerClusterer(map, options, features) {
	const { distance = 40, minDistance = 30 } = options || {}
	const styleCache = {}

	// 创建要素数据来源
	const vectorSource = new VectorSource({
		features
	})

	console.log(vectorSource)
	// 给 marker 设置样式，为 overlayMarker 处理做存储
	vectorSource.forEachFeature(feature => {
		if (!feature.getContent()) {
			feature.setStyle(createMarkerStyle(feature.getStyle()))
		}
	})

	console.log(vectorSource, vectorSource.getKeys())

	// 创建要素聚合数据来源
	OlCluster.prototype.overlaysList = []
	const clusterSource = new OlCluster({
		distance: parseInt(distance, 10), // 要素将聚集在一起的距离（以像素为单位）
		minDistance: parseInt(minDistance, 10), //  簇之间的最小距离（以像素为单位）
		source: vectorSource,
		createCluster(point, features) {
			if (features.length == 1) {
				const cluster = new OlFeature({
					// geometry: point,
					// features: features,
					overlayMarker: features[0].get('overlayMarker')
				})

				return cluster
			} else {
				const cluster = new OlFeature({
					geometry: point,
					features: features
				})
				return cluster
			}
		}
	})

	const addOverlaysAction = (map, clusterSource, features) => {
		const extent = map.getView().calculateExtent(map.getSize())
		const viewGeometry = fromExtent(extent)
		// console.log(extent)
		// console.log(viewGeometry.getBottomLeft())

		features.forEach(feature => {
			if (!feature.get('features')) {
				const marker = feature.get('overlayMarker')
				if (marker) {
					const id = marker.getId()
					const coordinate = marker.getPosition()
					const inViewGeometry = viewGeometry.intersectsCoordinate(coordinate) // 是否在可视区域内
					if (!clusterSource.overlaysList.includes(id) && inViewGeometry) {
						clusterSource.overlaysList.push(id)
						map.addOverlay(marker)
					}
				}
			}
		}, 100)
	}
	/**
	 * 监听聚合层级变化 ，用于清除聚合状态下 自定义overlays数量
	 */

	// clusterSource.on('change', function (e) {
	// 	const features = e.target.getFeatures()
	// 	// 添加先清除所有overlayMarker
	// 	clusterSource.overlaysList.forEach(item => {
	// 		const over = map.getOverlayById(item)
	// 		map.removeOverlays(over)
	// 	})
	// 	clusterSource.overlaysList = []
	// 	clusterSource.dispatchEvent('clusterSource:change')
	// 	if (features.length > 0) {
	// 		// const removeFeatures = []
	// 		// 添加每个聚合物相应的 OverlayMarker
	// 		addOverlaysAction(map, clusterSource, features)
	// 	}
	// })

	// 拖动变化-主动触发 clusterSource  change
	// map.on('moveend', function (e) {
	// 	// console.log('moveend------------')
	// 	clusterSource.changed()
	// })

	// 创建一个图层
	const clusterLayer = new VectorLayer({
		source: clusterSource,
		style: (feature, resolution) => createFeatureStyleFn(styleCache, feature, resolution)
	})
	return clusterLayer
}

function JCMarkerClusterer(map, features = [], options) {
	const clusterLayer = createMarkerClusterer(map, options, features)

	if (features.length > 0) {
		map.addLayer(clusterLayer, '_MarkerClusterer', this) // 初始默认数据添加图层
	}

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
			this.clusterLayer = createMarkerClusterer(map, { distance, minDistance }, features)
			map.addLayer(this.clusterLayer)
			return this.clusterLayer
		}
	}
	// 添加Marker
	this.addMarker = (...args) => {
		if (args.length === 1) {
			if (Array.isArray(args[0])) {
				const markers = args[0].filter(marker => marker instanceof Marker)
				this.getVectorSource().addFeatures(markers)
			} else {
				args[0] instanceof Marker && this.getVectorSource().addFeature(args[0])
			}
		} else {
			const markers = args.filter(marker => marker instanceof Marker)
			this.getVectorSource().addFeatures(markers)
		}
	}

	// 删除 overlayMarker
	this.removeOverlayMarker = marker => {
		const overlayMarker = marker instanceof Overlay ? marker : marker.get('overlayMarker')
		if (overlayMarker) {
			map.removeOverlays(overlayMarker)
		}
	}

	// 删除Marker
	this.removeMarker = (...args) => {
		if (args.length === 1) {
			// 单参数或者数组
			if (Array.isArray(args[0])) {
				args[0].forEach(marker => {
					this.removeOverlayMarker(marker) // 删除Overlay Marker
					marker instanceof Marker && this.getVectorSource().removeFeature(marker) // 删除Feature Marker
				})
			} else {
				this.removeOverlayMarker(args[0])
				args[0] instanceof Marker && this.getVectorSource().removeFeature(args[0])
			}
		} else {
			// 多个参数
			args.forEach(marker => {
				this.removeMarker(marker)
			})
		}
	}

	// 清空 Markers
	this.clearMarkers = () => {
		// 遍历清空已经渲染OverlayMarkers
		this.getClusterSource().overlaysList.forEach(item => {
			const over = map.getOverlayById(item)
			map.removeOverlays(over)
		})
		this.getClusterSource().overlaysList = [] // 清空overlayMarkers 数据
		this.getVectorSource().clear() // 清空 Marker集合数据对象
	}
}

export default JCMarkerClusterer
