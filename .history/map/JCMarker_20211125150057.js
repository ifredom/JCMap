// import { OlFeature, OlPoint } from './inherit'
// import { fromLonLat } from 'ol/proj'
// import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
// import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style, Text, Icon } from 'ol/style'
import { Marker, OlPoint, OverlayMarker } from './inherit'

//zIndex Marker 层级为2

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

// Marker  参数处理函数
function getMarkerOptions(options) {
	const {
		position = [0, 0], //位置
		content = '', // overlayMarker 内容
		offset = [0, 0], //偏移量
		extData = {} //自定义信息
	} = options
	options.position && delete options.position
	options.content && delete options.content
	options.offset && delete options.offset
	options.extData && delete options.extData
	const style = JSON.parse(JSON.stringify(options))
	return {
		geometry: new OlPoint(position),
		content,
		position,
		offset,
		extData,
		id: extData.id ? extData.id : null,
		overlayMarker: null,
		style: style // 获取到样式
	}
}

// Marker  样式处理函数
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

function createOverlayMarkerElement(content, id) {
	const container = document.createElement('div')
	container.innerHTML = content
	container.style.zIndex = 9
	container.setAttribute('id', `JC-${id}`)
	return container
}

function createOverlayMarker(options) {
	const { content = '', position = [0, 0], offset = [0, 0], id = '' } = options

	const element = createOverlayMarkerElement(content, id)
	const overlayMarker = new OverlayMarker({
		id,
		position,
		offset,
		element, // 绑定 OverlayMarker 对象和 DOM 对象的
		stopEvent: true, // 停止向map 冒泡事件，并且将overlayMarker放在工具栏dom内，
		insertFirst: true, // 可定义在工具栏dom内时，fale显示在工具栏上方，默认 true 展示在下方
		autoPan: false, // 设置true后,会让第一个OverlayMarker自动平移到可视区域
		autoPanAnimation: {
			duration: 250
		},
		autoPanMargin: 20, // 平移动画开启后，距离可视区域边距
		className: 'ol-overlay-container ol-selectable' // all OverlayMarker className
	})

	return overlayMarker
}

function initMarker(options, type) {
	// 初始化marker
	const marker = new Marker(options)

	//设置ID
	if (!options.id) {
		options.id = marker.ol_uid
		marker.setId(marker.ol_uid)
		marker.set('id', marker.ol_uid)
	}

	if (type === 'MARKER') {
		// 设置marker样式, Feature 初始化传入样式无效
		marker.setStyle(createMarkerStyle(marker.get('style')))
	} else {
		const overlayMarker = createOverlayMarker(options)
		options.overlayMarker = overlayMarker
		marker.set('overlayMarker', overlayMarker)
	}

	return marker
}

function JCMarker({ map, ...options }) {
	const markerOptions = getMarkerOptions(options || {})
	const JCTYPE = !!markerOptions.content ? 'OVERLAYMARKER' : 'MARKER'

	this.JCTYPE = JCTYPE

	this.options = markerOptions

	this[JCTYPE] = initMarker(this.options, JCTYPE)

	this.getId = function () {
		return this.options.id
	}

	// 获取自定义信息
	this.getExtentData = function () {
		return this.options.extData
	}

	// 获取 Marker 坐标
	this.getPosition = function () {
		return this.options.position
	}

	// 获取Marker 偏移
	this.getOffset = function () {
		return this.options.offset
	}

	// 获取Marker 偏移
	this.getOverlayMarker = function () {
		return this[JCTYPE].get('overlayMarker')
	}

	if (this.JCTYPE === 'MARKER') {
		const events = ['singleclick', 'click', 'dblclick', 'contextmenu'] // 支持的事件
		this.markerEvents = [] // 存储事件
		//事件监听
		this.on = (eventName, callBack) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (!events.includes(eventName)) return console.warn('无效的事件：' + eventName)

			const eventObject = {
				eventName,
				callBack,
				listener: () => {}
			}
			const currentEventObject = this.markerEvents.find(e => e.eventName === eventName)

			// 未绑定过事件
			if (!currentEventObject) {
				//注册事件
				map.on(eventObject.eventName)
				this.markerEvents.push(eventObject)
				eventObject.listener = e => callBack && callBack(e)
				//监听事件
				this[JCTYPE].on(eventObject.eventName, eventObject.listener)
			} else {
				//移除相同的事件
				this[JCTYPE].un(currentEventObject.eventName, currentEventObject.listener)
				//监听事件
				this[JCTYPE].on(eventObject.eventName, e => eventObject.callBack && eventObject.callBack(e))
			}
		}

		// 设置自定义信息
		this.setExtentData = function (extData) {
			this.options.extData = extData
			this[JCTYPE].set('extData', extData)
		}

		// 设置 Marker 坐标
		this.setPosition = function (position) {
			if (!position) return
			this.options.position = position
			this[JCTYPE].set('position', position)
			marker.getGeometry().setCoordinates(position)
		}

		// 设置自定义信息
		this.setId = function (id) {
			if (!id) return
			this.options.id = id
			this[JCTYPE].setId(id)
			this[JCTYPE].set('id', id)
		}

		/**
		 * 获取样式
		 */
		this.getStyle = function () {
			return this.options.style
		}
		/**
		 * 设置样式- 会替换默认样式
		 */
		this.setStyle = function (style) {
			this[JCTYPE].setStyle(createMarkerStyle(style))
		}
	} else {
		const events = ['click', 'dblclick', 'contextmenu'] // 支持的事件

		let clickTimeId = null //单击事件定时器

		this.overlayMarkerEvents = new Map() // 存储事件

		//事件注册
		this.on = (eventName, callBack) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (!events.includes(eventName)) return console.warn('无效的事件：' + eventName)
			const element = this.getElement()
			const eventObject = {
				eventName,
				callBack,
				target: element,
				handler: () => {}
			}

			const clickHandler = (e, callBack) => {
				clickTimeId && clearTimeout(clickTimeId)
				clickTimeId = setTimeout(() => {
					callBack && callBack(e)
				}, 200)
			}

			const dblclickHandler = (e, callBack) => {
				clickTimeId && clearTimeout(clickTimeId)
				callBack && callBack(e)
			}

			const contextmenuHandler = (e, callBack) => {
				callBack && callBack(e)
			}

			//事件绑定函数
			const bindEvent = eventObject => {
				const { eventName, target, callBack } = eventObject

				switch (eventName) {
					case 'click':
						eventObject.handler = e => clickHandler(e, callBack)
						break
					case 'dblclick':
						eventObject.handler = e => dblclickHandler(e, callBack)
						break
					case 'contextmenu':
						eventObject.handler = e => contextmenuHandler(e, callBack)
						break
					default:
						break
				}
				target.addEventListener(eventName, eventObject.handler)
			}

			// 未绑定过事件
			if (!this.overlayMarkerEvents.has(element)) {
				this.overlayMarkerEvents.set(element, [eventObject]) //保存监听事件并执行
				bindEvent(eventObject) //绑定事件
			} else {
				//绑定过事件
				const currentEventArray = this.overlayMarkerEvents.get(element)
				const currentEventObject = currentEventArray.find(e => e.eventName === eventName)
				// 未绑定过此事件
				if (!currentEventObject) {
					currentEventArray.push(eventObject)
					bindEvent(eventObject)
				} else {
					//绑定过此事件，移除之前事件绑定再覆盖
					element.removeEventListener(eventName, currentEventObject.handler)
					this.overlayMarkerEvents.set(element, [eventObject]) //保存监听事件并执行
					bindEvent(eventObject) //绑定事件
				}
			}
		}
		//事件移除
		this.off = eventName => {
			const element = this.getElement()
			if (this.overlayMarkerEvents.has(element)) {
				const currentEventArray = this.overlayMarkerEvents.get(element)
				const currentEventObject = currentEventArray.find(e => e.eventName === eventName)
				element.removeEventListener(eventName, currentEventObject.handler)
				const newEventArray = currentEventArray.filter(e => e.eventName !== eventName)
				this.overlayMarkerEvents.set(element, newEventArray)
			}
			// console.log(this.overlayMarkerEvents, element)
		}

		// 置顶-待完善
		this.setTop = function () {
			// return this.getGeometry().getCoordinates()
			const element = this.getElement()
			let zIndex = element.style.zIndex
			// element
			element.style.zIndex = ++zIndex
		}
		/**
		 * 获取html dom结构
		 * @returns
		 */
		this.getElement = function () {
			return this.options.overlayMarker.getElement()
		}
		/**
		 * 设置 content / html
		 */
		this.setElement = function (content = '') {
			this.options.content = content // 目前无效
			const id = this.options.id
			this.options.overlayMarker.setElement(createOverlayMarkerElement(content, id))
		}
		/**
		 * 获取 content str
		 * @returns
		 */
		this.getContent = function () {
			return this.options.content
		}
	}

	// 初始化添加map
	if (map && map.JCTYPE === 'MAP') {
		map.addMarker(this)
	}
}

export default JCMarker
