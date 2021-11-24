import 'ol/ol.css'
import { Map, View, Feature } from 'ol'
import Overlay from 'ol/Overlay'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style, Text, Icon } from 'ol/style'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import Polygon, { fromExtent } from 'ol/geom/Polygon'
import Circle from 'ol/geom/Circle' // 圆形
import Point from 'ol/geom/Point'
import Cluster from 'ol/source/Cluster'
import XYZ from 'ol/source/XYZ'
import VectorSource from 'ol/source/Vector'
import { ZoomSlider, defaults as defaultControls } from 'ol/control'
import { boundingExtent } from 'ol/extent'
import { defaults as Defaultinteraction } from 'ol/interaction'
import { transform } from 'ol/proj'
import { getDistance } from 'ol/sphere'
import * as olEvents from 'ol/events'
import Modify from 'ol/interaction/Modify'
import Snap from 'ol/interaction/Snap'
import Select from 'ol/interaction/Select'

import img0 from './assets/image/map/m0.png'
import img1 from './assets/image/map/m1.png'
import img2 from './assets/image/map/m2.png'
import img3 from './assets/image/map/m3.png'
function initJCMap() {
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
	function createOverlayMarker(features) {
		const id = features.getExtentData().id || features.getId()
		const content = features.getContent()
		const position = features.getPosition()
		const container = document.createElement('div')
		container.innerHTML = content
		container.setAttribute('z-index', 9)
		container.setAttribute('id', `JC-${id}`)
		return new Overlay({
			id: id,
			element: container, // 绑定 Overlay 对象和 DOM 对象的
			position: position
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
		const { center = [0, 0], zoom = 6, minZoom = 0, maxZoom = 28, doubleClickZoom = false, zoomShow = true } = options
		// 标准底图图层
		const standardTileLayer = new TileLayer({
			zIndex: 0, // 底图图层层级
			className: 'ol-layer standard',
			visible: true,
			source: new XYZ({
				url: 'http://a.qqearth.com:81/engine?st=GetImage&box={x},{y}&lev={z}&type=vect&uid=xzjc'
			})
		})

		const satelliteTileLayer = new TileLayer({
			zIndex: 0, // 底图图层层级
			visible: false,
			className: 'ol-layer satellite',
			source: new XYZ({
				url: 'http://a.qqearth.com:81/engine?st=GetImage&box={x},{y}&lev={z}&type=sate&uid=xzjc'
			})
		})
		const zooms = zoomShow
		// 地图初始化
		return new Map({
			target,
			layers: [satelliteTileLayer, standardTileLayer], // 图层
			overlays: [], // 覆盖物
			view: new View({
				projection: 'EPSG:4326',
				center, // 中心点
				zoom, // 层级
				minZoom, // 最小缩放
				maxZoom // 最大缩放
			}),
			interactions: new Defaultinteraction({
				doubleClickZoom // 屏蔽默认双击放大事件
			}),
			controls: defaultControls({ zoom: zooms }).extend([])
		})
	}

	function _JCMap(...args) {
		const map = TemporaryMap.call(this, ...args) // 继承this属性
		this.map = map
		// 获取地图的初始化信息
		this.view = map.getView()
		this.center = this.view.getCenter()

		const maxZoom = this.view.getMaxZoom()

		const minZoom = this.view.getMinZoom()
		// 因为层级组件是修改过的，用户没有主动添加该组件，默认是移除的
		map.removeControl(new JC.ZoomSlider())

		this.on = (eventName, callBack) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (eventName === 'complete') {
				eventName = 'rendercomplete'
				map.once(eventName, e => callBack && callBack(e))
			} else {
				map.on(eventName, e => callBack && callBack(e))
			}
		}
		this.forEachFeatureAtPixel = map.forEachFeatureAtPixel.bind(map)
		this.addControl = map.addControl.bind(map) // 添加控件

		this.addLayer = map.addLayer.bind(map) // 添加图层

		this.removeLayer = map.removeLayer.bind(map) // 移除图层
		this.addOverlay = map.addOverlay.bind(map) // 添加overlay 衍生自map类，此处为内置函数，不暴露给外部
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

		// this.addMarker
		/**
		 * 移除对应的覆盖物
		 * @param {*} marker
		 */
		this.removeOverlays = marker => {
			this.map.removeOverlay(marker)
		}
		/**
		 * 清除地图上所有覆盖物
		 */
		this.clearOverlays = () => {
			const overlays = this.map.getOverlays()
			overlays.forEach(item => this.removeOverlay(item))
		}

		this.getOverlayById = map.getOverlayById.bind(map) // 获取覆盖物ID

		this.getLayers = map.getLayers.bind(map) // 获取所有图层

		this.getView = map.getView.bind(map) // 获取 View对象

		this.getSize = map.getSize.bind(map) // 获取 视口大小 size

		this.updateSize = map.updateSize.bind(map) // 强制更新视口大小

		this.getFeaturesAtPixel = map.getFeaturesAtPixel.bind(map) // 从 坐标 获取 Features集合

		this.hasFeatureAtPixel = map.hasFeatureAtPixel.bind(map) // 判断是否点击了 Feature

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
			const viewCenter = coord || (this.center ? this.center : [0, 0])
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
				maxZoom: 28,
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

		// 删除 矢量图形
		this.removeGraph = function (draw) {
			map.removeInteraction(draw)
		}
		// 添加 矢量图形
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
		const { position = [0, 0], content = '', extData = {} } = option
		option.position && delete option.position
		option.content && delete option.content
		option.extData && delete option.extData

		const options = {
			geometry: new _JCPoint(position),
			content,
			position,
			extData,
			overlayMarker: null,
			style: JSON.parse(JSON.stringify(option))
		}
		// 获取自定义信息
		Marker.prototype.getExtentData = function () {
			return this.options.extData
		}

		// 获取Marker 坐标
		Marker.prototype.getPosition = function () {
			return this.options.position
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
		 * 获取样式
		 */
		Marker.prototype.getStyle = function () {
			return this.options.style
		}

		const marker = new Marker(options)

		if (!extData.id) {
			marker.setId(marker.ol_uid)
		}

		if (content) {
			marker.set('overlayMarker', createOverlayMarker(marker))
		}

		return marker
	}

	function _MarkerClusterer(map, options, features = []) {
		const clusterLayer = createMarkerClusterer.call(this, map, options, features)

		features.length > 0 && map.addLayer(clusterLayer) // 初始默认数据添加图层

		this.map = map

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
			vectorSource.forEachFeature(marker => {
				!marker.getContent() && marker.setStyle(createMarkerStyleFn(marker.getStyle()))
			})

			// 创建要素聚合数据来源

			Cluster.prototype.overlaysList = []
			const clusterSource = new Cluster({
				distance: parseInt(distance, 10), // 要素将聚集在一起的距离（以像素为单位）
				minDistance: parseInt(minDistance, 10), //  簇之间的最小距离（以像素为单位）
				source: vectorSource,
				createCluster(point, features) {
					if (features.length == 1) {
						setTimeout(() => {
							const marker = features[0].get('overlayMarker')
							if (marker) {
								const id = marker.getId()
								if (!this.overlaysList.includes(id)) {
									this.overlaysList.push(id)
									map.addOverlay(marker)
								}
							}
						}, 0)
					}
					const cluster = new Feature({
						geometry: point,
						features: features
					})
					return cluster
				}
			})

			console.log('clusterSource------------', clusterSource)
			/**
			 * 监听聚合层级变化 ，用于清除聚合状态下 自定义overlays数量
			 */
			clusterSource.on('change', function (e) {
				clusterSource.overlaysList.forEach(item => {
					const over = map.getOverlayById(item)
					map.removeOverlays(over)
				})
				clusterSource.overlaysList = []
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

		// 获取聚合类的基础Marker集合
		this.getMarkers = () => {
			return this.getVectorSource().getFeatures()
		}

		// 将Marker集合添加到聚合
		this.setMarkers = features => {
			const distance = this.getDistance()
			const minDistance = this.getMinDistance()
			if (Array.isArray(features) && features.length > 0) {
				this.clusterLayer && this.map.removeLayer(this.clusterLayer)
				this.clusterLayer = createMarkerClusterer(this.map, { distance, minDistance }, features)
				this.map.addLayer(this.clusterLayer)
				return this.clusterLayer
			}
		}
		// 添加Marker
		this.addMarker = (...args) => {
			if (args.length === 1) {
				if (Array.isArray(args[0])) {
					console.log(args[0])
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

		// 删除Marker
		this.removeMarker = (...args) => {
			if (args.length === 1) {
				if (Array.isArray(args[0])) {
					args[0].forEach(marker => {
						marker instanceof Marker && this.getVectorSource().removeFeature(marker)
					})
				} else {
					args[0] instanceof Marker && this.getVectorSource().removeFeature(args[0])
				}
			} else {
				args.forEach(marker => this.removeMarker(marker))
			}
		}

		// 清空 Markers
		this.clearMarkers = () => {
			this.getClusterSource().overlaysList = []
			this.getVectorSource().clear() //
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
		// this.status = status // 绘制/编辑状态
		this.draw = null // 绘制矢量图对象
		this.fetureData = null // 矢量图时特征数据
		this.source = null // 数据源
		this.vector = null // 准备放在图层上的数据元素
		const commonStyle = option => {
			return new Style({
				// 矢量图形通用默认样式
				// 样式填充
				fill: new Fill({
					// 填充颜色
					color: option.fillColor || 'rgba(37,241,239,0.2)'
				}),
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
		const graphTool = {
			// 绘制工具列表
			Circle: {
				status: false
			},
			Rectangle: {
				status: false
			},
			Polygon: {
				status: false
			},
			Square: {
				status: false
			}
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
		this.Circle = function (center, radius, option = {}) {
			const circle = new Feature(new Circle(center, radius))
			this.source.addFeature(circle)
			return circle
		}
		/**
		 * 多边形
		 */
		this.Polygon = function (path, option = {}) {
			const polygon = new Feature(new Polygon([path]))
			this.source.addFeature(polygon)
			return polygon
		}
		/**
		 * 矩形
		 */
		this.Rectangle = function (path, option = {}) {
			const rectangle = new Feature({
				geometry: fromExtent(path)
			})
			this.source.addFeature(rectangle)
			return rectangle
		}
		/**
		 * 编辑矢量图形
		 */
		this.editPaint = () => {
			console.log(this.source)
			const select = new Select({
				multi: false // 取消多选
			})
			const modify = new Modify({
				features: this.source.getFeatures()
			})
			const snap = new Snap({
				features: this.source.getFeatures()
			})
			this.map.addInteraction(modify)
			this.map.addInteraction(snap)
			modify.on('modifyend', evt => {
				const extent = evt.features.item(0).getGeometry().getCoordinates()[0] // 这样是拿新几何图形的坐标。
			})
		}
		/**
		 * 初始化矢量图形
		 */
		this.initGraph = function () {
			this.source = new VectorSource({ wrapX: false })
			this.vector = new VectorLayer({
				// 数据源
				source: this.source,
				// 样式
				style: commonStyle(options)
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
			const geo = e.feature.getGeometry()
			const type = geo.getType()
			if (type === 'Circle') {
				const center = geo.getCenter()
				const radius = geo.getRadius()
				this.fetureData = Object.assign(
					{},
					{
						center: center,
						radius: this.formatRadiusToMeters(geo)
					}
				)
			} else if (type === 'Polygon') {
				const points = geo.getCoordinates()
				console.log(points, 'points')
				this.fetureData = Object.assign(
					{},
					{
						points: points.flat(1)
					}
				)
			}
		}
		/**
		 * 获取绘制矢量图形几何特征属性
		 * @param {*}
		 */
		this.getFeture = function (e) {
			if (!this.fetureData) {
				this.fetureGeo(e)
			}
			return this.fetureData
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
			this.fetureData = null // 矢量图特征清空初始化
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
					break
				case 'Polygon':
					penValue = 'Polygon'
					break
				case 'Rectangle':
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
				console.log(e, 'e')
				this.fetureGeo(e)
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
					callBack && callBack(data.points)
					// ls.render();  //在地图上显示
				}
			)
		}
	}

	// 继承 Map 相关基础类
	inheritPrototype(_JCPoint, Point)
	inheritPrototype(Marker, Feature)
	inheritPrototype(_JCMap, TemporaryMap)
	inheritPrototype(_JCGraph, Draw)

	function Event() {
		this.addListener = function (target, type, callBack) {
			let timeoutID = null // 单击事件
			if (type === 'click') {
				target.on(type, e => {
					clearTimeout(timeoutID)
					timeoutID = setTimeout(() => {
						// 当前点经纬度
						// const coordinate = e.coordinate
						let result = null
						if (target instanceof _JCMarker) {
							callBack && callBack(target, 'Marker')
						}
						if (target instanceof _JCMap) {
							if (target.hasFeatureAtPixel(e.pixel)) {
								const typeName = target.getFeaturesAtPixel(e.pixel)[0].getGeometry().getType()
								// Point => 聚合那一块的逻辑
								if (typeName === 'Point') {
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
								} else {
									// 矢量图形那一块的逻辑
									result = [target.getFeaturesAtPixel(e.pixel)[0].getGeometry()]
								}
							}

							callBack && callBack(...(result || [e, 'Map']))
						}
					}, 200)
				})
			} else if (type === 'dblclick') {
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
						set: function (val) {
							if (val) {
								callBack && callBack(target)
							}
						}
					})
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
		Event: new Event(),
		VectorGraph: _JCGraph, // 矢量图形类
		Search: _JCSearch // 搜索类
	}
}

const JC = initJCMap()
export default JC
