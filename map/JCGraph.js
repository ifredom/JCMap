import 'ol/ol.css'

import {  Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style, RegularShape } from 'ol/style'
import { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import Polygon, { fromExtent } from 'ol/geom/Polygon' // 多边形
import Circle from 'ol/geom/Circle' // 圆形
import Point from 'ol/geom/Point' // 点
import LineString from 'ol/geom/LineString'; // 线
import { MultiPoint } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
import {  getCenter, getHeight, getWidth } from 'ol/extent'
import { Translate } from 'ol/interaction'
import { transform, fromLonLat } from 'ol/proj'
import { getDistance } from 'ol/sphere'
import Modify from 'ol/interaction/Modify'
import { always, never, platformModifierKeyOnly, primaryAction } from 'ol/events/condition'
import { OlFeature, OlDraw } from './inherit'

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
 class JCGraph {
   constructor (map, options = {}) {
    this.map = map
    this.JCTYPE = 'GRAPH'
    this.olTarget = null // 被动绘制对象
    this.drawTarget = null // 主动绘制对象
    this.source = null // 数据源
    this.vector = null // 准备放在图层上的数据元素
    this.drawFeature = null
    this.events = ['done', 'modifyend', 'click', 'dblclick', 'contextmenu'] // 支持的事件
    this.specialEvents = ['done', 'modifyend'] // 特殊事件
    this.clickTimeId = null //单击事件定时器
    this.JCEvents = new Map() // 存储事件
    this.commonStyle = option => {
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
            color: option.imageFill || '#264df6'
          })
        })
      })
    }
    /**
     * 计算矢量图形中心点相关参数
     * @param {*} geometry
     * @returns
     */
    this.calculateCenter = geometry => {
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
    this.graphTool = {
      // 绘制工具列表
      Point: {
        status: false,
        style: null
      },
      Line: {
        status: false,
        style: null
      },
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
    // <------    类方法分界线    ------->
    /**
     * epsg 4326 坐标下 地图距离转换成 米
     * @param {*} Circle
     * @returns
     */
    this.formatRadiusToMeters = function (Circle) {
      let radius
      const flag = true
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
     * 开始绘制
     */
    this.beginPaint = function (type) {
      let geometryFunction // 更新几何坐标时调用的函数。
      let penValue = 'Circle' // 笔尖类型 默认为Circle
      switch (type) {
        // 点和线 目前暂未开发
        case 'Point':
          penValue = 'Point'
          break
        case 'Line':
          penValue = 'LineString'
          break
        // 默认不写参数 即为圆形
        case 'Circle':
          break
        case 'Polygon':
          penValue = 'Polygon'
          break
        case 'Rectangle':
          geometryFunction = this.paintRectangle()
          break
        case 'Square':
          geometryFunction = this.paintSquare()
          break
      }
      if (this.graphTool[type].style) {
        this.vector.setStyle(this.graphTool[type].style)
      }
      let freehandFlag = false
      switch (type) {
        case 'Polygon':
        case 'Line':
          freehandFlag = false
          break
        default: 
          freehandFlag = true
          break
      }
      this.drawTarget = new OlDraw({
        // 数据源
        source: this.source,
        // 绘制类型
        type: penValue,
        geometryFunction: geometryFunction,
        freehand: freehandFlag, // 手绘模式
        stopClick: true,
        // 最大点数
        // maxPoints: maxPoints
      })
      // 将draw对象添加到map中，然后就可以进行图形绘制了
      this.map.addGraph(this.drawTarget)
      this.drawTarget.setActive(true)
      this.drawTarget.addEventListener('drawstart', e => {
        document.oncontextmenu = () => {
          this.drawTarget && this.drawTarget.finishDrawing()
        }
      })
      this.drawTarget.addEventListener('drawend', e => {
        // 将当前绘制的矢量图形 通过done事件触发抛出去
        let targets = this.JCEvents.get('JCGraph(done)')
        this.drawFeature = this.buildFeature(e.feature)
        e.feature.set('JCTYPE', 'OlDraw')
        window.dispatchEvent(targets.costomEvent)
      })
    }

    this.initGraph(options) // 初始化矢量图层样式
   }
  /**
  * 对数据进行修改筛选，不将原生数据返回给用户
  */
  buildFeature (e) {
    const geo = e.getGeometry()
    let data = {}
    const type = this.judgeShape(geo)
    if (type === 'Point') {
      const points = geo.getCoordinates()
      data = {
        center: points
      }
    } else if (type === 'Line') {
      const points = geo.getCoordinates()
      data = {
        points: points
      }
    } else if (type === 'Circle') {
      const center = geo.getCenter()
      const radius = geo.getRadius()
      data = {
        center: center,
        radius: this.formatRadiusToMeters(geo),
      }
    } else if (type === 'Polygon') {
      const points = geo.getCoordinates().flat(1)
      data = {
        points: points.slice(0, -1)
      }
    } else if (type === 'Rectangle') {
      const points = geo.getCoordinates().flat(1)
      let obj = {
        slng: points[0][0],
        slat: points[0][1],
        nlng: points[2][0],
        nlat: points[2][1]
      }
      data = {
        points: obj
      }
    }
    return {
      target: e,
      type: type,
      data: data
    }
  }
  /**
   * 激活矢量图绘制deactivate
   * @param {*} graphName
   */
  activate (graphName) {
    if (this.graphTool[graphName]) {
      this.beginPaint(graphName) // 开始绘图
    } else {
      console.warn(`JCMap vectorGraph has not ${graphName}, please you sure and try again~`)
    }
  }
  /**
   * 失活矢量图绘制
   */
  deactivate () {
    if (this.drawTarget) {
      this.drawTarget.setActive(false)
      this.drawTarget = null
    }
    this.stopPaint()
  }
  /**
   * 点
   */
  Point (center, option = {}, extData = {}) {
    let centerPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
    const tmp = new Point(centerPath)
    this.olTarget = new OlFeature(tmp)
    this.olTarget.set('extData', extData)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Point.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this
  }
  /**
   * 线
   */
  Line (path, option = {}, extData = {}) {
    const finalPath = []
    // 进行坐标系转换 转4326坐标系
    for (let i = 0; i < path.length; i++) {
      const tmpPoint = fromLonLat([path[i][0], path[i][1]], 'EPSG:4326')
      finalPath.push(tmpPoint)
    }
    const tmp = new LineString(finalPath)
    this.olTarget = new OlFeature({
      geometry: tmp
    })
    this.olTarget.set('extData', extData)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Line.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this
  }
  /**
   * 圆形
   */
  Circle (center, radius, option = {}, extData = {}) {
    // 进行坐标系转换 转4326坐标系
    const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
    const finalRadius = this.formatMetersToRadius(radius)
    const tmp = new Circle(finalPath, finalRadius)
    this.olTarget = new OlFeature(tmp)
    this.olTarget.set('extData', extData)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Circle.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this
  }
  /**
   * 多边形
   */
  Polygon (path, option = {}, extData = {}) {
    const finalPath = []
    // 进行坐标系转换 转4326坐标系
    for (let i = 0; i < path.length; i++) {
      const tmpPoint = fromLonLat([path[i][0], path[i][1]], 'EPSG:4326')
      finalPath.push(tmpPoint)
    }
    const tmp = new Polygon([finalPath])
    this.olTarget = new OlFeature(tmp)
    this.olTarget.set('extData', extData)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Polygon.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this
  }
  /**
   * 矩形
   */
  Rectangle (path, option = {}, extData = {}) {
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
    this.olTarget = new OlFeature({
      geometry: tmp
    })
    this.olTarget.set('extData', extData)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Rectangle.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this
  }
  /**
   * 获取 自定义数据
   */
  getExtData () {
    if (!this.olTarget) {
      console.warn('矢量图形未初始化喔~')
    } else {
      return this.olTarget.get('extData')
    }
  }
  /**
   * 判断矢量图形形状
   * e 等同于 feature.getGeometry()
   */
  judgeShape (e) {
    let type = e.getType()
    if (type === 'Polygon') {
      let arr = e.getCoordinates().flat()
      if (arr.length === 5) {
        const rect = arr.slice(0, 4)
        if ((rect[0][0] === rect[1][0] && rect[0][1] === rect[3][1]) || (rect[0][1] === rect[1][1] && rect[0][0] === rect[3][0])) {
          type = 'Rectangle'
        }
      }
    } else if (type === 'LineString') {
      type = 'Line'
    }
    return type
  }
  /**
   * 编辑矢量图形
   */
  editPaint () {
    const defaultStyle = new Modify({ source: this.source }).getOverlay().getStyleFunction()
    let _this = this
    const modify = new Modify({
      source: this.source,
      condition: function (event) {
        return primaryAction(event) && !platformModifierKeyOnly(event)
      },
      deleteCondition: never,
      insertVertexCondition: always,
      style: function (feature) {
        let type = _this.judgeShape(feature.get('geometries')[0])
        if (type !== 'Line'){
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
                const result = _this.calculateCenter(modifyGeometry.geometry0)
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
                  if (typeName === 'Polygon') {
                    let shapeName = _this.judgeShape(modifyGeometry.geometry0)
                    if (shapeName !== 'Rectangle') {
                      geometry.rotate(currentAngle - initialAngle, center)
                    }
                  } else if (typeName === 'Circle') {
                    geometry.translate(dx, dy)
                  } else if (typeName === 'Point') {
                    geometry.translate(dx, dy)
                  }
                  modifyGeometry.geometry = geometry
                }
              }
            }
        })
      }
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
      let _this = this
      e.features.forEach(function (feature) {
        let shape = _this.judgeShape(feature.getGeometry())
        if (shape === 'Line' || shape === 'Polygon' || shape === 'Circle') {
          // 当类型为线、多边形（矩形除外）、圆形时，允许新增点
        } else {
          // 克隆图形，不能新增点
          feature.set('modifyGeometry', { geometry: feature.getGeometry().clone() }, true)
        }
      })
    })

    modify.on('modifyend', e => {
      let _this = this
      e.features.forEach(function (feature) {
        const modifyGeometry = feature.get('modifyGeometry')
        if (modifyGeometry) {
          feature.setGeometry(modifyGeometry.geometry)
          feature.unset('modifyGeometry', true)
        }
        let targets = _this.JCEvents.get('JCGraph(modifyend)')
        _this.drawFeature = _this.buildFeature(feature)
        feature.set('JCTYPE', 'OlDraw')
        window.dispatchEvent(targets.costomEvent)
      })
    })
  }
  /**
   * 初始化矢量图形
   */
  initGraph (options) {
    // 取到map类已实例化的矢量图层
    if (this.map.getVectorLayer()) {
      this.vector = this.map.getVectorLayer()
      this.source = this.vector.getSource()
      const style = this.commonStyle(options)
      this.vector.setStyle(style)
    } else {
      this.source = new VectorSource({ wrapX: false })
      this.vector = new VectorLayer({
        className: 'VectorLayer',
        // 数据源
        source: this.source,
        // 样式
        style: (feature) => {
          const styles = this.commonStyle(options)
          return styles
        }
      })
      this.map.addLayer(this.vector) // 添加到图层上
    }
  }

  /**
   * 清除图层上的数据源（矢量图形）
   * @param {*} e
   */
  clearVector () {
    if (!this.source) {
      console.warn('VectorSource Class warn: source is null!')
      return
    }
    this.source.clear()
  }
  /**
   * 停止绘制
   */
  stopPaint (e) {
    if (this.drawTarget) {
      this.map.removeGraph(this.drawTarget)
    }
  }
  
  /**
   * 绘制矩形
   */
  paintRectangle () {
    return createBox()
  }
  /**
   * 绘制正方形
   * @param {*} params
   */
  paintSquare () {
    return createRegularPolygon(4)
  }
  /**
   * 获取Id
   */
  getId () {
    return this.olTarget ? (this.olTarget.getId() || this.olTarget.ol_uid) : ''
  }
  
  // 事件注册
  on (eventName, callBack = () => {}) {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
      if (!this.events.includes(eventName)) return console.warn('无效的事件：' + eventName)
      const eventObject = {
				eventName: !this.specialEvents.includes(eventName) ? 'JCGraph(' + eventName + ')' + this.getId() : 'JCGraph(' + eventName + ')',
				callBack,
				handler: e => {
					e.callBack({
						type: e.eventName,
						target: e.target,
						event: e.event
					})
				}
			}
			// 未绑定过事件
			if (!this.JCEvents.has(eventObject.eventName)) {
        if (eventObject.eventName === 'JCGraph(' + eventName + ')') {
          let eve = document.createEvent('HTMLEvents')
          eve.initEvent(eventName, false, true)
          eve.callBack = callBack
          eventObject.costomEvent = eve
          window.addEventListener(eventName, e => e.callBack && e.callBack(this.drawFeature))
        } else {
          //监听事件 - JCMap 处理成 cliclk
				  this.olTarget.on(eventObject.eventName, eventObject.handler)
        }
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
      this.olTarget && this.olTarget.set('JCEvents', this.JCEvents) 
  }
  //事件移除
  off (eventName, callBack = () => {}) {
    eventName =  !this.specialEvents.includes(eventName) ? 'JCGraph(' + eventName + ')' + this.getId() : 'JCGraph(' + eventName + ')'

      if (this.JCEvents.has(eventName)) {
        // 获取事件对象
        const currentEventObject = this.JCEvents.get(eventName)
        
        // 移除事件
        this.olTarget.un(currentEventObject.eventName, currentEventObject.handler)

        // 删除事件存储
        this.JCEvents.delete(eventName)
        
        this.olTarget && this.olTarget.set('JCEvents', this.JCEvents)
        callBack()
      }
  }
}

export default JCGraph
