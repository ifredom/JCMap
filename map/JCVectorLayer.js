
import { getUid } from 'ol/util'
import { Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import TrackAnimation from './TrackAnimation'

//支持的事件
const events = ['moveAlong', 'pauseMove']

class JCVectorLayer {
	constructor({ map, className = 'ol-layer', features = [] }) {
		this.JCTYPE = 'VECTORLAYER'

		this.map = map

		// 默认的矢量图层
		this.olTarget = createVectorLayer(className, features)
 
		this.id = getUid(this.olTarget)

		// 存储事件
		this.JCEvents = new Map()

		this.animationEvents = new Map()
		
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

		this.getId = ()=>this.id
		
		//添加 moving 事件监听
		this.addeventlistener('moving')

		this.map.addLayer(vectorLayer)
	}

	//添加事件监听
	addeventlistener(type) {
		if (type === 'moving') {
			this.on(type, e => {
				const { type, eventName, moveCallBack, path, speed, lineFeature, marker, status, updateSpeed,updateDistance, circlable } = e
				// 是否存在 当前marker 动画
				const isExitMarkerMove = this.JCEvents.has(eventName)
				const moveStatusHandler = {
					startMove:()=>{
						//当前marker 已经存在动画
						if (isExitMarkerMove) {
							// 获取动画对象
							const animationObject = this.JCEvents.get(eventName)
							// 已经停止时
							if (animationObject.status !== 'stopMove' && !animationObject.isArrived) {
								// 不需要再次触发停止-否则不会从新开始
								animationObject.stopMove()
							}
							//删除之前的动画
							this.JCEvents.delete(eventName)
						}
	
						//初始化完整动画对象
						const animationObject = new TrackAnimation({ vectorLayer:this, type, eventName, marker, speed, path, lineFeature, circlable })
						// 保存当前动画
						this.JCEvents.set(eventName, animationObject)
				
						//初始化动画
						animationObject.initMove()
						//开始动画效果
						animationObject.startMove()
					},
					pauseMove:()=>{
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							if (animationObject.status === 'stopMove') return
							animationObject.stopMove()
						}
					},
					resumeMove:()=>{
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							if (animationObject.status === 'moving') return
							animationObject.resumeMove()
						}
					},
					stopMove:()=>{
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							animationObject.stopMove()
							this.JCEvents.delete(eventName)
						}
					},
					updateSpeed:()=>{
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							animationObject.updateSpeed(Number(updateSpeed))
						}
					},
					updateDistance:()=>{
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							animationObject.updateDistance(Number(updateDistance))
						} 
					},
					moveCallBack:()=>{
						this.animationEvents.set(eventName,{moveCallBack})
						if (isExitMarkerMove) {
							const animationObject = this.JCEvents.get(eventName)
							animationObject.updateMoveCallBack(moveCallBack)
						}
					}
				}
				moveStatusHandler[status]()
			})
		}
	}
}

//创建矢量标注图层
function createVectorLayer(className, features) {
	//矢量标注的数据源
	const vectorSource = new VectorSource({
		features
	})
	//矢量标注图层
	const vectorLayer = new VectorLayer({
		className,
		source: vectorSource,
		zIndex: 1,
	})

	return vectorLayer
}

 

export default JCVectorLayer
