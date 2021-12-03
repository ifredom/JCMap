// import { fromLonLat } from 'ol/proj'

import { Fill, Icon, Stroke, Style, Text } from 'ol/style'
import { Marker, OlPoint, OverlayMarker } from './inherit'

const defaultOptions = {
	// 坐标系
	id: null, //id
	position: [0, 0], // 坐标经纬度
	content: '', // overlayMarker 内容
	offset: [0, 0], //偏移量
	zIndex: 2, // 层级
	extData: {}, //自定义信息
	projection: 'EPSG:4326',
	overlayMarker:{
		zIndex:9
	},
	// 默认 marker icon 样式
	src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHrSURBVEjHrdW9a1NxFMbxT9qmNWmaRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIoggFCko4lJEEaq296aNtvk5JIG2NGmSOjzbuV9+9zzPOUcIwUbCvg7uYGtD9RsVdDCSJh7iT5ofONEyFLkeJvcw/5EQCE8JvRTSjKG9KSiOdvMtz0KxAqzqK+E4cZZ3GNgQikQXV7PET9bAVmqZMMbfNPM4UxOK/iwvB5mfqQNcqTeEHcQ93EVqFRRDaWZHKS41CKzqN2GYQoYv2BtCoJNrvRRe1PnwPeFGpZ+1am5TSrGQ5CJc2E1UqlH8nJCuKFN5WS3wIIUko5DIMjVOab3CEUIbASFLeFwD+Kgct09or/b0cI54rsWXRoQ+Yhxb5X4PDy9TbKWnlyj28mC9SO1MEX9u0v0P5b+YQ9+64e/i+iniZqBHiJLk603Ulm6+P2sQeI9Slmm01Z19DO8iWmog9LmyOYcaWihZ3t5kuR40z2KWiWa21P4eCj/rTFjFnG1N7dMME3kW1wJLhANE7ZxvZUlvTxFNr4GOl82ZQqKlc9LJlZNEVeBseVRjHGz5RiGZYWayAj3HQoZbmz58OD1A9JqQ4hdym4ZWIvaqn8UEZ//Lia5GrJP79cxZqX+cR1gC9S9TwAAAAABJRU5ErkJggg=='
}

// 默认 marker  样式
const getDefaultStyle = () => ({
	//icon style
	img: defaultOptions.src,
	rotateWithView: true,
	rotation: 0,
	//text style
	font: 'normal 12px sans-serif',
	label: '',
	fontSize: '12px',
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	fontColor: '#000',
	placement: 'point', // 默认为point
	labelBgColor: '#fff',
	borderColor: '#000', // 边框颜色
	borderWidth: '1', // 边框宽度
	textBaseline: 'bottom', // t  似乎无效
	textAlign: 'centrer', //文本对齐方式 ,似乎无效，设置会让文本消失
	labelXOffset: 0, // 水平文本偏移量
	labelYOffset: -30, // 垂直文本偏移量
	padding: [5, 5, 5, 5]
})

// marker Icon 样式处理
function createSingleIconStyle(style) {
	const sIconStyle = {
		crossOrigin: 'anonymous', // 图片跨域允许
		anchor: [0.5, 0.5], // 原点位置
		anchorOrigin: 'top-left', // 原点位置偏移方向
		anchorXUnits: 'fraction', // 基于原点位置百分比
		anchorYUnits: 'fraction', // 基于原点位置像素
		offset: [0, 0], // 偏移量设置，相对于原点
		scale: 1, // 图标缩放比例
		opacity: 1, // 透明度
		src: style.img,
		// img: style.img, // 图标的url
		rotateWithView: style.rotateWithView, // 是否旋转
		rotation: (Math.PI / 180) * style.rotation // 旋转角度
	}
	return sIconStyle
}

// marker Text样式处理
function createSingleTextStyle(style) {
	// console.log(style)
	return {
		placement: style.placement, // 默认为point
		text: style.label,
		offsetX: style.labelXOffset,
		offsetY: style.labelYOffset,
		fill: new Fill({
			// 字体颜色
			color: style.fontColor
		}),
		font: style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, // 字体样式
		backgroundFill: new Fill({
			// 背景颜色
			color: style.labelBgColor
		}),
		backgroundStroke: new Stroke({
			// 边框样式
			color: style.borderColor,
			width: style.borderWidth,
			lineCap: 'square', // 线帽风格  butt, round, 或者 square 默认 round
			lineJoin: 'bevel', // 线连接方式 bevel, round, 或者 miter 默认 round
			lineDash: [], // 线间隔模式 这个变化与分辨率有关 默认为undefined Internet Explorer 10和更低版本不支持
			lineDashOffset: 0, // 线段间隔偏移 默认0
			miterLimit: 10 // 默认10
		})
		// padding: style.padding,
		// textBaseline: style.textBaseline, // 似乎无效
		// textAlign: style.textAlign, //文本对齐方式,似乎无效，设置会让文本消失
	}
}

// 处理 Marker 参数
function setMarkerOptions(options) {
	const {
		projection,
		position, //位置
		content, // overlayMarker 内容
		offset, //偏移量
		extData //自定义信息
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
function createMarkerStyle(style) {
	const defaultStyle = getDefaultStyle()
	// console.log(defaultStyle)

	const iconStyle = createSingleIconStyle({
		img: style.img || defaultStyle.img,
		rotateWithView: style.rotateWithView || defaultStyle.rotateWithView,
		rotation: style.rotation || defaultStyle.rotation
	})

	const textStyle = createSingleTextStyle({
		label: style.label || defaultStyle.label,
		font: style.font || defaultStyle.font,
		fontSize: style.fontSize || defaultStyle.fontSize,
		fontFamily: style.fontFamily || defaultStyle.fontFamily,
		fontWeight: style.fontWeight || defaultStyle.fontWeight,
		fontColor: style.fontColor || defaultStyle.fontColor,
		labelXOffset: style.labelXOffset || defaultStyle.labelXOffset,
		labelYOffset: style.labelYOffset || defaultStyle.labelYOffset,
		labelBgColor: style.labelBgColor || defaultStyle.labelBgColor,
		borderColor: style.borderColor || defaultStyle.borderColor,
		borderWidth: style.borderWidth || defaultStyle.borderWidth,
		padding: style.padding || defaultStyle.padding,
		placement: style.placement || defaultStyle.placement,
		textBaseline: style.textBaseline || defaultStyle.textBaseline,
		textAlign: style.textAlign || defaultStyle.textAlign
	})

	// console.log(iconStyle)
	// console.log(textStyle)
	const newStyle = new Style({
		image: new Icon(iconStyle),
		text: new Text(textStyle),
		zIndex: style.zIndex || defaultOptions.zIndex
	})

	return newStyle
}

// 创建 OverlayMarker Element
function createOverlayMarkerElement(content, id) {
	const container = document.createElement('div')
	container.innerHTML = content
	container.style.zIndex = defaultOptions.overlayMarker.zIndex
	container.setAttribute('id', `jcmap-marker-${id}`)
	return container
}

// 创建 OverlayMarker
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

//创建 Marker 并设置id style  overlayMarker 等属性
function createMarker(options, type) {
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
		marker.setStyle(createMarkerStyle(marker.get('style') || {}))
	} else {
		const overlayMarker = createOverlayMarker(options)
		options.overlayMarker = overlayMarker
		marker.set('overlayMarker', overlayMarker)
	}

	return marker
}

function JCMarker({ map, ...options }) {
	const assignOptions = Object.assign({}, defaultOptions, { ...options })

	const markerOptions = setMarkerOptions(assignOptions)

	this.JCTYPE = !!markerOptions.content ? 'OVERLAYMARKER' : 'MARKER'

	this.olTarget = createMarker(markerOptions, this.JCTYPE)

	this.options = markerOptions

	this.map = map

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

	// 获取 overlayMarker
	this.getOverlayMarker = function () {
		return this.olTarget.get('overlayMarker')
	}

	// 删除 overlayMarker
	this.removeOverlayMarker = function () {
		this.options.overlayMarker = null
		this.olTarget.set('overlayMarker', null)
	}

	if (this.JCTYPE === 'MARKER') {
		//矢量marker
		const events = ['singleclick', 'click', 'dblclick', 'contextmenu'] // 支持的事件
		this.JCEvents = new Map() // 存储事件
		//事件监听
		this.on = (eventName, callBack = () => {}) => {
			if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
			if (!events.includes(eventName)) return console.warn('无效的事件：' + eventName)
			const eventObject = {
				eventName: 'JCMarker(' + eventName + ')' + this.getId(),
				callBack,
				handler: e => {
					e.callBack({
						type: e.eventName,
						target: this,
						event: e.event
					})
				}
			}

			// 未绑定过事件
			if (!this.JCEvents.has(eventObject.eventName)) {
				//监听事件 - JCMap 处理成 cliclk
				this.olTarget.on(eventObject.eventName, eventObject.handler)

				//储存事件
				this.JCEvents.set(eventObject.eventName, eventObject)
			} else {
				const currentEventObject = this.JCEvents.get(eventObject.eventName)

				// 移除事件
				this.olTarget.un(currentEventObject.eventName, currentEventObject.handler)

				// 重新设置监听事件
				this.olTarget.on(currentEventObject.eventName, eventObject.handler)

				//储存新事件
				this.JCEvents.set(currentEventObject.eventName, eventObject)
			}
			this.olTarget.set('JCEvents', this.JCEvents)
		}

		//事件移除
		this.off = (eventName, callBack = () => {}) => {

			eventName = 'JCMarker(' + eventName + ')' + this.getId()

      if (this.JCEvents.has(eventName)) {
        // 获取事件对象
        const currentEventObject = this.JCEvents.get(eventName)
        
        // 移除事件
        this.olTarget.un(currentEventObject.eventName, currentEventObject.handler)

        // 删除事件存储
        this.JCEvents.delete(eventName)
        
        this.olTarget.set('JCEvents', this.JCEvents)
        callBack()
      }

		}

		// 设置自定义信息
		this.setExtentData = function (extData) {
			this.options.extData = extData
			this.olTarget.set('extData', extData)
		}

		// 设置 Marker 坐标
		this.setPosition = function (position) {
			if (!position) return
			this.options.position = position
			this.olTarget.set('position', position)
			this.olTarget.getGeometry().setCoordinates(position)
		}

		// 设置自定义信息
		this.setId = function (id) {
			if (!id) return
			this.options.id = id
			this.olTarget.setId(id)
			this.olTarget.set('id', id)
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
		this.setStyle = function (style = {}) {
			this.olTarget.setStyle(createMarkerStyle(style))
		}
	} else {
		//dom overlayMarker
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

			const clickHandler = (eventName,e, callBack) => {
				clickTimeId && clearTimeout(clickTimeId)
				clickTimeId = setTimeout(() => {
           callBack({
						type: eventName,
						target:this,
						event: e
					})
				}, 200)
			}

			const dblclickHandler = (eventName,e,   callBack) => {
				clickTimeId && clearTimeout(clickTimeId)
        callBack({
          type: eventName,
          target:this,
          event: e
        })
			}

			const contextmenuHandler = (eventName,e,  callBack) => {
        callBack({
          type: eventName,
          target:this,
          event: e
        })
			}

			//事件绑定函数
			const bindEvent = eventObject => {
				const { eventName, target, callBack } = eventObject

				switch (eventName) {
					case 'click':
						eventObject.handler = e => clickHandler(eventName,e,  callBack)
						break
					case 'dblclick':
						eventObject.handler = e => dblclickHandler(eventName,e,  callBack)
						break
					case 'contextmenu':
						eventObject.handler = e => contextmenuHandler(eventName,e,   callBack)
						break
					default:
						break
				}
				target.addEventListener(eventName, eventObject.handler)
			}

			// 未绑定过事件
			if (!this.overlayMarkerEvents.has(eventObject.target)) {
				this.overlayMarkerEvents.set(eventObject.target, [eventObject]) //保存监听事件并执行
				bindEvent(eventObject) //绑定事件
			} else {
				//绑定过事件
				const currentEventArray = this.overlayMarkerEvents.get(eventObject.target)
				const currentEventObject = currentEventArray.find(e => e.eventName === eventName)
				// 未绑定过此事件
				if (!currentEventObject) {
					currentEventArray.push(eventObject)
					bindEvent(eventObject)
				} else {
					//绑定过此事件，移除之前事件绑定再覆盖
					eventObject.target.removeEventListener(eventName, currentEventObject.handler)
					this.overlayMarkerEvents.set(eventObject.target, [eventObject]) //保存监听事件并执行
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
		}

		// 置顶-待完善
		this.setTop = function () {
			// const element = this.getElement()
			// let zIndex = element.style.zIndex
			// element.style.zIndex = ++zIndex
			// if(this.zIndex < JCMarker.zIndex){
			// 	this.zIndex = ++JCMarker.zIndexs
			// }
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

		// 设置 Marker 坐标
		this.setPosition = function (position) {
			if (!position) return
			this.options.position = position
			this.olTarget.set('position', position)
			this.olTarget.setPosition('position', position)
		}
	}

	// 初始化添加map
	if (this.map && this.map.JCTYPE === 'MAP') {

		this.map.addMarker(this)

		this.map.overlayMarkerStyle = defaultOptions.overlayMarker.zIndex

	}
}

export default JCMarker
