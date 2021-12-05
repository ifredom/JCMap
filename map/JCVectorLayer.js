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

  // vectorLayer.movingObject = {
  //   startPos: null,
  //   endPos: null,
  //   distance: 0,
  //   lastTime: null,
  //   line: null,
  //   speed: 0,
  //   position: null,
  //   path: [],
  //   isArrived: false,
  //   moveFeature: null,
  // }

  // vectorLayer.on('moveAlong', (e) => {
  //   const { path, speed, marker, map } = e
  //   vectorLayer.movingObject.lastTime = Date.now()
  //   vectorLayer.movingObject.path = path
  //   vectorLayer.movingObject.line = new OlLineString(path)
  //   vectorLayer.movingObject.endPos = path[0]
  //   vectorLayer.movingObject.position = marker.olTarget.getGeometry().clone()

  //   vectorLayer.movingObject.speed = speed
  //   vectorLayer.movingObject.moveFeature = (event) => {
  //     const time = event.frameState.time
  //     const elapsedTime = time - vectorLayer.movingObject.lastTime
  //     vectorLayer.movingObject.speed = Number(vectorLayer.movingObject.speed)
  //     vectorLayer.movingObject.distance = (vectorLayer.movingObject.distance + (vectorLayer.movingObject.speed * elapsedTime) / 1e6) % 2

  //     vectorLayer.movingObject.lastTime = time

  //     const currentCoordinate = vectorLayer.movingObject.line.getCoordinateAt(
  //       vectorLayer.movingObject.distance > 1 ? 2 - vectorLayer.movingObject.distance : vectorLayer.movingObject.distance
  //     )

  //     if (vectorLayer.movingObject.distance >= 1) {
  //       // moveFeatureObject.timer && clearTimeout(moveFeatureObject.timer)
  //       // moveFeatureObject.passedPath.push(path[path.length - 1])
  //       vectorLayer.movingObject.position.setCoordinates(vectorLayer.movingObject.path[vectorLayer.movingObject.path.length - 1])
  //       marker.olTarget.setGeometry(vectorLayer.movingObject.position)
  //       // moveFeatureObject.marker.olTarget.dispatchEvent({
  //       //   type: moveFeatureObject.eventName,
  //       //   passedPath: moveFeatureObject.passedPath,
  //       //   callBack: currentEventObject.callBack,
  //       //   eventName: moveFeatureObject.type, // 实际派发的事件
  //       //   eventTarget: moveFeatureObject.marker.olTarget, // 实际应该接收事件ol 对象
  //       // })
  //       vectorLayer.un('postrender', vectorLayer.movingObject.moveFeature)
  //       vectorLayer.movingObject.isArrived = true
  //       return
  //     }

  //     vectorLayer.movingObject.startPos = vectorLayer.movingObject.endPos

  //     vectorLayer.movingObject.endPos = currentCoordinate

  //     let point1 = turf.point(vectorLayer.movingObject.startPos)
  //     let point2 = turf.point(vectorLayer.movingObject.endPos)
  //     let bearing = turf.bearing(point1, point2)

  //     marker.setAngle(bearing - 90)
  //     marker.setPosition(vectorLayer.movingObject.endPos)

  //     vectorLayer.movingObject.position.setCoordinates(vectorLayer.movingObject.endPos)

  //     const vectorContext = getVectorContext(event)
  //     vectorContext.setStyle(marker.olTarget.getStyle())
  //     vectorContext.drawGeometry(vectorLayer.movingObject.position)

  //     // console.log(marker.olTarget.getStyle())
  //     // 请求地图在下一帧渲染

  //     map.render()
  //   }
  //   if (vectorLayer.movingObject.isArrived) return
  //   vectorLayer.on('postrender', vectorLayer.movingObject.moveFeature)
  //   marker.olTarget.setGeometry(null)
  // })

  // vectorLayer.on('pauseMove', (e) => {
  //   const { marker } = e

  //   marker.olTarget.setGeometry(vectorLayer.movingObject.position)
  //   // console.log('pauseMove----', marker.olTarget.getStyle())

  //   vectorLayer.un('postrender', vectorLayer.movingObject.moveFeature)
  // })

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

    this.addeventlistener('moveAlong')
    this.addeventlistener('pauseMove')
    this.addeventlistener('resumeMove')
    this.addeventlistener('updateMoveSpeed')
    this.map.addLayer(vectorLayer)
  }

  //添加事件监听
  addeventlistener(type) {
    if (type === 'moveAlong') {
      const eventObject = {
        startPos: null,
        endPos: null,
        distance: 0,
        lastTime: null,
        line: null,
        speed: 0,
        position: null,
        path: [],
        isArrived: false,
        moveFeature: null,
      }

      const moveFeatureCallBack = (e) => {
        const { type, eventName, path, speed, marker, lineFeature } = e

        eventObject.lastTime = Date.now()
        eventObject.path = path
        eventObject.line = lineFeature.getGeometry()
        eventObject.endPos = path[0]
        eventObject.position = marker.getGeometry().clone()
        eventObject.speed = speed
        console.log(lineFeature)

        eventObject.moveFeature = (event) => {
          const time = event.frameState.time
          const elapsedTime = time - eventObject.lastTime
          eventObject.speed = Number(eventObject.speed)
          eventObject.distance = (eventObject.distance + (eventObject.speed * elapsedTime) / 1e6) % 2

          eventObject.lastTime = time

          const currentCoordinate = eventObject.line.getCoordinateAt(eventObject.distance > 1 ? 2 - eventObject.distance : eventObject.distance)

          if (eventObject.distance >= 1) {
            // moveFeatureObject.timer && clearTimeout(moveFeatureObject.timer)
            // moveFeatureObject.passedPath.push(path[path.length - 1])
            eventObject.position.setCoordinates(eventObject.path[eventObject.path.length - 1])
            marker.setGeometry(eventObject.position)
            // moveFeatureObject.marker.olTarget.dispatchEvent({
            //   type: moveFeatureObject.eventName,
            //   passedPath: moveFeatureObject.passedPath,
            //   callBack: currentEventObject.callBack,
            //   eventName: moveFeatureObject.type, // 实际派发的事件
            //   eventTarget: moveFeatureObject.marker.olTarget, // 实际应该接收事件ol 对象
            // })
            this.un('postrender', eventObject.moveFeature)
            eventObject.isArrived = true
            return
          }

          eventObject.startPos = eventObject.endPos

          eventObject.endPos = currentCoordinate

          let point1 = turf.point(eventObject.startPos)
          let point2 = turf.point(eventObject.endPos)
          let bearing = turf.bearing(point1, point2)

          marker.setAngle(bearing - 90)
          marker.setPosition(eventObject.endPos)

          eventObject.position.setCoordinates(eventObject.endPos)

          const vectorContext = getVectorContext(event)
          vectorContext.setStyle(marker.getOlStyle())
          vectorContext.drawGeometry(eventObject.position)

          // console.log(marker.olTarget.getStyle())
          // 请求地图在下一帧渲染

          this.map.render()
        }

        if (eventObject.isArrived) return
        if (!this.JCEvents.has(eventName)) {
          this.on('postrender', eventObject.moveFeature)
          this.JCEvents.set(eventName, {
            eventObject,
            moveFeatureCallBack,
          })
        } else {
          const { eventObject } = this.JCEvents.get(eventName)
          this.on('postrender', eventObject.moveFeature)
        }
        marker.setGeometry(null)
      }

      // 监听事件
      this.on(type, moveFeatureCallBack)
    } else if (type === 'pauseMove') {
      this.on(type, (e) => {
        const { eventName, marker } = e
        console.log('pauseMove----', eventName, this.JCEvents)
        if (this.JCEvents.has(eventName)) {
          const { eventObject } = this.JCEvents.get(eventName)

          marker.setGeometry(eventObject.position)

          this.un('postrender', eventObject.moveFeature)
        }
      })
    } else if (type === 'resumeMove') {
      this.on(type, (e) => {
        const { eventName, marker } = e
        console.log('resumeMove----', eventName, this.JCEvents)
        if (this.JCEvents.has(eventName)) {
          const { eventObject } = this.JCEvents.get(eventName)

          this.on('postrender', eventObject.moveFeature)

          marker.setGeometry(null)
        }
      })
    } else if (type === 'updateMoveSpeed') {
      this.on(type, (e) => {
        const { eventName, speed } = e
        if (this.JCEvents.has(eventName)) {
          const { eventObject } = this.JCEvents.get(eventName)
          eventObject.speed = speed
        }
      })
    }
  }
}

export default JCVectorLayer
