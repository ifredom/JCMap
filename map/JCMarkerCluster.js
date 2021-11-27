import { boundingExtent } from 'ol/extent'
import { fromExtent } from 'ol/geom/Polygon'
import { Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Fill, Icon, Style, Text } from 'ol/style'
import img0 from '../assets/image/map/m0.png'
import img1 from '../assets/image/map/m1.png'
import img2 from '../assets/image/map/m2.png'
import img3 from '../assets/image/map/m3.png'
import { OlCluster, OlFeature } from './inherit'

const defaultClusterOptions = {
  distance: 40, // 要素将聚集在一起的距离（以像素为单位）
  minDistance: 30, //  簇之间的最小距离（以像素为单位）
  showViewExtent: true, // 只展示可视区域 Marker
  isClusterFitView: true, // 是否点击展开 Cluster
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHrSURBVEjHrdW9a1NxFMbxT9qmNWmaRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIoggFCko4lJEEaq296aNtvk5JIG2NGmSOjzbuV9+9zzPOUcIwUbCvg7uYGtD9RsVdDCSJh7iT5ofONEyFLkeJvcw/5EQCE8JvRTSjKG9KSiOdvMtz0KxAqzqK+E4cZZ3GNgQikQXV7PET9bAVmqZMMbfNPM4UxOK/iwvB5mfqQNcqTeEHcQ93EVqFRRDaWZHKS41CKzqN2GYQoYv2BtCoJNrvRRe1PnwPeFGpZ+1am5TSrGQ5CJc2E1UqlH8nJCuKFN5WS3wIIUko5DIMjVOab3CEUIbASFLeFwD+Kgct09or/b0cI54rsWXRoQ+Yhxb5X4PDy9TbKWnlyj28mC9SO1MEX9u0v0P5b+YQ9+64e/i+iniZqBHiJLk603Ulm6+P2sQeI9Slmm01Z19DO8iWmog9LmyOYcaWihZ3t5kuR40z2KWiWa21P4eCj/rTFjFnG1N7dMME3kW1wJLhANE7ZxvZUlvTxFNr4GOl82ZQqKlc9LJlZNEVeBseVRjHGz5RiGZYWayAj3HQoZbmz58OD1A9JqQ4hdym4ZWIvaqn8UEZ//Lia5GrJP79cxZqX+cR1gC9S9TwAAAAABJRU5ErkJggg==', // 默认 marker icon 图标
}

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
    color: '#000',
  }),
})

// 设置聚合要素样式
function createClusterStyle(styleCache, assignOptions, feature, resolution) {
  const size = feature.get('features').length // 获取该要素所在聚合群的要素数量
  let style = styleCache[size]

  if (!style) {
    const labelStyle = defaultLabelStyle()
    const iconStyle = {
      src: assignOptions.icon,
    }
    labelStyle.text = size.toString()

    if (size == 1) {
      // 处理 overlayMarker 和 正常 Marker
      const marker = feature.get('features')[0]
      return !marker.get('overlayMarker') ? marker.getStyle() : null
    } else if (size < 11) {
      iconStyle.src = img0
    } else if (size < 101) {
      iconStyle.src = img1
    } else if (size < 1001) {
      iconStyle.src = img2
    } else {
      iconStyle.src = img3
    }

    style = [
      new Style({
        image: new Icon(iconStyle),
        text: new Text(labelStyle),
        zIndex: 1, // 设置层级
      }),
    ]
    styleCache[size] = style
  }
  return style
}

// Cluster change 单个 maker 添加
const addOverlaysAction = (map, clusterSource, features, showViewExtent) => {
  //获取可视区域范围
  const extent = map.getView().calculateExtent(map.getSize())
  //获取可视区域范围的几何对象
  const viewGeometry = fromExtent(extent)
  // console.log(viewGeometry.getBottomLeft())
  features.forEach((feature) => {
    const markers = feature.get('features')
    if (!markers) {
      //不存在 features 即为 单个  overlayMarker
      const overlayMarker = feature.get('overlayMarker')
      // console.log(clusterSource.overlayIds)
      if (overlayMarker) {
        // 获取 overlayMarker id
        const id = overlayMarker.getId()
        // 获取 overlayMarker 经纬度
        const coordinate = overlayMarker.getPosition()
        // 判断是否在可视区域内
        const inViewGeometry = viewGeometry.intersectsCoordinate(coordinate)
        // 判断是否已经添加
        const inOverlaysList = clusterSource.overlayIds.includes(id)

        if (!inOverlaysList) {
          // 未被添加的 overlayMarker
          if (inViewGeometry && showViewExtent) {
            //只添加在可视区域
            clusterSource.overlayIds.push(id)
            map.addOverlay(overlayMarker)
          }
          if (!showViewExtent) {
            // 可视区域外的也添加
            clusterSource.overlayIds.push(id)
            map.addOverlay(overlayMarker)
          }
        }
      }
    }
  }, 100)
}

//创建要素聚合数据来源
function createClusterSource(map, vectorSource, options) {
  const { distance, minDistance, showViewExtent } = options

  // 创建要素聚合数据来源
  const clusterSource = new OlCluster({
    distance: parseInt(distance, 10),
    minDistance: parseInt(minDistance, 10),
    source: vectorSource,
    createCluster(point, features) {
      let cluster
      if (features.length == 1) {
        const overlayMarker = features[0].get('overlayMarker')
        // 创建聚合对象时候，只有一个聚合物情况
        cluster = overlayMarker
          ? new OlFeature({
              overlayMarker,
            })
          : new OlFeature({
              geometry: point,
              features,
            })
      } else {
        cluster = new OlFeature({
          geometry: point,
          features,
        })
      }
      cluster.JCTYPE = 'ClusterMarker'
      return cluster
    },
  })

  // 拖动变化-主动触发 clusterSource  change
  // 拖动时，判断Feature是否有变化，可优化
  map.on('moveend', (e) => clusterSource.changed(e))

  /**
   * 监听聚合物体变化 ，用于清除聚合状态下 自定义overlays数量
   * 	addFeatures/removeFeature 也会触发
   */

  clusterSource.on('change', function (e) {
    const features = e.target.getFeatures()
    // 添加前先清除所有 overlayMarker

    clusterSource.overlayIds.forEach((id) => {
      const overlayMarker = map.getOverlayById(id)
      map.removeMarker(overlayMarker)
    })

    clusterSource.overlayIds = []

    if (features.length > 0) {
      // 添加每个聚合物相应的 OverlayMarker
      addOverlaysAction(map, clusterSource, features, showViewExtent)
    }
  })

  return clusterSource
}

/**
 * 创建聚合物覆盖群
 * @param {object} map
 * @param {object} options distance = 40, minDistance = 30
 * @param {object} features
 * @returns
 */
function createMarkerCluster(map, markers, options) {
  const styleCache = {}
  const assignOptions = Object.assign({}, defaultClusterOptions, options)

  const features = markers.map((marker) => {
    let olMarker = marker[marker.JCTYPE]
    // 聚合对象单个矢量对象需要重新注册
    marker.mapOn = map.on.bind(map)
    marker.mapOff = map.off.bind(map)
    return olMarker
  })

  // 创建要素数据来源
  const vectorSource = new VectorSource({
    features,
  })

  // const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
  // 创建要素聚合数据来源

  const clusterSource = createClusterSource(map, vectorSource, assignOptions)

  // 创建一个图层
  const clusterLayer = new VectorLayer({
    className: 'ol-layer jc-clusterer-layer',
    source: clusterSource,
    style: (feature, resolution) => createClusterStyle(styleCache, assignOptions, feature, resolution),
  })

  // 默认添加图层
  map.addLayer(clusterLayer) // 初始默认数据添加图层

  return { clusterLayer, assignOptions }
}

function JCMarkerCluster(map, features = [], options) {
  map.markerCluster = this

  const JCTYPE = 'MARKERCLUSTER'

  const events = ['click', 'dblclick', 'contextmenu'] // 支持的事件

  const { clusterLayer, assignOptions } = createMarkerCluster(map, features, options) // 聚合图层

  this.JCTYPE = JCTYPE

  this[JCTYPE] = clusterLayer // 聚合图层

  this.options = assignOptions

  this.map = map

  this.JCEvents = [] // 存储事件

  this.getView = () => this.map.getView() // 获取地图的初始化 View 信息

  this.getMaxZoom = () => this.getView().getMaxZoom() // 获取地图设置的最大放大

  this.getVectorSource = () => this[JCTYPE].getSource().getSource() //  Marker集合数据对象

  this.getClusterSource = () => this[JCTYPE].getSource() //  聚合物集合数据对象

  this.getDistance = () => this.getClusterSource().getDistance() // 聚合的距离

  this.setDistance = (distance) => this[JCTYPE].getSource().setDistance(distance)

  this.getMinDistance = () => this[JCTYPE].getSource().getMinDistance() // 聚合物的最小间距

  this.setMinDistance = (minDistance) => this[JCTYPE].getSource().setMinDistance(minDistance)

  // 获取聚合类的所有基础Marker集合
  this.getMarkers = () => {
    return this.getVectorSource().getFeatures()
  }

  // 将Marker集合添加到聚合
  this.setMarkers = (features) => {
    const distance = this.getDistance()
    const minDistance = this.getMinDistance()
    if (Array.isArray(features) && features.length > 0) {
      this[JCTYPE] && this.map.removeLayer(this[JCTYPE])

      const { clusterLayer, assignOptions } = createMarkerCluster(this.map, features, {
        distance,
        minDistance,
      })

      this.options = assignOptions

      this[JCTYPE] = clusterLayer

      return this[JCTYPE]
    }
  }

  // 添加Marker
  this.addMarker = (...args) => {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        this.addMarker(...args[0])
      } else {
        args[0].JCTYPE === 'OVERLAYMARKER' && this.getVectorSource().addFeature(args[0].OVERLAYMARKER)
      }
    } else {
      const markers = args.map((marker) => {
        if (marker.JCTYPE === 'OVERLAYMARKER' || marker.JCTYPE === 'MARKER') {
          return marker.OVERLAYMARKER || marker.MARKER
        }
      })
      this.getVectorSource().addFeatures(markers)
    }
  }

  // 删除Marker
  this.removeMarker = (...args) => {
    if (args.length === 1) {
      // 单参数或者数组
      if (Array.isArray(args[0])) {
        this.removeMarker(...args[0])
      } else if (args[0].JCTYPE === 'MARKER') {
        // removeFeature 时候 触发 change 事件，并且会 remove overlayMarker
        this.getVectorSource().removeFeature(args[0].MARKER)
      } else if (args[0].JCTYPE === 'OVERLAYMARKER') {
        // removeFeature 时候 触发 change 事件，并且会 remove overlayMarker
        this.getVectorSource().removeFeature(args[0].OVERLAYMARKER)
      }
    } else {
      // 多个参数
      args.forEach((marker) => this.removeMarker(marker))
    }
  }

  // 清空 Markers
  this.clearMarkers = () => {
    // 遍历清空已经渲染 OverlayMarkers
    this.getClusterSource().overlayIds.forEach((id) => {
      const overlayMarker = this.map.getOverlayById(id)
      this.map.removeMarker(overlayMarker)
    })
    this.getClusterSource().overlayIds = [] // 清空overlayMarkers 数据
    this.getVectorSource().clear() // 清空 Marker集合数据对象
  }

  /* 聚合物放大展开，视野适应地图
   *@param{object}  target  地图对象
   *@param{Array}  	options  组成聚合物的 feature 集合
   *@return {object} target
   *@存在问题，会使 zoom 出现小数
   */
  this.setClusterExtentView = function (target, options = {}) {
    // 所有要素坐标集合
    if (!target || target.JCTYPE !== 'ClusterMarker') return
    const features = target.get('features')
    const coordinates = features.length > 1 ? features.map((r) => r.getGeometry().getCoordinates()) : features.getGeometry().getCoordinates()
    // 放大地图，让要素刚好出现在视野
    this.getView().fit(boundingExtent(coordinates), {
      maxZoom: this.getMaxZoom(),
      duration: 300,
      padding: [100, 100, 100, 100], // 点要素距离视野边距
      ...options,
    })
    return target
  }

  //事件监听
  this.on = (eventName, callBack = () => {}) => {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
    if (!events.includes(eventName)) return console.warn('无效的事件：' + eventName)
    const JCMarkerEventName = 'JCCluster(' + eventName + ')'
    const eventObject = {
      eventName: JCMarkerEventName,
      callBack,
      handler: () => {},
    }
    const currentEventObject = this.JCEvents.find((e) => e.eventName === eventName)
    // 未绑定过事件
    if (!currentEventObject) {
      //注册事件-  传递如：JCMarkerCluster(cliclk)
      // this.map
      //   ? this.map.on(eventObject.eventName, eventObject.callBack)
      //   : this.mapOn(eventObject.eventName, eventObject.callBack)
      this.map.on(eventObject.eventName, eventObject.callBack)

      this.JCEvents.push(eventObject)

      eventObject.handler = (e) => {
        this.options.isClusterFitView && this.setClusterExtentView(e.event)
        eventObject.callBack({
          type: e.type,
          layer: e.target,
          target: e.event,
        })
      }

      //监听事件 - JCMap 处理成 cliclk
      this[JCTYPE].on(eventName, eventObject.handler)
    } else {
      // // //移除相同的事件
      this[JCTYPE].un(eventName, currentEventObject.handler)
      // //监听事件
      this[JCTYPE].on(eventName, currentEventObject.handler)
    }
  }
}

export default JCMarkerCluster
