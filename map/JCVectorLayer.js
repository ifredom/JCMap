import * as turf from '@turf/turf'
import { Vector as VectorLayer } from 'ol/layer'
import { getVectorContext } from 'ol/render'
import VectorSource from 'ol/source/Vector'
//支持的事件
const events = ['moveAlong', 'pauseMove']

//创建矢量标注图层
function createVectorLayer(className, features) {
	//矢量标注的数据源
	const vectorSource = new VectorSource({
		features
	})
	//矢量标注图层
	const vectorLayer = new VectorLayer({
		source: vectorSource,
		className,
		zIndex: 1
	})

	return vectorLayer
}

class TrackAnimation {
	constructor(data) {
		const { eventName, marker, speed, path, lineFeature, circlable } = data
		//初始化 - 动画相关参数配置
		this.status = 'init' // 动画的状态
		this.startPos = null //  动画本次的起点
		this.endPos = null // 动画上次的停止点
		this.distance = 0
		this.lastTime = null // 动画上次执行时间
		this.position = null // 运动矢量图形对象
		this.isArrived = false // 是否到达终点
		this.moveFeature = null // 动画效果函数

		this.moveCallBack = null //  marker 对应的动画监听回调
		this.circlable = false // 是否循环播放
		this.eventName = eventName //  marker对应的动画事件名
		this.marker = marker // 执行的动画的marker
		this.speed = speed // 行驶速度
		this.path = path // 执行路径
		this.lineGeometry = lineFeature.getGeometry() // 线条矢量图形对象
		this.updateDistance = 0
		this.progress = 0 //当前进度

		this.iconAngle = -90
		this.startAngle = 0 //  动画本次的起点
		this.endAngle = 0 // 动画上次的停止点
		this.alreadyAngle = 0
		this.passedPath = [] // 驶过路径

	}

	//初始化 - 动画对象- 动画准备就绪
	initMove(vectorLayer) {
		// 设置当前动画上次执行时间
		this.lastTime = Date.now()
		// 设置上次动画的停止点
		this.endPos = this.path[0]
 
		this.entAngle = this.iconAngle //  动画本次的起点
	
		this.passedPath.push(this.endPos)
		// 设置动画效果的执行函数
		this.moveFeature = event => this.moveAnimate(event, vectorLayer)
		// 移除动画执行函数
		vectorLayer.un('postrender', this.moveFeature)
	}

	//开始 - 重新执行动画
	startMove(vectorLayer) {
		// 设置当前动画状态
		this.status = 'moving'
		// this.lastTime = Date.now()
		// 克隆当前 maker的矢量图形
		this.position = this.marker.getGeometry().clone()
		// 执行动画监听
		vectorLayer.on('postrender', this.moveFeature)
		// 隐藏小车前一刻位置同时触发事件
		this.marker.setGeometry(null)
	}

	//停止 - 停止执行动画
	stopMove(vectorLayer) {
		// 设置当前动画状态
		this.status = 'stopMove'
		// 将小车固定在当前位置
		this.marker.setGeometry(this.position)
		// 移除动画监听
		vectorLayer.un('postrender', this.moveFeature)
	}

	//继续 - 继续执行动画
	resumeMove(vectorLayer) {
		if (this.isArrived) return false
		this.lastTime = Date.now()
		this.startMove(vectorLayer)
	}

	// 更新速度
	updateSpeed(speed) {
		this.speed = speed
	}

	// 更新进度
	updateDistance(distance) {
		this.updateDistance = updateDistance
	}
	// 到达终点回调
	onArrived(vectorLayer) {
		// this.timer && clearTimeout(this.timer)
		// this.position.setCoordinates(this.path[this.path.length - 1])
		this.isArrived = true
		console.log('onArrived---')
		this.stopMove(vectorLayer)
	}
	// 动画监听
	onMoveAnimate(angle) {
		const progress = parseInt(this.distance.toFixed(2)*100)
		const inLineGeometry = 	this.lineGeometry.intersectsCoordinate(this.endPos)
		if(this.alreadyAngle>0 && inLineGeometry ){
			this.alreadyAngle = 0
			this.passedPath.push(this.endPos)
			console.log(this.passedPath);
		}
		
		//去除相同的进度
		if(this.progress !== progress){

	
		
			this.startAngle = this.endAngle //  动画本次的起点角度
		
			this.endAngle = angle // 动画上次的停止点角度


			this.alreadyAngle += parseInt(Math.abs(Math.abs(this.endAngle) - Math.abs(this.startAngle)).toFixed(2))

			this.progress = progress
			
			if (this.moveCallBack) {
				this.marker.olTarget.dispatchEvent({
					progress, // 行驶进度 - 无法精确到每处
					type: this.eventName,
					passedPath: this.passedPath,
					callBack: this.moveCallBack
					// eventName: type // 实际派发的事件
				})
			}
		}
	}
	//执行动画函数
	moveAnimate(event, vectorLayer) {
		// 获取当前渲染帧状态时刻
		const time = event.frameState.time
		// 渲染时刻减去开始播放轨迹的时间
		const elapsedTime = time - this.lastTime
		const speed = Number(this.speed)
		// 求得距离比
		this.distance = (this.distance + (speed * elapsedTime) / 1e6) % 2
		// 刷新上一时刻
		this.lastTime = time

		// console.log((speed * elapsedTime) / 1e6);
		// 不是循环播放，限制 超出距离
		if(!this.circlable){
			if(this.distance>=1){
				this.distance = 1
			}
		}
		// 反减可实现反向运动，获取坐标点
		const currentCoordinate = this.lineGeometry.getCoordinateAt(this.distance > 1 ? 2 - this.distance : this.distance)

		this.startPos = this.endPos
		this.endPos = currentCoordinate

		let point1 = turf.point(this.startPos)
		let point2 = turf.point(this.endPos)
		let bearing = turf.bearing(point1, point2)
		
		// 去除停止继续后,startPos，endPos 坐标相同,导致角度为0，闪烁的问题
		if (this.startPos[0] !== this.endPos[0] || this.startPos[1] !== this.endPos[1] ) {
			// 此时为 动画执行过程中 坐标不同,  
			this.marker.setAngle(bearing + this.iconAngle)
			this.marker.setPosition(this.endPos)
		} 
 
		this.position.setCoordinates(this.endPos)
		// 获取渲染图层的画布
		const vectorContext = getVectorContext(event)
		vectorContext.setStyle(this.marker.getOlStyle())
		vectorContext.drawGeometry(this.position)

		// console.log(marker.olTarget.getStyle())

		// 动画监听
		this.onMoveAnimate(bearing - 90)

		//是否循环
		if (!this.circlable) {
			// 是否到达终点
			if (this.distance >= 1) {
				return this.onArrived(vectorLayer)
			}
		}
		// 用来触发Map监听postcompose事件，直到监听事件结束。
		vectorLayer.map.render()


	}
}

class JCVectorLayer {
	constructor({ map, className = 'ol-layer', features = [] }) {
		this.JCTYPE = 'VECTORLAYER'

		this.map = map

		// 默认的矢量图层
		this.olTarget = createVectorLayer(className, features)

		// 存储事件
		this.JCEvents = new Map()

		this.moveConfigs = new Map()

		// 初始化
		this.init()
	}

	init() {
		const vectorLayer = this.olTarget

		this.getSource = vectorLayer.getSource.bind(vectorLayer)
		this.getZIndex = vectorLayer.getZIndex.bind(vectorLayer)
		this.getVisible = vectorLayer.getVisible.bind(vectorLayer)
		this.setSource = vectorLayer.setSource.bind(vectorLayer)
		this.setZIndex = vectorLayer.setZIndex.bind(vectorLayer)
		this.setVisible = vectorLayer.setVisible.bind(vectorLayer)
		this.setStyle = vectorLayer.setStyle.bind(vectorLayer)
		this.dispatchEvent = vectorLayer.dispatchEvent.bind(vectorLayer)
		this.on = vectorLayer.on.bind(vectorLayer)
		this.un = vectorLayer.un.bind(vectorLayer)

		this.addFeature = feature => this.getSource().addFeature(feature)
		this.addFeatures = features => this.getSource().addFeatures(features)
		this.removeFeature = feature => this.getSource().removeFeature(feature)
		this.hasFeature = feature => this.getSource().hasFeature(feature)
		this.getFeatures = () => this.getSource().getFeatures()
		this.getFeatureById = id => this.getSource().getFeatureById(id)
		this.getFeaturesAtCoordinate = coordinate => this.getSource().getFeaturesAtCoordinate(coordinate)
		this.forEachFeature = callBack => this.getSource().forEachFeature(feature => callBack(feature))

		//添加 moving 事件监听
		this.addeventlistener('moving')

		this.map.addLayer(vectorLayer)
	}

	//添加事件监听
	addeventlistener(type) {
		if (type === 'moving') {
			this.on(type, e => {
				const { eventName, moveCallBack, path, speed, lineFeature, marker, status, updateSpeed,updateDistance, circlable } = e
				// 是否存在 当前marker 动画
				const isExitMarkerMove = this.JCEvents.has(eventName)
				if (status === 'startMove') {
					//  const moveConfig = this.moveConfigs.get(eventName)
					console.log('startMove---1')
					//当前marker 已经存在动画
					if (isExitMarkerMove) {
						// 获取动画对象
						const animationObject = this.JCEvents.get(eventName)
						// 已经停止时
						if (animationObject.status !== 'stopMove' && !animationObject.isArrived) {
							// 不需要再次触发停止-否则不会从新开始
							animationObject.stopMove(this)
						}
						//删除之前的动画
						this.JCEvents.delete(eventName)
					}

					//初始化完整动画对象
					const animationObject = new TrackAnimation({ eventName, marker, speed, path, lineFeature, circlable })
					// 保存当前动画
					this.JCEvents.set(eventName, animationObject)
					//初始化动画
					animationObject.initMove(this)
					//开始动画效果
					animationObject.startMove(this)
				} else if (status === 'pauseMove') {
					console.log('pauseMove---2')
					if (isExitMarkerMove) {
						const animationObject = this.JCEvents.get(eventName)
						if (animationObject.status === 'stopMove') return
						animationObject.stopMove(this)
					}
				} else if (status === 'resumeMove') {
					if (isExitMarkerMove) {
						const animationObject = this.JCEvents.get(eventName)
						if (animationObject.status === 'moving') return
						animationObject.resumeMove(this)
					}
				} else if (status === 'stopMove') {
					console.log('stopMove---4')
					if (isExitMarkerMove) {
						const animationObject = this.JCEvents.get(eventName)
						animationObject.stopMove(this)
						this.JCEvents.delete(eventName)
					}
				} else if (status === 'updateSpeed') {
					console.log('updateSpeed------')
					if (isExitMarkerMove) {
						const animationObject = this.JCEvents.get(eventName)
						animationObject.updateSpeed(Number(updateSpeed))
					}
				}else if (status === 'updateDistance') {
					console.log('updateDistance------')
					if (isExitMarkerMove) {
						const animationObject = this.JCEvents.get(eventName)
						animationObject.updateDistance(Number(updateDistance))
					}
				}
				
				else if (status === 'moveCallBack') {
					const moveConfig = {
						eventName,
						moveCallBack
					}
					this.moveConfigs.set(eventName, moveConfig)
					// animationObject.moveCallBack = moveCallBack
				}
			})
		}
	}
}

export default JCVectorLayer
