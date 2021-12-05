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
    features,
  })
  //矢量标注图层
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    className,
    zIndex: 1,
  })

  return vectorLayer
}

class JCVectorLayer {
  constructor({ map, className = 'ol-layer', features = [] }) {
    this.JCTYPE = 'VECTORLAYER'

    this.map = map

    // 默认的矢量图层
    this.olTarget = createVectorLayer(className, features)
    // 存储事件
    this.JCEvents = new Map()
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

    this.addFeature = (feature) => this.getSource().addFeature(feature)
    this.addFeatures = (features) => this.getSource().addFeatures(features)
    this.removeFeature = (feature) => this.getSource().removeFeature(feature)
    this.hasFeature = (feature) => this.getSource().hasFeature(feature)
    this.getFeatures = () => this.getSource().getFeatures()
    this.getFeatureById = (id) => this.getSource().getFeatureById(id)
    this.getFeaturesAtCoordinate = (coordinate) => this.getSource().getFeaturesAtCoordinate(coordinate)
    this.forEachFeature = (callBack) => this.getSource().forEachFeature((feature) => callBack(feature))

    //添加 moving 事件监听
    this.addeventlistener('moving')

    this.map.addLayer(vectorLayer)
  }

  //添加事件监听
  addeventlistener(type) {
    if (type === 'moving') {
      let movingCallBack = () => {}
      this.on(type, (e) => {
        const { eventName, callBack, path, speed, lineFeature, marker, status, updateSpeed, circlable } = e
        movingCallBack = callBack ? callBack : movingCallBack

        if (status === 'startMove') {
          console.log('startMove---1')

          //初始化 - 行驶
          const initEventObject = (callBack, eventName, marker, speed, path, lineFeature) => {
            return {
              status: 'init',
              callBack,
              eventName,
              marker,
              speed,
              path,
              startPos: null,
              endPos: null,
              distance: 0,
              lastTime: null,
              line: lineFeature.getGeometry(), // 线条矢量图形对象
              position: null, // 运动矢量图形对象
              isArrived: false,
              moveFeature: null,
            }
          }

          const initMove = function (vectorLayer, eventObject) {
            eventObject.lastTime = Date.now()

            eventObject.endPos = path[0]

            eventObject.moveFeature = (event) => {
              const time = event.frameState.time
              const elapsedTime = time - eventObject.lastTime
              const speed = Number(eventObject.speed)
              eventObject.distance = (eventObject.distance + (speed * elapsedTime) / 1e6) % 2

              eventObject.lastTime = time

              const currentCoordinate = eventObject.line.getCoordinateAt(eventObject.distance > 1 ? 2 - eventObject.distance : eventObject.distance)

              if (!circlable) {
                if (eventObject.distance >= 1) {
                  // eventObject.timer && clearTimeout(eventObject.timer)
                  // eventObject.passedPath.push(path[path.length - 1])
                  eventObject.position.setCoordinates(eventObject.path[eventObject.path.length - 1])
                  eventObject.marker.setGeometry(eventObject.position)
                  // eventObject.marker.olTarget.dispatchEvent({
                  //   type: eventObject.eventName,
                  //   passedPath: eventObject.passedPath,
                  //   callBack: currentEventObject.callBack,
                  //   eventName: eventObject.type, // 实际派发的事件
                  //   eventTarget: eventObject.marker.olTarget, // 实际应该接收事件ol 对象
                  // })
                  vectorLayer.un('postrender', eventObject.moveFeature)
                  eventObject.isArrived = true
                  console.log(eventObject.distance)
                }
                return
              }

              eventObject.marker.olTarget.dispatchEvent({
                type: eventObject.eventName,
                // passedPath: eventObject.passedPath,
                callBack: eventObject.callBack,
                eventName: type, // 实际派发的事件
              })
              eventObject.startPos = eventObject.endPos

              eventObject.endPos = currentCoordinate

              let point1 = turf.point(eventObject.startPos)
              let point2 = turf.point(eventObject.endPos)
              let bearing = turf.bearing(point1, point2)

              eventObject.marker.setAngle(bearing - 90)
              eventObject.marker.setPosition(eventObject.endPos)

              eventObject.position.setCoordinates(eventObject.endPos)

              const vectorContext = getVectorContext(event)
              vectorContext.setStyle(eventObject.marker.getOlStyle())
              vectorContext.drawGeometry(eventObject.position)

              // console.log(marker.olTarget.getStyle())
              // 请求地图在下一帧渲染

              vectorLayer.map.render()
            }

            vectorLayer.un('postrender', eventObject.moveFeature)
          }

          const startMove = (vectorLayer, eventObject) => {
            eventObject.status = 'moving'
            // eventObject.lastTime = Date.now()
            eventObject.position = eventObject.marker.getGeometry().clone()
            vectorLayer.on('postrender', eventObject.moveFeature)
            eventObject.marker.setGeometry(null)
          }

          const stopMove = (vectorLayer, eventObject) => {
            eventObject.status = 'stopMove'
            eventObject.marker.setGeometry(eventObject.position)
            vectorLayer.un('postrender', eventObject.moveFeature)
          }

          const pauseMove = (vectorLayer, eventObject) => {
            eventObject.status = 'stopMove'
            eventObject.marker.setGeometry(eventObject.position)
            vectorLayer.un('postrender', eventObject.moveFeature)
          }

          const resumeMove = (vectorLayer, eventObject) => {
            eventObject.status = 'moving'
            eventObject.lastTime = Date.now()
            eventObject.position = eventObject.marker.getGeometry().clone()
            vectorLayer.on('postrender', eventObject.moveFeature)
            eventObject.marker.setGeometry(null)
          }

          //初始化动画状态
          const animationObject = {
            eventObject: initEventObject(movingCallBack, eventName, marker, speed, path, lineFeature),
            initMove,
            startMove,
            pauseMove,
            stopMove,
            resumeMove,
          }
          if (this.JCEvents.has(eventName)) {
            const animationObject = this.JCEvents.get(eventName)
            if (animationObject.eventObject.status !== 'stopMove' && !animationObject.eventObject.isArrived) {
              // 停止时刻 - 不需要再触发停止-否则不会从新开始
              animationObject.pauseMove(this, animationObject.eventObject)
            }
            this.JCEvents.delete(eventName)
          }
          this.JCEvents.set(eventName, animationObject)
          animationObject.initMove(this, animationObject.eventObject)
          animationObject.startMove(this, animationObject.eventObject)
        } else if (status === 'pauseMove') {
          console.log('pauseMove---2')
          if (this.JCEvents.has(eventName)) {
            const animationObject = this.JCEvents.get(eventName)
            if (animationObject.eventObject.status === 'stopMove') return
            animationObject.pauseMove(this, animationObject.eventObject)
          }
        } else if (status === 'resumeMove') {
          if (this.JCEvents.has(eventName)) {
            const animationObject = this.JCEvents.get(eventName)
            if (animationObject.eventObject.status === 'moving') return
            animationObject.resumeMove(this, animationObject.eventObject)
          }
        } else if (status === 'stopMove') {
          console.log('stopMove---4')
          if (this.JCEvents.has(eventName)) {
            const animationObject = this.JCEvents.get(eventName)
            animationObject.pauseMove(this, animationObject.eventObject)
            this.JCEvents.delete(eventName)
          }
        } else if (status === 'updateSpeed') {
          console.log('updateSpeed------')
          if (this.JCEvents.has(eventName)) {
            const animationObject = this.JCEvents.get(eventName)
            animationObject.eventObject.speed = updateSpeed
          }
        } else if (status === 'listener') {
          console.log('movingCallBack')
        }
      })
    }
  }
}

export default JCVectorLayer
