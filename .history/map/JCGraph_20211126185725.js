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
 function JCGraph(map, options = {}) {
  this.map = map
  this.status = false // 是否完成绘制 状态
  this.draw = null // 绘制矢量图对象
  this.featureData = null // 矢量图时特征数据
  this.source = null // 数据源
  this.vector = null // 准备放在图层上的数据元素
  const commonStyle = option => {
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
  const calculateCenter = geometry => {
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
  const graphTool = {
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
  const events = ['click', 'dblclick', 'contextmenu', 'done'] // 支持的事件
  let clickTimeId = null //单击事件定时器
  /**
   * 事件触发
   * @param {*} eventName 
   * @param {*} callBack 
   * @returns 
   */
  this.on = (eventName, callBack) => {
		if (!eventName || typeof eventName !== 'string') throw new Error('JCMap 图形类警告: 请传入正确的事件名~')
		if (!events.includes(eventName)) return console.warn('JCMap 图形类警告: 无效的事件：' + eventName)
    // 绘制/编辑 完成
    if (eventName === 'done') {

    } else {
			map.on(eventName, e => {
				clickTimeId && clearTimeout(clickTimeId)
				clickTimeId = setTimeout(() => {
					if (map.hasFeatureAtPixel(e.pixel)) {
            const typeName = target.getFeaturesAtPixel(e.pixel)[0].getGeometry().getType()
						// const olMarker = map.forEachFeatureAtPixel(e.pixel, olMarker => olMarker)
						if (olMarker) {
							olMarker.dispatchEvent({
								type: eventName,
								event: e
							})
						} else {
						}
					} else {
						callBack && callBack(e)
					}
				}, 200)
			})
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
  this.Circle = function (center, radius, option = {}, extData = {}) {
    // 进行坐标系转换 转4326坐标系
    const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
    const finalRadius = this.formatMetersToRadius(radius)
    this.featureData = null
    const tmp = new Circle(finalPath, finalRadius)
    tmp.set('extData', extData)
    const circle = new Feature(tmp)
    circle.setStyle(commonStyle(option))
    graphTool.Circle.style = commonStyle(option)
    this.source.addFeature(circle)
    return circle
  }
  /**
   * 多边形
   */
  this.Polygon = function (path, option = {}, extData = {}) {
    this.featureData = null
    const finalPath = []
    // 进行坐标系转换 转4326坐标系
    for (let i = 0; i < path.length; i++) {
      const tmpPoint = fromLonLat([path[i][0], path[i][1]], 'EPSG:4326')
      finalPath.push(tmpPoint)
    }
    const tmp = new Polygon([finalPath])
    tmp.set('extData', extData)
    const polygon = new Feature(tmp)
    polygon.setStyle(commonStyle(option))
    graphTool.Polygon.style = commonStyle(option)
    this.source.addFeature(polygon)
    return polygon
  }
  /**
   * 矩形
   */
  this.Rectangle = function (path, option = {}, extData = {}) {
    this.featureData = null
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
    const rectangle = new Feature({
      geometry: tmp
    })
    rectangle.setStyle(commonStyle(option))
    graphTool.Rectangle.style = commonStyle(option)
    this.source.addFeature(rectangle)
    return rectangle
  }
  /**
   * 编辑矢量图形
   */
  this.editPaint = () => {
    this.status = false
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
              const result = calculateCenter(modifyGeometry.geometry0)
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
                if (typeName !== 'Circle') {
                  const tmp = modifyGeometry.geometry0.getCoordinates()[0]
                  // 只有 非矩形 才能旋转
                  if (!(typeName === 'Polygon' && compareArray(tmp[0], tmp[tmp.length - 1]))) {
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
      this.fetureGeo(e.features.item(0))
      this.status = true
    })
  }
  /**
   * 初始化矢量图形
   */
  this.initGraph = function () {
    this.source = new VectorSource({ wrapX: false })
    this.vector = new VectorLayer({
      className: 'VectorLayer',
      // 数据源
      source: this.source,
      // 样式
      style: function (feature) {
        console.log(feature, 'feature')
        const styles = [commonStyle(options)]
        const modifyGeometry = feature.get('modifyGeometry')
        const geometry = modifyGeometry ? modifyGeometry.geometry : feature.getGeometry()
        const result = calculateCenter(geometry)
        const center = result.center
        if (center) {
          styles.push(
            new Style({
              geometry: new Point(center),
              image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                  color: '#ff3333'
                })
              })
            })
          )
          const coordinates = result.coordinates
          if (coordinates) {
            const minRadius = result.minRadius
            const sqDistances = result.sqDistances
            const rsq = minRadius * minRadius
            const points = coordinates.filter(function (coordinate, index) {
              return sqDistances[index] > rsq
            })
            styles.push(
              new Style({
                geometry: new MultiPoint(points),
                image: new CircleStyle({
                  radius: 4,
                  fill: new Fill({
                    color: '#33cc33'
                  })
                })
              })
            )
          }
        }
        return styles
      }
    })
    this.map.addLayer(this.vector) // 添加到图层上
  }

  /**
   * 清除图层上的数据源（矢量图形）
   * @param {*} e
   */
  this.clearVector = function () {
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
    const geo = e.getGeometry()
    const type = geo.getType()
    if (type === 'Circle') {
      const center = geo.getCenter()
      const radius = geo.getRadius()
      this.featureData = Object.assign(
        {},
        {
          center: center,
          radius: this.formatRadiusToMeters(geo),
          type: type
        }
      )
    } else if (type === 'Polygon') {
      const points = geo.getCoordinates()
      console.log(points, 'points')
      this.featureData = Object.assign(
        {},
        {
          points: points.flat(1),
          type: type
        }
      )
    }
  }
  /**
   * 获取绘制矢量图形几何特征属性
   * @param {*}
   */
  this.getFeture = function (e = '') {
    if (e) {
      if (!this.featureData) {
        this.fetureGeo(e)
      }
    }
    return this.featureData
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
    }
    if (handle[type]) handle[type]()
    this.map.removeGraph(this.draw)
  }
  /**
   * 开始绘制
   */
  this.beginPaint = function (type) {
    this.status = false // 状态初始化
    this.featureData = null // 矢量图特征清空初始化
    // this.initGraph()
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
        if (graphTool.Circle.style) {
          this.vector.setStyle(graphTool.Circle.style)
        }
        break
      case 'Polygon':
        if (graphTool.Polygon.style) {
          this.vector.setStyle(graphTool.Polygon.style)
        }
        penValue = 'Polygon'
        break
      case 'Rectangle':
        if (graphTool.Rectangle.style) {
          this.vector.setStyle(graphTool.Rectangle.style)
        }
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
      this.fetureGeo(e.feature)
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

export default JCGraph
