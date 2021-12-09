import * as turf from '@turf/turf'
import { getVectorContext } from 'ol/render'
class TrackAnimation {
	constructor(data) {
		const { vectorLayer, type, eventName, marker, speed, path, lineFeature, circlable } = data
		//初始化 - 动画相关参数配置
		this.status = 'init' // 动画的状态
		this.startPos = null //  动画本次的起点
		this.endPos = null // 动画上次的停止点
		this.distance = 0 // 本次动画进度
		this.lastTime = null // 动画上次执行时间
		this.position = null // 运动矢量图形对象
		this.isArrived = false // 是否到达终点
		this.moveFeature = null // 动画效果函数
		// 初始传入
		this.type = type //  marker对应的监听事件名
		this.vectorLayer = vectorLayer // 图层
		this.marker = marker // 执行的动画的marker
		this.eventName = eventName //  marker对应的动画事件名
		this.speed = speed // 行驶速度
		this.path = path // 执行路径
		this.lineGeometry = lineFeature.getGeometry() // 线条矢量图形对象
		this.circlable = circlable // 是否循环播放

		this.moveCallBack = null //  marker 对应的动画监听回调

		this.proportion = null // 更新进度

		this.iconAngle = this.marker.originOptions.angle
		this.startAngle = 0 //  动画本次的起点
		this.endAngle = 0 // 动画上次的停止点
		this.alreadyAngle = 0 // 本次回调累积角度变化
		this.passedPath = [] // 驶过路径
	}

	//初始化 - 动画对象- 动画准备就绪
	initMove() {
		const isExitMarkerMoveCallBack = this.vectorLayer.animationEvents.has(this.eventName)

		if (isExitMarkerMoveCallBack) {
			const animationEvent = this.vectorLayer.animationEvents.get(this.eventName)
			this.updateMoveCallBack(animationEvent.moveCallBack)
		}

		// 设置当前动画上次执行时间
		this.lastTime = Date.now()
		// 设置上次动画的停止点
		this.endPos = this.path[0]
		//  动画本次的起点角度
		this.entAngle = this.iconAngle

		this.passedPath.push(this.endPos)
		// 设置动画效果的执行函数
		this.moveFeature = event => this.moveAnimate(event, this.vectorLayer)
		// 移除动画执行函数
		this.vectorLayer.un('postrender', this.moveFeature)
	}

	//开始 - 重新执行动画
	startMove() {
		console.log(this.marker)
		this.isArrived = false
		// 设置当前动画状态
		this.status = 'moving'
		// this.lastTime = Date.now()
		// 克隆当前 maker的矢量图形
		this.position = this.marker.getGeometry().clone()
		// 执行动画监听
		this.vectorLayer.on('postrender', this.moveFeature)
		// 隐藏小车前一刻位置同时触发事件
		this.marker.setGeometry(null)
	}

	//停止 - 停止执行动画
	stopMove() {
		// 设置当前动画状态
		this.status = 'stopMove'
		// 将小车固定在当前位置
		this.marker.setGeometry(this.position)
		// 移除动画监听
		this.vectorLayer.un('postrender', this.moveFeature)
	}

	//继续 - 继续执行动画
	resumeMove() {
		if (this.isArrived) return false
		this.lastTime = Date.now()
		this.startMove()
	}

	// 更新速度
	updateSpeed(speed) {
		this.speed = speed
	}

	// 更新进度
	updateDistance(distance) {
		this.proportion = distance
		this.status = 'moving'
	}
	// 动画回调
	updateMoveCallBack(moveCallBack) {
		this.moveCallBack = moveCallBack
	}

	// 到达终点回调
	onArrived() {
		this.isArrived = true
		this.stopMove()
	}
	//获取当前进度
	getDistance() {
		return this.distance
	}
	// 动画监听
	onMoveAnimate(angle) {
		// console.log(this.distance);
		const inLineGeometry = this.lineGeometry.intersectsCoordinate(this.endPos)

		if (this.alreadyAngle > 0 && inLineGeometry) {
			this.alreadyAngle = 0
			this.passedPath.push(this.endPos)
		}

		this.startAngle = this.endAngle //  动画本次的起点角度

		this.endAngle = angle // 动画上次的停止点角度

		this.alreadyAngle += parseInt(Math.abs(Math.abs(this.endAngle) - Math.abs(this.startAngle)).toFixed(2))

		if (this.moveCallBack) {
			this.marker.olTarget.dispatchEvent({
				progress: this.distance, // 行驶进度 - 无法精确到每处
				type: this.eventName,
				// passedPath: this.passedPath,
				callBack: this.moveCallBack,
				eventName: this.type // 实际派发的事件
			})
		}
	}
	//执行动画函数
	moveAnimate(event) {
		// 获取当前渲染帧状态时刻
		const time = event.frameState.time
		// 渲染时刻减去开始播放轨迹的时间
		const elapsedTime = time - this.lastTime
		const speed = Number(this.speed)
		// console.log((speed * elapsedTime) / 1e6 + this.distance);
		// 求得距离比
		this.distance = (this.distance + (speed * elapsedTime) / 1e6) % 2

		if (!!this.proportion || this.proportion == 0) {
			this.distance = this.proportion
			this.proportion = null
		}
		// 刷新上一时刻
		this.lastTime = time

		// console.log((speed * elapsedTime) / 1e6);
		if (!this.circlable) {
			if (this.distance >= 1) {
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
		if (this.startPos[0] !== this.endPos[0] || this.startPos[1] !== this.endPos[1]) {
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
				return this.onArrived()
			}
		}
		// 用来触发Map监听postcompose事件，直到监听事件结束。
		this.vectorLayer.map.render()
	}
}

export default TrackAnimation
