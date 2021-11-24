import 'ol/ol.css'
import { Map as OlMap, View, Feature } from 'ol'
import Overlay from 'ol/Overlay'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style, Text, Icon, RegularShape } from 'ol/style'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import Polygon, { fromExtent } from 'ol/geom/Polygon' //
import Circle from 'ol/geom/Circle' // 圆形
import Point from 'ol/geom/Point'
import { MultiPoint } from 'ol/geom'
import Cluster from 'ol/source/Cluster'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import { ZoomSlider, defaults as defaultControls } from 'ol/control'
import { boundingExtent, getCenter, getHeight, getWidth } from 'ol/extent'
import { defaults as DefaultInteraction, Translate } from 'ol/interaction'
import { transform, fromLonLat } from 'ol/proj'
import { getDistance } from 'ol/sphere'
import GeoJSON from 'ol/format/GeoJSON'
import Modify from 'ol/interaction/Modify'
import Snap from 'ol/interaction/Snap'
import Select from 'ol/interaction/Select'

import { never, platformModifierKeyOnly, primaryAction } from 'ol/events/condition'

import img0 from './assets/image/map/m0.png'
import img1 from './assets/image/map/m1.png'
import img2 from './assets/image/map/m2.png'
import img3 from './assets/image/map/m3.png'

function initJCMap() {
	// 底图链接
	const standardTileLayerUrl = 'https://www.qqearth.com/engine?st=GetImage&box={x},{y}&lev={z}&type=vect&uid=xzjc'
	const satelliteTileLayerUrl = 'https://www.qqearth.com/engine?st=GetImage&box={x},{y}&lev={z}&type=sate&uid=xzjc'

	const defaulticonStyle = () => ({
		src: '' // 图标的url
	})

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

	function inheritPrototype(SubClass, SuperClass) {
		const p = Object.create(SuperClass.prototype)
		p.constructor = SubClass
		// 设置子类原型
		SubClass.prototype = p
	}
	/**
	 * 比较数组是否相同
	 * @param {*} a1
	 * @param {*} a2
	 * @returns
	 */
	function compareArray(a1, a2) {
		if (a1 === a2) return true
		if ((!a1 && a2) || (a1 && !a2)) return false
		if (a1.length !== a2.length) return false
		for (let i = 0, n = a1.length; i < n; i++) {
			if (a1[i] !== a2[i]) return false
		}
		return true
	}
	function createOverlayMarkerElement(content, id) {
		const container = document.createElement('div')
		container.innerHTML = content
		container.setAttribute('z-index', 9)
		container.setAttribute('id', `JC-${id}`)
		return container
	}

	function createOverlayMarker(features) {
		const id = features.getExtentData().id || features.getId()
		const content = features.getContent()
		const position = features.getPosition()
		const offset = features.getOffset()
		const element = createOverlayMarkerElement(content, id)

		return new Overlay({
			id,
			position,
			offset,
			element // 绑定 Overlay 对象和 DOM 对象的
			// autoPan: true
			// autoPanAnimation: {
			//   duration: 250
			// }
			// stopEvent: false
		})
	}
	function setSingleIconStyle({ img = '', rotateWithView = true, rotation = 0 }) {
		return {
			crossOrigin: 'anonymous', // 图片跨域允许
			anchor: [0.5, 0.5], // 原点位置
			anchorOrigin: 'top-left', // 原点位置偏移方向
			anchorXUnits: 'fraction', // 基于原点位置百分比
			anchorYUnits: 'fraction', // 基于原点位置像素
			offset: [0, 0], // 偏移量设置，相对于原点
			scale: 1, // 图标缩放比例
			opacity: 1, // 透明度
			src: img, // 图标的url
			rotateWithView, // 是否旋转
			rotation // 旋转角度
		}
	}
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

	function createMarkerStyleFn(style, zIndex = 2) {
		let labelStyle = defaultLabelStyle()
		let iconStyle = defaulticonStyle()
		iconStyle = Object.assign({}, iconStyle, setSingleIconStyle(style))
		labelStyle = Object.assign({}, labelStyle, setSingleTextStyle(style))
		// console.log(iconStyle)
		// console.log(labelStyle)
		return new Style({
			image: new Icon(iconStyle),
			text: new Text(labelStyle),
			zIndex
		})
	}

	// 设置聚合要素样式
	function createFeatureStyleFn(styleCache, feature, resolution) {
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

	function TemporaryMap(target = 'map', options) {
		const { center = [0, 0], zoom = 6, minZoom = 0, maxZoom = 18, doubleClickZoom = false, zoomShow = true } = options

		// 标准底图图层
		const standardTileLayer = new TileLayer({
			zIndex: 0, // 底图图层层级
			className: 'ol-layer standard',
			visible: true,
			source: new XYZ({
				url: standardTileLayerUrl
			})
		})

		const satelliteTileLayer = new TileLayer({
			zIndex: 0, // 底图图层层级
			visible: false,
			className: 'ol-layer satellite',
			source: new XYZ({
				url: satelliteTileLayerUrl
			})
		})
		const zooms = zoomShow
		// 地图初始化
		const maxExtent = boundingExtent([
			[55.923433618652325, 3.359091468750009],
			[171.31664592155698, 81.65358702968221]
		])
		return new OlMap({
			target,
			layers: [satelliteTileLayer, standardTileLayer], // 图层
			overlays: [], // 覆盖物
			view: new View({
				projection: 'EPSG:4326',
				center, // 中心点
				zoom, // 层级
				minZoom, // 最小缩放
				maxZoom, // 最大缩放
				multiWorld: false,
				constrainResolution: true,
				extent: maxExtent
			}),
			interactions: new DefaultInteraction({
				doubleClickZoom // 屏蔽默认双击放大事件
			}),
			controls: defaultControls({ zoom: zooms }).extend([])
		})
	}

	// 地图类
	function _JCMap(...args) {
		const map = TemporaryMap.call(this, ...args) // 继承this属性

		// 因为层级组件是修改过的，用户没有主动添加该组件，默认是移除的
		map.removeControl(new JC.ZoomSlider())

		this.map = map

		this.markerClusterer = null // 聚合图层对象

		this.view = map.getView() // 获取地图的初始化 View 信息

		this.center = () => this.view.getCenter() // 获取地图的中心位置

		this.getMaxZoom = () => this.view.getMaxZoom() // 获取地图设置的最大放大

		this.getMinZoom = () => this.view.getMinZoom() // 获取地图设置的最小缩放

		this.getOverlayById = map.getOverlayById.bind(map) // 根据ID获取覆盖物

		this.getLayers = map.getLayers.bind(map) // 获取所有图层

		this.getView = map.getView.bind(map) // 获取 View对象

		this.getSize = map.getSize.bind(map) // 获取 视口大小 size

		this.updateSize = map.updateSize.bind(map) // 强制更新视口大小

		this.getFeaturesAtPixel = map.getFeaturesAtPixel.bind(map) // 从 坐标 获取 Features集合

		this.hasFeatureAtPixel = map.hasFeatureAtPixel.bind(map) // 判断是否点击了 Feature

		this.forEachFeatureAtPixel = map.forEachFeatureAtPixel.bind(map) // 从Features 里面遍历 点Pixel

		this.addControl = map.addControl.bind(map) // 添加控件

		this.removeLayer = map.removeLayer.bind(map) // 移除图层

		this.addOverlay = map.addOverlay.bind(map) // 添加overlay 衍生自map类，此处为内置函数，不暴露给外部

		this.getCoordinateFromPixel = map.getCoordinateFromPixel.bind(map) // 获取当前点击坐标点
		// this.getOverlays = map.getInteractions.bind(map) // 获取地图覆盖物

		// 事件监听
		this.on = (eventName, callBack) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (eventName === 'complete') {
				eventName = 'rendercomplete'
				map.once(eventName, e => callBack && callBack(e))
			} else {
				map.on(eventName, e => callBack && callBack(e))
			}
		}

		// 添加图层
		this.addLayer = (layer, type, newLayer) => {
			if (type === '_MarkerClusterer') {
				this.markerClusterer = newLayer
			}
			map.addLayer(layer)
		} // 添加图层

		this.getMarkerClusterer = () => {
			return this.markerClusterer
		}

		/**
		 * 添加单个或多个覆盖物
		 * @param {*} markers
		 */
		this.addOverlays = markers => {
			const flag = Object.prototype.toString.call(markers)
			const commonStyle = option => {
				const singleStyle = option.getStyle()
				return new Style({
					image: new Icon({
						src: singleStyle.img
					}),
					text: new Text({
						text: singleStyle.label,
						offsetY: singleStyle.labelYOffset,
						offsetX: singleStyle.labelXOffset,
						padding: singleStyle.padding,
						backgroundFill: new Fill({
							color: singleStyle.labelBgColor
						}),
						font: singleStyle.font
					}),
					zIndex: 2
				})
			}
			this.markerLayer = new VectorLayer({
				source: new VectorSource()
			})
			// 添加图层
			this.map.addLayer(this.markerLayer)
			// 添加多个覆盖物
			if (flag === '[object Array]') {
				// console.log(markers);
				markers.forEach(item => {
					const style = commonStyle(item)
					item.setStyle(style)
				})
				this.markerLayer.getSource().addFeatures(markers)
			} else {
				// 添加单个覆盖物
				const style = commonStyle(markers)
				markers.setStyle(style)
				this.markerLayer.getSource().addFeature(markers)
			}
		}

		// map 添加 Marker
		this.addMarker = (...args) => {
			if (args.length === 1) {
				if (Array.isArray(args[0])) {
					args[0].forEach(marker => this.addMarker(marker))
				} else if (args[0] instanceof Marker) {
					const overlayMarker = args[0].get('overlayMarker')
					if (overlayMarker) {
						this.addOverlay(overlayMarker)
					}
				}
			} else {
				args.forEach(marker => this.addMarker(marker))
			}
		}

		// map 删除 Marker
		this.removeMarker = (...args) => {
			if (args.length === 1) {
				// 单参数或者数组
				if (Array.isArray(args[0])) {
					args[0].forEach(marker => this.removeMarker(marker))
				} else if (args[0] instanceof Marker) {
					const overlayMarker = args[0].get('overlayMarker')
					if (overlayMarker) {
						map.removeOverlay(overlayMarker)
					}
				}
			} else {
				// 多个参数
				args.forEach(marker => {
					this.removeMarker(marker)
				})
			}
		}

		/**
		 * 移除对应的覆盖物
		 * @param {*} marker
		 */

		this.removeOverlays = marker => {
			marker instanceof Overlay && map.removeOverlay(marker)
			if (marker instanceof Marker) {
				// 兼容暂时无效
				map.removeOverlay(marker.get('overlayMarker'))
				map.getMarkerClusterer() && map.getMarkerClusterer().removeMarker(marker)
			}
		}
		/**
		 * 清除地图上所有覆盖物
		 */
		this.clearOverlays = () => {
			const overlays = this.map.getOverlays()
			overlays.forEach(item => this.removeOverlay(item))
		}

		// 卫星地图图层
		this.getSatelliteLayer = () => {
			return this.getLayers()
				.getArray()
				.find(layer => layer.getClassName().indexOf('satellite') !== -1)
		}
		// 标准地图图层
		this.getStandardLayer = () => {
			return this.getLayers()
				.getArray()
				.find(layer => layer.getClassName().indexOf('standard') !== -1)
		}

		// 切换地图类型
		this.setBaseLayer = layerName => {
			if (layerName === 'satellite') {
				this.getStandardLayer().setVisible(false)
				this.getSatelliteLayer().setVisible(true)
			} else if (layerName === 'standard') {
				this.getSatelliteLayer().setVisible(false)
				this.getStandardLayer().setVisible(true)
			} else {
				this.getSatelliteLayer().setVisible(false)
				!this.getStandardLayer().getVisible() && this.getStandardLayer().setVisible(true)
			}
		}

		// 获取当前层级
		this.getZoom = function () {
			return this.view.getZoom()
		}

		// 设置当前层级
		this.setZoom = function (zoom) {
			// console.log(this.getZoom(), maxZoom, minZoom)
			this.view.animate({ zoom, duration: 500 })
		}

		// 设置地图中心
		this.setCenter = function (coord, zoom = 0) {
			const viewCenter = coord || (this.center() ? this.center() : [0, 0])
			zoom = zoom || this.getZoom()
			this.view.setCenter(viewCenter)
			this.setZoom(zoom)
		}

		// 定位到目标位置
		this.panTo = function (coord) {
			this.view.animate({
				// 只设置需要的属性即可
				center: coord, // 中心点
				// zoom: this.getZoom(), // 缩放级别
				duration: 400 // 缩放持续时间，默认不需要设置
			})
			// let flag = this.map.getLayers()
			// 	.getArray().map(layer => layer.getClassName())
			// this.map.setView()
			// console.log(flag, 'flag');
		}

		/* 聚合物放大展开，视野适应地图
		 *@param{object}  target  地图对象
		 *@param{Array}  	options  组成聚合物的 feature 集合
		 *@return {object} target
		 *@存在问题，会使zoom出现小数
		 */
		this.setClusterExtentView = function (target, options) {
			options = {
				maxZoom: 18,
				duration: 300,
				padding: [100, 100, 100, 100] // 点要素距离视野边距
			}
			// 所有要素坐标集合
			if (!target || target.constructor !== Feature) return
			// console.log(target)
			const isMarker = target.constructor === Marker
			const features = isMarker ? target : target.get('features')
			const coordinates = features.length > 1 ? features.map(r => r.getGeometry().getCoordinates()) : features.getGeometry().getCoordinates()
			// 放大地图，让要素刚好出现在视野

			!isMarker && this.view.fit(boundingExtent(coordinates), options)
			return target
		}

		/**
		 * 让地图自动适应覆盖
		 * 获取覆盖物群里的 总的最小经纬度和最大经纬度，以此来生成矩形框，然后视图调用fit()方法来适应层级
		 * @param {*} overlay
		 */
		this.setFitView = () => {
			// 矢量图形所使用图层，聚合图层后续再做添加
			const vectorGraph = this.map
				.getLayers()
				.getArray()
				.find(layer => layer.getClassName().indexOf('VectorLayer') !== -1)
			if (vectorGraph && vectorGraph.getSource().getFeatures().length) {
				const rectangleBox = { minLng: Infinity, minLat: Infinity, maxLng: -Infinity, maxLat: -Infinity }
				vectorGraph
					.getSource()
					.getFeatures()
					.forEach(item => {
						// 矢量图形是 圆形
						// if (item.getGeometry().getType() === 'Circle') {
						//   getExtent 获取左上角 和 右上角坐标方法 分别代表最小经纬和最大经纬
						if (rectangleBox.minLng > item.getGeometry().getExtent()[0]) {
							rectangleBox.minLng = item.getGeometry().getExtent()[0]
						}
						if (rectangleBox.minLat > item.getGeometry().getExtent()[1]) {
							rectangleBox.minLat = item.getGeometry().getExtent()[1]
						}
						if (rectangleBox.maxLng < item.getGeometry().getExtent()[2]) {
							rectangleBox.maxLng = item.getGeometry().getExtent()[2]
						}
						if (rectangleBox.maxLat < item.getGeometry().getExtent()[3]) {
							rectangleBox.maxLat = item.getGeometry().getExtent()[3]
						}
						// }
					})

				const p1 = rectangleBox.minLng
				const p2 = rectangleBox.minLat
				const p3 = rectangleBox.maxLng
				const p4 = rectangleBox.maxLat
				const polygon = new Polygon([
					[
						[p1, p2],
						[p3, p2],
						[p3, p4],
						[p1, p4],
						[p1, p2]
					]
				])
				this.map.getView().fit(polygon, { padding: [5, 5, 5, 5] })
			}
		}
		/**
		 * 移除 图形（矢量图层里，显示图形状态下）
		 * @param {*} feature
		 */
		this.removePaint = feature => {
			const vectorGraph = this.map
				.getLayers()
				.getArray()
				.find(layer => layer.getClassName().indexOf('VectorLayer') !== -1)
			if (vectorGraph) {
				if (Object.prototype.toString.call(feature) === '[object Number]' || Object.prototype.toString.call(feature) === '[object String]') {
					const featureTmp = vectorGraph
						.getSource()
						.getFeatures()
						.find(item => item.getGeometry().get('extData').id == feature)

					if (featureTmp) {
						vectorGraph.getSource().removeFeature(featureTmp)
					} else {
						console.warn('JCMap库 图形类警告: 请确认传入正确的id')
					}
				} else {
					vectorGraph.getSource().removeFeature(feature)
				}
			}
		}
		// 地图缩小
		this.setZoomOut = function (zoomNum = 1) {
			// 获取地图当前缩放等级
			const zoom = this.getZoom()
			// 每单击一次地图的缩放等级减一，以实现地图缩小
			this.setZoom(zoom - zoomNum)
		}

		// 地图放大
		this.setZoomIn = function (zoomNum = 1) {
			// 获取地图当前缩放等级
			const zoom = this.getZoom()
			// 每单击一次地图的缩放等级减一，以实现地图缩小
			this.setZoom(zoom + zoomNum)
		}

		// 删除 交互时矢量图形（仅在主动绘制时或编辑时生效）
		this.removeGraph = function (draw) {
			map.removeInteraction(draw)
		}

		// 添加 交互时矢量图形（仅在主动绘制时或编辑时生效）
		this.addGraph = function (draw) {
			map.addInteraction(draw)
		}
	}

	function _JCPoint(...args) {
		Point.call(this, ...args)
	}

	function Marker(options) {
		Feature.call(this, options)
		this.options = options
	}

	function _JCMarker(option) {
		const { position = [0, 0], content = '', offset = [0, 0], extData = {} } = option
		option.position && delete option.position
		option.content && delete option.content
		option.extData && delete option.extData
		option.offset && delete option.offset

		const options = {
			geometry: new _JCPoint(position),
			content,
			position,
			offset,
			extData,
			overlayMarker: null,
			style: JSON.parse(JSON.stringify(option))
		}
		Marker.prototype.on = (eventName, callBack) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (eventName === 'complete') {
				eventName = 'rendercomplete'
				Marker.once(eventName, e => callBack && callBack(e))
			} else {
				Marker.on(eventName, e => callBack && callBack(e))
			}
		}
		// 获取自定义信息
		Marker.prototype.getExtentData = function () {
			return this.options.extData
		}

		// 获取Marker 坐标
		Marker.prototype.getPosition = function () {
			return this.options.position
		}

		// 获取Marker 偏移
		Marker.prototype.getOffset = function () {
			return this.options.offset
		}

		// 置顶
		Marker.prototype.setTop = function () {
			// return this.getGeometry().getCoordinates()
			console.log(this)
		}
		/**
		 * 获取html dom结构
		 * @returns
		 */
		Marker.prototype.getContent = function () {
			return this.options.content
		}
		/**
		 * 设置 content
		 */
		Marker.prototype.setLabel = function (content = '') {
			if (this.options.overlayMarker) {
				this.options.content = content // 目前无效
				const id = this.options.overlayMarker.getId()
				this.options.overlayMarker.setElement(createOverlayMarkerElement(content, id))
			}
		}
		/**
		 * 获取样式
		 */
		Marker.prototype.getStyle = function () {
			return this.options.style
		}

		const marker = new Marker(options)
		if (!extData.id) {
			marker.setId(marker.ol_uid)
		} else {
			marker.setId(extData.id)
		}
		if (content) {
			const overlayMarker = createOverlayMarker(marker)
			options.overlayMarker = overlayMarker
			marker.set('overlayMarker', overlayMarker)
		}
		return marker
	}

	function _MarkerClusterer(map, options, features = []) {
		const clusterLayer = createMarkerClusterer.call(this, map, options, features)

		if (features.length > 0) {
			map.addLayer(clusterLayer, '_MarkerClusterer', this) // 初始默认数据添加图层
		}

		// VectorLayer
		this.map = map
		this.getView = () => map.getView() // 获取地图的初始化 View 信息
		this.clusterLayer = clusterLayer // 聚合图层
		/**
		 * 创建聚合物覆盖群
		 * @param {*} map
		 * @param {*} options
		 * @param {*} features
		 * @returns
		 */
		function createMarkerClusterer(map, options, features) {
			const { distance = 40, minDistance = 30 } = options || {}
			const styleCache = {}

			// 创建要素数据来源
			const vectorSource = new VectorSource({
				features
			})
			// 这里是给第一级覆盖物添加的样式， 给聚合添加样式不在这里
			vectorSource.forEachFeature(feature => {
				if (!feature.getContent()) {
					feature.setStyle(createMarkerStyleFn(feature.getStyle()))
				}
			})

			// 创建要素聚合数据来源

			Cluster.prototype.overlaysList = []

			const clusterSource = new Cluster({
				distance: parseInt(distance, 10), // 要素将聚集在一起的距离（以像素为单位）
				minDistance: parseInt(minDistance, 10), //  簇之间的最小距离（以像素为单位）
				source: vectorSource,
				createCluster(point, features) {
					if (features.length == 1) {
						const cluster = new Feature({
							// geometry: point,
							// features: features,

							overlayMarker: features[0].get('overlayMarker')
						})

						return cluster
					} else {
						const cluster = new Feature({
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

			clusterSource.on('change', function (e) {
				const features = e.target.getFeatures()
				// 添加先清除所有overlayMarker
				clusterSource.overlaysList.forEach(item => {
					const over = map.getOverlayById(item)
					map.removeOverlays(over)
				})
				clusterSource.overlaysList = []
				clusterSource.dispatchEvent('clusterSource:change')
				if (features.length > 0) {
					// const removeFeatures = []
					// 添加每个聚合物相应的 OverlayMarker
					addOverlaysAction(map, clusterSource, features)
				}
			})

			// 拖动变化-主动触发 clusterSource  change
			map.on('moveend', function (e) {
				// console.log('moveend------------')
				clusterSource.changed()
			})

			// 创建一个图层
			const clusterLayer = new VectorLayer({
				source: clusterSource,
				style: (feature, resolution) => createFeatureStyleFn(styleCache, feature, resolution)
			})
			return clusterLayer
		}

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

	/**
	 * 矢量图形类
	 * @param {*} map 地图实例
	 * @param {*} type 矢量图形类型 （点 Point/线 Line/圆 Circle/多边形 Polygon/长方形 Rectangle/正方形 Square）
	 * @param {*} status 绘制 paint / 编辑 edit
	 * @param {*} options 配置参数
	 * options = {
	 *    center: '',
	 *    radius: 100,
	 *    strokeColor: ''
	 *    ...
	 * }
	 */
	function _JCGraph(map, options = {}) {
		this.map = map
		// this.type = type
		this.status = false // 是否完成绘制 状态
		this.editStatus = false
		// this.status = status // 绘制/编辑状态
		this.draw = null // 绘制矢量图对象
		this.featureData = null // 矢量图时特征数据
		this.source = null // 数据源
		this.vector = null // 准备放在图层上的数据元素
		const commonStyle = option => {
			if (!option) {
				option = {}
			}
			return new Style({
				geometry: function (feature) {
					const modifyGeometry = feature.get('modifyGeometry')
					return modifyGeometry ? modifyGeometry.geometry : feature.getGeometry()
				},
				// 矢量图形通用默认样式
				// 样式填充
				fill: new Fill({
					// 填充颜色
					color: option.fillColor || 'rgba(37,241,239,0.2)'
				}),
				RegularShape: new RegularShape({}),
				// 笔触
				stroke: new Stroke({
					// 笔触颜色
					color: option.strokeColor || '#264df6',
					// 笔触宽度
					width: option.strokeWidth || 2,
					// 线帽样式 butt、round、 或square
					lineCap: option.lineCap || 'round',
					// 	线连接样式 bevel、round、 或miter
					lineJoin: option.lineJoin || 'round'
				}),
				// 图形样式，主要适用于点样式
				image: new CircleStyle({
					// 半径大小
					radius: option.imageRadius || 7,
					fill: new Fill({
						// 填充颜色
						color: option.imageFill || '#e81818'
					})
				})
			})
		}
		/**
		 * 计算矢量图形中心点相关参数
		 * @param {*} geometry
		 * @returns
		 */
		const calculateCenter = geometry => {
			let center, coordinates, minRadius
			const type = geometry.getType()
			if (type === 'Polygon') {
				let x = 0
				let y = 0
				let i = 0
				coordinates = geometry.getCoordinates()[0].slice(1)
				coordinates.forEach(function (coordinate) {
					x += coordinate[0]
					y += coordinate[1]
					i++
				})
				center = [x / i, y / i]
			} else if (type === 'LineString') {
				center = geometry.getCoordinateAt(0.5)
				coordinates = geometry.getCoordinates()
			} else {
				center = getCenter(geometry.getExtent())
			}
			let sqDistances
			if (coordinates) {
				sqDistances = coordinates.map(function (coordinate) {
					const dx = coordinate[0] - center[0]
					const dy = coordinate[1] - center[1]
					return dx * dx + dy * dy
				})
				minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3
			} else {
				minRadius = Math.max(getWidth(geometry.getExtent()), getHeight(geometry.getExtent())) / 3
			}
			return {
				center: center,
				coordinates: coordinates,
				minRadius: minRadius,
				sqDistances: sqDistances
			}
		}
		const graphTool = {
			// 绘制工具列表
			Circle: {
				status: false,
				style: null
			},
			Rectangle: {
				status: false,
				style: null
			},
			Polygon: {
				status: false,
				style: null
			},
			Square: {
				status: false,
				style: null
			}
		}
		this.on = (eventName, callBack) => {
			// if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			// if (eventName === 'complete') {
			// 	eventName = 'rendercomplete'
			// 	map.once(eventName, e => callBack && callBack(e))
			// } else {
			// 	map.on(eventName, e => callBack && callBack(e))
			// }
			// callBack && callBack(e)
		}
		// <------    类方法分界线    ------->
		/**
		 * epsg 4326 坐标下 地图距离转换成 米
		 * @param {*} Circle
		 * @returns
		 */
		this.formatRadiusToMeters = function (Circle) {
			let radius
			const flag = true
			// geodesicCheckbox.checked
			if (flag) {
				const center = Circle.getCenter()
				const pointOnPerimeter = [center[0], center[1] + Circle.getRadius()]
				const sourceProj = map.getView().getProjection()
				const c1 = transform(center, sourceProj, 'EPSG:4326')
				const c2 = transform(pointOnPerimeter, sourceProj, 'EPSG:4326')
				radius = getDistance(c1, c2)
			} else {
				radius = Math.round(Circle * 100) / 100
			}
			return radius
		}
		/**
		 * epsg 4326 坐标下 米 转换成 地图距离
		 * @param {*} meters
		 * @returns
		 */
		this.formatMetersToRadius = function (meters) {
			const metersPerUnit = map.getView().getProjection().getMetersPerUnit()
			const circleRadius = meters / metersPerUnit
			return circleRadius
		}
		/**
		 * 激活矢量图绘制
		 * @param {*} graphName
		 */
		this.activate = function (graphName) {
			if (graphTool[graphName]) {
				this.beginPaint(graphName) // 开始绘图
			} else {
				console.warn(`JCMap vectorGraph has not ${graphName}, please you sure and try again~`)
			}
		}
		/**
		 * 失活矢量图绘制
		 */
		this.deactivate = function () {
			this.draw.setActive(false)
		}
		/**
		 * 圆形
		 */
		this.Circle = function (center, radius, option = {}, extData = {}) {
			// 进行坐标系转换 转4326坐标系
			const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
			const finalRadius = this.formatMetersToRadius(radius)
			this.featureData = null
			const tmp = new Circle(finalPath, finalRadius)
			tmp.set('extData', extData)
			const circle = new Feature(tmp)
			circle.setStyle(commonStyle(option))
			graphTool.Circle.style = commonStyle(option)
			this.source.addFeature(circle)
			return circle
		}
		/**
		 * 多边形
		 */
		this.Polygon = function (path, option = {}, extData = {}) {
			this.featureData = null
			const finalPath = []
			// 进行坐标系转换 转4326坐标系
			for (let i = 0; i < path.length; i++) {
				const tmpPoint = fromLonLat([path[i][0], path[i][1]], 'EPSG:4326')
				finalPath.push(tmpPoint)
			}
			const tmp = new Polygon([finalPath])
			tmp.set('extData', extData)
			const polygon = new Feature(tmp)
			polygon.setStyle(commonStyle(option))
			graphTool.Polygon.style = commonStyle(option)
			this.source.addFeature(polygon)
			return polygon
		}
		/**
		 * 矩形
		 */
		this.Rectangle = function (path, option = {}, extData = {}) {
			this.featureData = null
			const tmpArr = []
			if (path.length !== 4) {
				console.warn('JCMap 图形类警告: 传入路径错误，请检查~')
				return
			}
			tmpArr[0] = path.slice(0, path.length / 2)
			tmpArr[1] = path.slice(-(path.length / 2))

			const finalPath = []
			// 进行坐标系转换 转4326坐标系
			for (let i = 0; i < tmpArr.length; i++) {
				const tmpPoint = fromLonLat([tmpArr[i][0], tmpArr[i][1]], 'EPSG:4326')
				finalPath.push(tmpPoint)
			}
			const tmp = fromExtent(finalPath.flat())
			tmp.set('extData', extData)
			const rectangle = new Feature({
				geometry: tmp
			})
			rectangle.setStyle(commonStyle(option))
			graphTool.Rectangle.style = commonStyle(option)
			this.source.addFeature(rectangle)
			return rectangle
		}
		/**
		 * 编辑矢量图形
		 */
		this.editPaint = () => {
			this.status = false
			const defaultStyle = new Modify({ source: this.source }).getOverlay().getStyleFunction()

			const modify = new Modify({
				source: this.source,
				condition: function (event) {
					return primaryAction(event) && !platformModifierKeyOnly(event)
				},
				deleteCondition: never,
				insertVertexCondition: never,
				style: function (feature) {
					feature.get('features').forEach(function (modifyFeature) {
						const modifyGeometry = modifyFeature.get('modifyGeometry')
						if (modifyGeometry) {
							const point = feature.getGeometry().getCoordinates()
							let modifyPoint = modifyGeometry.point
							if (!modifyPoint) {
								// save the initial geometry and vertex position
								modifyPoint = point
								modifyGeometry.point = modifyPoint
								modifyGeometry.geometry0 = modifyGeometry.geometry
								// get anchor and minimum radius of vertices to be used
								const result = calculateCenter(modifyGeometry.geometry0)
								modifyGeometry.center = result.center
								modifyGeometry.minRadius = result.minRadius
							}

							const center = modifyGeometry.center
							const minRadius = modifyGeometry.minRadius
							let dx, dy
							dx = modifyPoint[0] - center[0]
							dy = modifyPoint[1] - center[1]
							const initialRadius = Math.sqrt(dx * dx + dy * dy)
							if (initialRadius > minRadius) {
								const initialAngle = Math.atan2(dy, dx)
								dx = point[0] - center[0]
								dy = point[1] - center[1]
								const currentRadius = Math.sqrt(dx * dx + dy * dy)
								if (currentRadius > 0) {
									const currentAngle = Math.atan2(dy, dx)
									const geometry = modifyGeometry.geometry0.clone()
									geometry.scale(currentRadius / initialRadius, undefined, center)
									const typeName = modifyGeometry.geometry0.getType()
									if (typeName !== 'Circle') {
										const tmp = modifyGeometry.geometry0.getCoordinates()[0]
										// 只有 非矩形 才能旋转
										if (!(typeName === 'Polygon' && compareArray(tmp[0], tmp[tmp.length - 1]))) {
											geometry.rotate(currentAngle - initialAngle, center)
										}
									}
									modifyGeometry.geometry = geometry
								}
							}
						}
					})
					return defaultStyle(feature)
				}
			})
			this.map.addGraph(modify)
			const trans = new Translate({
				condition: function (event) {
					return primaryAction(event) && platformModifierKeyOnly(event)
				},
				layers: [this.vector]
			})
			this.map.addGraph(trans)
			modify.on('modifystart', e => {
				e.features.forEach(function (feature) {
					feature.set('modifyGeometry', { geometry: feature.getGeometry().clone() }, true)
				})
			})

			modify.on('modifyend', e => {
				e.features.forEach(function (feature) {
					const modifyGeometry = feature.get('modifyGeometry')
					if (modifyGeometry) {
						feature.setGeometry(modifyGeometry.geometry)
						feature.unset('modifyGeometry', true)
					}
				})
				this.fetureGeo(e.features.item(0))
				this.status = true
			})
		}
		// this.stopEdit = () => {

		// }
		/**
		 * 初始化矢量图形
		 */
		this.initGraph = function () {
			this.source = new VectorSource({ wrapX: false })
			this.vector = new VectorLayer({
				className: 'VectorLayer',
				// 数据源
				source: this.source,
				// 样式
				style: function (feature) {
					console.log(feature, 'feature')
					const styles = [commonStyle(options)]
					const modifyGeometry = feature.get('modifyGeometry')
					const geometry = modifyGeometry ? modifyGeometry.geometry : feature.getGeometry()
					const result = calculateCenter(geometry)
					const center = result.center
					if (center) {
						styles.push(
							new Style({
								geometry: new Point(center),
								image: new CircleStyle({
									radius: 4,
									fill: new Fill({
										color: '#ff3333'
									})
								})
							})
						)
						const coordinates = result.coordinates
						if (coordinates) {
							const minRadius = result.minRadius
							const sqDistances = result.sqDistances
							const rsq = minRadius * minRadius
							const points = coordinates.filter(function (coordinate, index) {
								return sqDistances[index] > rsq
							})
							styles.push(
								new Style({
									geometry: new MultiPoint(points),
									image: new CircleStyle({
										radius: 4,
										fill: new Fill({
											color: '#33cc33'
										})
									})
								})
							)
						}
					}
					return styles
				}
			})
			this.map.addLayer(this.vector) // 添加到图层上
		}

		/**
		 * 清除图层上的数据源（矢量图形）
		 * @param {*} e
		 */
		this.clearVector = function () {
			// this.source = null;
			// //设置矢量图层的数据源为空
			// this.vector.setSource(this.source);
			if (!this.source) {
				console.warn('VectorSource Class warn: source is null!')
				return
			}
			this.source.clear()
		}
		/**
		 * 计算矢量图形几何特征
		 * @returns
		 */
		this.fetureGeo = function (e) {
			const geo = e.getGeometry()
			const type = geo.getType()
			if (type === 'Circle') {
				const center = geo.getCenter()
				const radius = geo.getRadius()
				this.featureData = Object.assign(
					{},
					{
						center: center,
						radius: this.formatRadiusToMeters(geo),
						type: type
					}
				)
			} else if (type === 'Polygon') {
				const points = geo.getCoordinates()
				console.log(points, 'points')
				this.featureData = Object.assign(
					{},
					{
						points: points.flat(1),
						type: type
					}
				)
			}
		}
		/**
		 * 获取绘制矢量图形几何特征属性
		 * @param {*}
		 */
		this.getFeture = function (e = '') {
			if (e) {
				if (!this.featureData) {
					this.fetureGeo(e)
				}
			}
			return this.featureData
		}
		/**
		 * 停止绘制
		 */
		this.stopPaint = function (e) {
			// new Draw.finishDrawing()
			const geo = e.feature.getGeometry()
			const type = geo.getType() // 获取类型
			// 根据不同的类型执行不同的操作
			const handle = {
				Circle: () => {
					// 获取中心点和半径
					const center = geo.getCenter()
					const radius = geo.getRadius()
				},
				Polygon: () => {
					// 获取坐标点
					const points = geo.getCoordinates()
				}
				// 'LineString': () => {
				//     let points = geo.getCoordinates()
				//     console.log(points)
				// }
			}
			if (handle[type]) handle[type]()
			this.map.removeGraph(this.draw)
		}
		/**
		 * 开始绘制
		 */
		this.beginPaint = function (type) {
			this.status = false // 状态初始化
			this.featureData = null // 矢量图特征清空初始化
			// this.initGraph()
			let geometryFunction // 更新几何坐标时调用的函数。
			let penValue = 'Circle' // 笔尖类型 默认为Circle
			switch (type) {
				case 'Point':
					// paintPoint()
					break
				case 'Line':
					// paintLine()
					break
				// 默认不写参数 即为圆形
				case 'Circle':
					if (graphTool.Circle.style) {
						this.vector.setStyle(graphTool.Circle.style)
					}
					break
				case 'Polygon':
					if (graphTool.Polygon.style) {
						this.vector.setStyle(graphTool.Polygon.style)
					}
					penValue = 'Polygon'
					break
				case 'Rectangle':
					if (graphTool.Rectangle.style) {
						this.vector.setStyle(graphTool.Rectangle.style)
					}
					geometryFunction = paintRectangle()
					break
				case 'Square':
					geometryFunction = paintSquare()
					break
			}
			this.draw = new Draw({
				// 数据源
				source: this.source,
				// 绘制类型
				type: penValue,
				geometryFunction: geometryFunction,
				freehand: type !== 'Polygon', // 手绘模式
				stopClick: true
				// 最大点数
				// maxPoints: maxPoints
			})

			// 将draw对象添加到map中，然后就可以进行图形绘制了
			this.map.addGraph(this.draw)
			this.draw.setActive(true)
			this.listener(this.draw, e => {
				this.fetureGeo(e.feature)
				this.status = true
			})
		}
		this.listener = (type, callBack) => {
			type.addEventListener('drawend', e => {
				type.setActive(false)
				this.stopPaint(e)
				callBack && callBack(e)
			})
		}
		/**
		 * 绘制矩形
		 */
		function paintRectangle() {
			return createBox()
		}
		/**
		 * 绘制正方形
		 * @param {*} params
		 */
		function paintSquare() {
			return createRegularPolygon(4)
		}
		/**
		 * 初始化执行类静态方法
		 */
		this.initGraph()
	}
	/**
	 * 搜索类
	 * @param {*} map
	 */
	function _JCSearch(map) {
		// Ev 搜索服务
		const searchBase = new EV.ServiceLS(map)
		this.search = function (city, searchKeyWord, callBack) {
			searchBase.search(
				{
					city: city, // 城市名称
					keyword: searchKeyWord // 搜索关键字
				},
				function (data) {
					// map.clearOverlays()
					// searchBase.render();  //在地图上显示

					callBack && callBack(data.points)
				}
			)
		}
		const searchRac = new EV.ServiceRAC(map)
		this.getBounday = (val, callBack) => {
			searchRac.getBounday(
				{
					admincode: val // 按行政区域编码查询
				},
				data => {
					console.log(val, data)
					searchRac.render() // 在地图中显示
					// map.clearOverlays()
					callBack && callBack(data)
				}
			)
		}
	}

	/**
	 * 区域图层类
	 * @param {*} map
	 */
	function DistrictLayer(geojsonObject) {
		if (!geojsonObject) return
		const getColorByAdcode = function (adcode) {
			switch (adcode) {
				case 542500:
					return 'rgba(224, 195, 246,.5)'
				case 540600:
					return 'rgba(253, 207, 175,.5)'
				case 540200:
					return 'rgba(226, 254, 228,.5)'
				case 540100:
					return 'rgba(249, 230, 213,.5)'
				case 540500:
					return 'rgba(200, 205, 213,.5)'
				case 540400:
					return 'rgba(174, 255, 253,.5)'
				case 540300:
					return 'rgba(172, 201, 245,.5)'
			}
		}

		const getColorByHover = function (adcode) {
			switch (adcode) {
				case 542500:
					return 'rgba(219, 183, 246,.5)'
				case 540600:
					return 'rgba(252, 194, 153,.5)'
				case 540200:
					return 'rgba(207, 251, 210,.5)'
				case 540100:
					return 'rgba(250, 217, 194,.5)'
				case 540500:
					return 'rgba(160, 167, 178,.5)'
				case 540400:
					return 'rgba(152, 253, 251,.5)'
				case 540300:
					return 'rgba(150, 185, 239,.5)'
			}
		}

		const styleFunction = function (feature) {
			const adcode = feature.get('adcode')
			const color = getColorByAdcode(adcode)
			return new Style({
				stroke: new Stroke({
					color: '#c9c9c9',
					width: 1
				}),
				fill: new Fill({
					color
				})
			})
		}

		const vectorSource = new VectorSource({
			features: new GeoJSON().readFeatures(geojsonObject)
		})

		vectorSource.forEachFeature(feature => {
			feature.setStyle(styleFunction(feature))
		})

		const vectorLayer = new VectorLayer({
			source: vectorSource
		})

		vectorLayer.getDistrictByContainerPos = function (pixel) {
			return new Promise((resolve, reject) => {
				this.getFeatures(pixel)
					.then(([features]) => {
						features && resolve(features.getProperties())
					})
					.catch(err => {
						console.log(err)
						reject(err)
					})
			})
		}
		return vectorLayer
	}

	// 继承 Map 相关基础类
	inheritPrototype(_JCPoint, Point)
	inheritPrototype(Marker, Feature)
	inheritPrototype(_JCMap, TemporaryMap)
	inheritPrototype(_JCGraph, Draw)

	function Event() {
		this.eventList = new Map()
		this.addListener = (target, type, callBack) => {
			const handleAction = () => {
				let timeoutID = null // 单击事件
				let timeoutHoverID = null // pointermove事件
				if (type === 'click') {
					if (target instanceof Feature) {
						if (target.get('overlayMarker')) {
							const dom = target.get('overlayMarker').getElement()
							dom.addEventListener(type, e => {
								callBack && callBack(target, 'overlay')
							})
							return false
						}
					}
					target.on(type, e => {
						clearTimeout(timeoutID)
						timeoutID = setTimeout(() => {
							// 当前点经纬度
							// const coordinate = e.coordinate
							let result = null

							if (target instanceof _JCMap) {
								console.log('当前坐标', transform(target.getCoordinateFromPixel(e.pixel), target.getView().getProjection(), 'EPSG:4326'))
								if (target.hasFeatureAtPixel(e.pixel)) {
									const typeName = target.getFeaturesAtPixel(e.pixel)[0].getGeometry().getType()
									// Point => 聚合那一块的逻辑

									if (typeName === 'Point') {
										console.log(typeName)
										const features = target.getFeaturesAtPixel(e.pixel)[0].get('features')
										if (features) {
											if (features.length > 1) {
												// 聚合物
												const clusterFeatures = target.getFeaturesAtPixel(e.pixel)[0]
												result = [clusterFeatures, 'MarkerCluster']
											} else {
												console.warn('请联系开发人员核实这个bug~')
											}
										} else {
											const marker = target.getFeaturesAtPixel(e.pixel)[0].getExtentData()
											// 单个要素
											// let property = features[0].getProperties() //要素属性
											// console.log('自定义属性:', marker.getExtentData())
											result = [marker, 'Marker']
										}
									} else if (typeName === 'Circle') {
										console.log(target.getFeaturesAtPixel(e.pixel)[0])
										result = [target.getFeaturesAtPixel(e.pixel)[0].getGeometry(), typeName]
									} else if (typeName === 'MultiPolygon') {
										result = [e, typeName]
									} else {
										const tmp = target.getFeaturesAtPixel(e.pixel)[0].getGeometry().getCoordinates()[0]
										if (typeName === 'Polygon' && compareArray(tmp[0], tmp[tmp.length - 1])) {
											result = [target.getFeaturesAtPixel(e.pixel)[0].getGeometry(), 'Rectangle']
										} else {
											result = [target.getFeaturesAtPixel(e.pixel)[0].getGeometry(), typeName]
										}
									}
								}

								callBack && callBack(...(result || [e, 'Map']))
							}
						}, 200)
					})
				} else if (type === 'dblclick') {
					if (target instanceof Feature) {
						if (target.get('overlayMarker')) {
							const dom = target.get('overlayMarker').getElement()
							dom.addEventListener(type, e => {
								callBack && callBack(target, 'overlay')
							})
							return false
						}
					}

					target.on(type, e => {
						clearTimeout(timeoutID) // 移除单击事件
						// target.setZoomIn()
						let result = null

						if (target instanceof _JCMap) {
							if (target.hasFeatureAtPixel(e.pixel)) {
								const features = target.getFeaturesAtPixel(e.pixel)[0].get('features')
								if (features.length == 1) {
									// 单个要素
									// let property = features[0].getProperties() //要素属性
									const marker = features[0]
									// console.log('自定义属性:', marker.getExtentData())
									result = [marker, 'Marker']
								} else {
									// 聚合物
									const clusterFeatures = target.getFeaturesAtPixel(e.pixel)[0]
									result = [clusterFeatures, 'MarkerCluster']
									// target.setZoomIn()
								}
							}
						}
						callBack && callBack(...(result || [e, 'Map']))
						// console.log(target.getZoom())
					})
				} else if (type === 'done') {
					if (target instanceof _JCGraph) {
						Object.defineProperty(target, 'status', {
							get: function () {},
							set: function (val) {
								if (val) {
									if (target.featureData.type) {
										callBack && callBack(target, target.featureData.type)
									} else {
										callBack && callBack(target, target.featureData.getType())
									}
									target.featureData = null
								}
							}
						})
					}
				} else if (type === 'hover') {
					if (target instanceof _JCMap) {
						let geometryCache = null
						target.on('pointermove', e => {
							if (e.dragging) {
								return
							}

							timeoutHoverID = setTimeout(() => {
								let result = null

								if (target.hasFeatureAtPixel(e.pixel)) {
									const feature = target.forEachFeatureAtPixel(e.pixel, function (feature) {
										return feature
									})

									if (feature) {
										// 存在feature
										const geometryType = feature.getGeometry().getType()
										result = [[feature, geometryCache], geometryType]

										if (!geometryCache) {
											// 首次进入区域
											const cacheStyle = JSON.parse(JSON.stringify(feature.getStyle()))
											feature.set('cacheStyle', cacheStyle)
											geometryCache = feature
											callBack && callBack(...result)
											return
										} else if (!(geometryCache === feature)) {
											// 切换区域
											const cacheStyle = JSON.parse(JSON.stringify(feature.getStyle()))
											feature.set('cacheStyle', cacheStyle)
											geometryCache = null
											callBack && callBack(...result)
											return
										} else {
											// hover
											return
										}
									}
								}

								const geometryType = geometryCache && geometryCache.getGeometry().getType()
								if (geometryType && geometryType === 'MultiPolygon') {
									// 离开区域
									result = [[null, geometryCache], geometryType]
								}
								callBack && callBack(...(result || [e, 'Map']))
								geometryCache = null
							}, 100)
						})
					}
				} else if (type === 'contextmenu') {
					target.on(type, e => {
						if (target instanceof _JCMap) {
							if (target.hasFeatureAtPixel(e.pixel)) {
								e.preventDefault()
								const paint = target.getFeaturesAtPixel(e.pixel)[0]
								target.removePaint(paint)
								callBack && callBack(paint.getGeometry())
							}
						}
					})
				}
			}
			// 未绑定过事件对象
			if (!this.eventList.has(target)) {
				const eventTypes = [type]
				this.eventList.set(target, eventTypes)
				handleAction()
			} else {
				const eventTypes = this.eventList.get(target)
				// 未绑定过事件
				if (!eventTypes.includes(type)) {
					handleAction()
				}
			}
		}
	}

	return {
		Map: _JCMap,
		Point: _JCPoint,
		Marker: _JCMarker,
		MarkerClusterer: _MarkerClusterer,
		ZoomSlider: ZoomSlider,
		DistrictLayer: DistrictLayer, // 区域图层类
		Event: new Event(),
		VectorGraph: _JCGraph, // 矢量图形类
		Search: _JCSearch // 搜索类,
	}
}

const JC = initJCMap()
export default JC
