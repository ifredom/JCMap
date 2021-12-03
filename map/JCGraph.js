import 'ol/ol.css'

import {  Vector as VectorLayer } from 'ol/layer'
import { Circle as CircleStyle, Fill, Stroke, Style, RegularShape } from 'ol/style'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import Polygon, { fromExtent } from 'ol/geom/Polygon' //
import Circle from 'ol/geom/Circle' // 圆形
import Point from 'ol/geom/Point'
import { MultiPoint } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
import {  getCenter, getHeight, getWidth } from 'ol/extent'
import { Translate } from 'ol/interaction'
import { transform, fromLonLat } from 'ol/proj'
import { getDistance } from 'ol/sphere'
import Modify from 'ol/interaction/Modify'
import { never, platformModifierKeyOnly, primaryAction } from 'ol/events/condition'
import {  OlFeature } from './inherit'

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
    this.olTarget = null // 绘制对象
    this.source = null // 数据源
    this.vector = null // 准备放在图层上的数据元素
    this.drawFeature = null
    this.events = ['done', 'click', 'dblclick', 'contextmenu'] // 支持的事件
    this.clickTimeId = null //单击事件定时器
    this.JCEvents = new Map() // 存储事件
    this.initGraph(options)
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
          break
        case 'Line':
          break
        // 默认不写参数 即为圆形
        case 'Circle':
          if (this.graphTool.Circle.style) {
            this.vector.setStyle(this.graphTool.Circle.style)
          }
          break
        case 'Polygon':
          if (this.graphTool.Polygon.style) {
            this.vector.setStyle(this.graphTool.Polygon.style)
          }
          penValue = 'Polygon'
          break
        case 'Rectangle':
          if (this.graphTool.Rectangle.style) {
            this.vector.setStyle(this.graphTool.Rectangle.style)
          }
          geometryFunction = this.paintRectangle()
          break
        case 'Square':
          geometryFunction = this.paintSquare()
          break
      }
      this.olTarget = new Draw({
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
      this.map.addGraph(this.olTarget)
      this.olTarget.setActive(true)
      this.olTarget.addEventListener('drawend', e => {
        this.olTarget.setActive(false)
		    this.stopPaint()
        let targets = this.JCEvents.get('JCGraph(done)')
        this.drawFeature = this.buildFeature(e.feature)
        //getCoordinates()
        window.dispatchEvent(targets.costomEvent)
      })
    }
   }
  /**
  * 对数据进行修改筛选，不将原生数据返回给用户
  */
  buildFeature (e) {
    const geo = e.getGeometry()
    let data = {}
    const type = this.judgeShape(geo)
    if (type === 'Circle') {
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
   * 激活矢量图绘制
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
    this.olTarget.setActive(false)
  }
  /**
   * 圆形
   */
  Circle (center, radius, option = {}, extData = {}) {
    // 进行坐标系转换 转4326坐标系
    const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
    const finalRadius = this.formatMetersToRadius(radius)
    const tmp = new Circle(finalPath, finalRadius)
    tmp.set('extData', extData)
    this.olTarget = new OlFeature(tmp)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Circle.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this.olTarget
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
    tmp.set('extData', extData)
    this.olTarget = new OlFeature(tmp)
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Polygon.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this.olTarget
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
    tmp.set('extData', extData)
    this.olTarget = new OlFeature({
      geometry: tmp
    })
    if (extData.id) {
      this.olTarget.setId(extData.id)
    } else {
      this.olTarget.setId(this.olTarget.ol_uid)
    }
    this.olTarget.setStyle(this.commonStyle(option))
    this.graphTool.Rectangle.style = this.commonStyle(option)
    this.source.addFeature(this.olTarget)
    return this.olTarget
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
    }
    return type
  }
  /**
   * 编辑矢量图形
   */
  editPaint () {
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
              const result = this.calculateCenter(modifyGeometry.geometry0)
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
                    let shapeName = this.judgeShape(modifyGeometry.geometry0)
										if (shapeName !== 'Rectangle') {
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
    })
  }
  /**
   * 初始化矢量图形
   */
  initGraph (options) {
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
    if (this.olTarget) {
      this.map.removeGraph(this.olTarget)
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
    return this.olTarget && this.olTarget.getId()
  }
  // 事件注册
  on (eventName, callBack = () => {}) {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
      if (!this.events.includes(eventName)) return console.warn('无效的事件：' + eventName)

      const eventObject = {
				eventName: eventName !== 'done' ? 'JCGraph(' + eventName + ')' + this.getId() : 'JCGraph(' + eventName + ')',
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
			this.olTarget.set('JCEvents', this.JCEvents)    
  }
  //事件移除
  off (eventName, callBack = () => {}) {
    eventName =  eventName !== 'done' ? 'JCGraph(' + eventName + ')' + this.getId() : 'JCGraph(' + eventName + ')'

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
}

export default JCGraph
