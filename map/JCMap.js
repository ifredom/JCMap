import { defaults as defaultControls, FullScreen, ZoomSlider } from 'ol/control'
import { boundingExtent } from 'ol/extent'
import Polygon from 'ol/geom/Polygon' //
import { defaults as DefaultInteraction } from 'ol/interaction'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { Fill, Icon, Style, Text } from 'ol/style'
import { OlMap, OlView } from './inherit'

const defaultMapOptions = {
  center: [0, 0], //地图中心
  zoom: 6, //地图缩放层级
  minZoom: 0, // 最小可缩放层级
  maxZoom: 18, // 最大可缩放层级
  doubleClickZoom: false, // 是否双击放大
  zoomShow: false, // 是否显示缩放控件
  zoomSlider: false, // 是否显示滑块缩放控件
  fullScreen: false, // 是否显示全屏控件
  maxExtent: false, // 是否限制地图可拖动范围 - 关联 mouseMoveExtent
  mouseMoveExtent: boundingExtent([
    [55.923433618652325, 3.359091468750009],
    [171.31664592155698, 81.65358702968221],
  ]), //默认拖动范围范围
  wkid: 4326, // 投影坐标系
  token: '9ce65cda6a7cad4da8b250601e8c2802', //地图key
}

// 四维地图底图链接
const standardTileLayerUrl = 'https://www.qqearth.com/engine?st=GetImage&box={x},{y}&lev={z}&type=vect&uid=xzjc'
const satelliteTileLayerUrl = 'https://www.qqearth.com/engine?st=GetImage&box={x},{y}&lev={z}&type=sate&uid=xzjc'

/*
 * 获取在线天地图
 * type:获取的瓦片类型，影像、矢量
 * wkid:坐标系
 * token:官网申请的开发者token
 */
function getLayerUrlByData(type, wkid, token) {
  var url = '',
    layerId,
    tileMatrixSetId
  if (type === 'image') {
    url = 'http://t{1-7}.tianditu.com/DataServer?'
    layerId = 'img_'
    tileMatrixSetId = wkid === 4326 ? 'c' : 'w'
  } else if (type === 'label') {
    url = 'http://t{1-7}.tianditu.com/DataServer?'
    layerId = 'cia_'
    tileMatrixSetId = wkid === 4326 ? 'c' : 'w'
  } else if (type === 'street') {
    url = 'http://t{1-7}.tianditu.com/DataServer?'
    layerId = 'vec_'
    tileMatrixSetId = wkid === 4326 ? 'c' : 'w'
  } else if (type === 'street_label') {
    url = 'http://t{1-7}.tianditu.com/DataServer?'
    layerId = 'cva_'
    tileMatrixSetId = wkid === 4326 ? 'c' : 'w'
  }
  return url + 'T=' + layerId + tileMatrixSetId + '&x={x}&y={y}&l={z}&tk=' + token
}

//创建矢量标注图层
function createVectorLayer(features) {
  //矢量标注的数据源
  const vectorSource = new VectorSource({
    features,
  })
  //矢量标注图层
  const vectorLayer = new VectorLayer({
    source: vectorSource,
    className: 'markerVectorLayer',
  })
  return vectorLayer
}

// 层级关系
// 底图 zIndex 为 0

//初始化JCMap
function initJCMap(target, options) {
  const {
    center, //地图中心
    zoom, //地图缩放层级
    minZoom, // 最小可缩放层级
    maxZoom, // 最大可缩放层级
    doubleClickZoom, // 是否双击放大
    zoomShow, // 是否显示缩放控件
    zoomSlider, // 是否显示滑块缩放控件
    fullScreen, // 是否显示全屏控件
    maxExtent, //限制地图可拖动范围
    mouseMoveExtent,
    token,
    wkid,
  } = options

  //创建天地图矢量底图
  const layerTianDi = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: true, //底图显示隐藏
    className: 'ol-layer standard',
    source: new XYZ({
      url: getLayerUrlByData('street', wkid, token),
      projection: 'EPSG:' + wkid,
      wrapX: false,
      crossOrigin: 'anonymous', // 图片跨域允许
    }),
  })

  const layerTianDiLabel = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: true, //底图显示隐藏
    className: 'ol-layer standard',
    source: new XYZ({
      url: getLayerUrlByData('street_label', wkid, token),
      projection: 'EPSG:' + wkid,
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  //创建天地图影像底图
  const layerTianDiImg = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: false, //底图显示隐藏
    className: 'ol-layer satellite',
    source: new XYZ({
      url: getLayerUrlByData('image', wkid, token),
      projection: 'EPSG:' + wkid,
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  const layerTianDiImgLabel = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: false, //底图显示隐藏
    className: 'ol-layer satellite',
    source: new XYZ({
      url: getLayerUrlByData('label', wkid, token),
      projection: 'EPSG:' + wkid,
      wrapX: true,
      crossOrigin: 'anonymous',
    }),
  })

  // 四维标准底图图层
  const standardTileLayer = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: false, //底图显示隐藏
    className: 'ol-layer standard',
    source: new XYZ({
      url: standardTileLayerUrl,
    }),
  })

  // 四维卫星底图图层
  const satelliteTileLayer = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: false,
    className: 'ol-layer satellite',
    source: new XYZ({
      url: satelliteTileLayerUrl,
    }),
  })

  //默认控件
  const controlsExtend = [fullScreen ? new FullScreen() : null, zoomSlider ? new ZoomSlider() : null]

  // 默认的矢量图层
  const vectorLayer = createVectorLayer()

  // 地图初始化
  return new OlMap({
    target,
    layers: [satelliteTileLayer, standardTileLayer, layerTianDi, layerTianDiLabel, layerTianDiImg, layerTianDiImgLabel, vectorLayer], // 图层
    overlays: [], // 覆盖物
    view: new OlView({
      projection: 'EPSG:' + wkid,
      center, // 中心点
      zoom, // 层级
      minZoom, // 最小缩放
      maxZoom, // 最大缩放0
      multiWorld: false, // 控制无法边缘平移
      constrainResolution: true, // 控制缩放为整数
      extent: !maxExtent ? undefined : mouseMoveExtent,
    }),
    interactions: new DefaultInteraction({
      attribution: true,
      doubleClickZoom, // 屏蔽默认双击放大事件
    }),
    controls: defaultControls({ zoom: zoomShow }).extend(controlsExtend.filter((c) => c)),
  })
}

// 地图类
function JCMap(target = 'map', options = {}) {
  if (!target || typeof target !== 'string') throw new Error('请传入正确的参数！')

  const JCTYPE = 'MAP'

  const assignOptions = Object.assign({}, defaultMapOptions, options)

  const map = initJCMap(target, assignOptions) // 继承this属性

  let clickTimeId = null //单击事件定时器

  // 支持的事件
  const events = ['complete', 'moveend', 'JCMarker_click', 'click', 'dblclick', 'contextmenu']

  this.JCTYPE = JCTYPE

  this[JCTYPE] = map

  this.markerCluster = null // 聚合图层对象

  this.JCEvents = [] // 支持的事件的回调函数

  this.view = map.getView() // 获取地图的初始化 View 信息

  this.center = () => this.view.getCenter() // 获取地图的中心位置

  this.getMaxZoom = () => this.view.getMaxZoom() // 获取地图设置的最大放大

  this.getMinZoom = () => this.view.getMinZoom() // 获取地图设置的最小缩放

  this.getOverlayById = map.getOverlayById.bind(map) // 根据ID获取覆盖物

  this.getLayers = map.getLayers.bind(map) // 获取所有图层

  this.getView = map.getView.bind(map) // 获取 View对象

  this.getSize = map.getSize.bind(map) // 获取 获取可视区域的宽高

  this.getTarget = map.getTarget.bind(map) // 获取 target的值  -- map

  this.updateSize = map.updateSize.bind(map) // 强制更新视口大小

  this.getFeaturesAtPixel = map.getFeaturesAtPixel.bind(map) // 从 坐标 获取 Features集合

  this.hasFeatureAtPixel = map.hasFeatureAtPixel.bind(map) // 判断是否点击了 Feature

  this.forEachFeatureAtPixel = map.forEachFeatureAtPixel.bind(map) // 从Features 里面遍历 点Pixel

  this.addControl = map.addControl.bind(map) // 添加控件

  this.removeLayer = map.removeLayer.bind(map) // 移除图层

  this.addOverlay = map.addOverlay.bind(map) // 添加overlay 衍生自map类，此处为内置函数，不暴露给外部

  this.getCoordinateFromPixel = map.getCoordinateFromPixel.bind(map) // 获取当前点击坐标点

  this.removeOverlay = map.removeOverlay.bind(map) // 移除覆盖物

  this.getKeys = map.getKeys.bind(map)

  // 获取当前层级
  this.getZoom = function () {
    return this.view.getZoom()
  }

  // 设置当前层级
  this.setZoom = function (zoom) {
    // console.log(this.getZoom(), maxZoom, minZoom)
    this.view.animate({ zoom, duration: 500 })
  }

  // 设置地图中心
  this.setCenter = function (coord, zoom = 0) {
    const viewCenter = coord || (this.center() ? this.center() : [0, 0])
    zoom = zoom || this.getZoom()
    this.view.setCenter(viewCenter)
    this.setZoom(zoom)
  }

  // 定位到目标位置
  this.panTo = function (coord) {
    this.view.animate({
      // 只设置需要的属性即可
      center: coord, // 中心点
      // zoom: this.getZoom(), // 缩放级别
      duration: 400, // 缩放持续时间，默认不需要设置
    })
  }
  // 获取默认marker图层
  this.getMarkerVectorLayer = () => {
    return this.getLayers()
      .getArray()
      .find((layer) => layer.getClassName().indexOf('markerVectorLayer') !== -1)
  }

  // 卫星地图图层
  this.getSatelliteLayer = () => {
    return this.getLayers()
      .getArray()
      .find((layer) => layer.getClassName().indexOf('satellite') !== -1)
  }
  // 标准地图图层
  this.getStandardLayer = () => {
    return this.getLayers()
      .getArray()
      .find((layer) => layer.getClassName().indexOf('standard') !== -1)
  }

  // 事件监听
  this.on = (eventName, callBack = () => {}) => {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
    if (!events.includes(eventName) && eventName.substring(0, 8) !== 'JCMarker' && eventName.substring(0, 9) !== 'JCCluster')
      return console.warn('无效的事件：' + eventName)

    const eventObject = {
      eventName,
      JCEventName: '',
      callBack,
      handler: () => {},
    }

    if (eventName === 'complete') {
      //添加 complete事件
      eventName = 'rendercomplete'
      map.once(eventName, (e) => callBack && callBack(e))
    } else if (eventName === 'moveend') {
      map.on(eventName, (e) => callBack && callBack(e))
    } else {
      //处理 JCMarker 矢量图形点击事件
      if (eventName.substring(0, 8) === 'JCMarker') {
        // JCMarker_click 事件
        eventObject.JCEventName = eventName
        eventName = /\((.+)\)/.exec(eventName)[1]
      }

      if (eventName.substring(0, 9) === 'JCCluster') {
        // JCCluster_click 事件
        eventObject.JCEventName = eventName
        eventName = /\((.+)\)/.exec(eventName)[1]
      }

      const eventHandler = (e, olMap, eventObject, callBack) => {
        clickTimeId && clearTimeout(clickTimeId)
        clickTimeId = setTimeout(() => {
          if (olMap.hasFeatureAtPixel(e.pixel)) {
            // 地图要素 事件处理
            const olFeature = olMap.forEachFeatureAtPixel(e.pixel, (m) => m)
            // console.log(olFeature)
            if (olFeature.JCTYPE === 'ClusterMarker') {
              //点击聚合物内的单个矢量图形
              const features = olFeature.get('features')
              const JCEvents = olFeature.get('JCEvents') || []
              if (features.length === 1) {
                //是否存在对应的事件监听
                //判断事件是否对应
                const isJCMarkerEvent = JCEvents.some((JCMarkerEventName) => JCMarkerEventName && /\((.+)\)/.exec(JCMarkerEventName)[1] === e.type)
                // console.log(isJCMarkerEvent)
                isJCMarkerEvent &&
                  features[0].dispatchEvent({
                    type: e.type, // 相应的事件
                    event: e,
                  })
              } else {
                //聚合矢量图形
                //判断事件是否对应
                const isJCClusterEventName = JCEvents.some(
                  (JCClusterEventName) => JCClusterEventName && /\((.+)\)/.exec(JCClusterEventName)[1] === e.type
                )
                // console.log(isJCClusterEventName, e.type)
                isJCClusterEventName &&
                  this.markerCluster.olTarget.dispatchEvent({
                    type: e.type,
                    event: olFeature,
                  })
              }
            } else {
              olFeature.dispatchEvent({
                type: eventObject.eventName,
                event: e,
              })
            }
          } else if (e.type === eventObject.eventName) {
            callBack(e)
          }
        }, 200)
      }

      eventObject.handler = (e) => eventHandler(e, map, eventObject, callBack)
      eventObject.getEventObject = (e) => eventObject
      map.on(eventName, eventObject.handler)
    }
    this.JCEvents.push(eventObject)
  }

  // 注销事件监听
  this.off = (eventName, callBack = () => {}) => {
    let currentEventObject = null

    const index = this.JCEvents.findIndex((e) => {
      if (e.eventName === eventName) {
        currentEventObject = e
        return true
      }
    })

    if (index !== -1) {
      const isJCMarkerEvent = eventName.substring(0, 8) === 'JCMarker'
      const mapEventName = /\((.+)\)/.exec(currentEventObject.eventName)
      console.log(isJCMarkerEvent ? mapEventName[1] : currentEventObject.eventName)
      map.un(isJCMarkerEvent ? mapEventName[1] : currentEventObject.eventName, currentEventObject.handler)
      // map.unset('JCMarkerEventName')
      this.JCEvents.splice(index, 1)
      callBack && callBack()
    }
  }

  // 切换地图类型
  this.setBaseLayer = (layerName) => {
    if (layerName === 'satellite') {
      this.getStandardLayer().setVisible(false)
      this.getSatelliteLayer().setVisible(true)
    } else if (layerName === 'standard') {
      this.getSatelliteLayer().setVisible(false)
      this.getStandardLayer().setVisible(true)
    } else {
      this.getSatelliteLayer().setVisible(false)
      !this.getStandardLayer().getVisible() && this.getStandardLayer().setVisible(true)
    }
  }

  // 添加图层
  this.addLayer = (layer) => {
    // jc-clusterer-layer 聚合图层
    map.addLayer(layer)
  } // 添加图层

  // 获取聚合图层
  this.getMarkerClusterer = () => {
    return this.markerCluster
  }

  /**
   * 添加单个或多个覆盖物
   * @param {*} markers
   */
  this.addOverlays = (markers) => {
    const flag = Object.prototype.toString.call(markers)
    const commonStyle = (option) => {
      const singleStyle = option.getStyle()
      return new Style({
        image: new Icon({
          src: singleStyle.img,
        }),
        text: new Text({
          text: singleStyle.label,
          offsetY: singleStyle.labelYOffset,
          offsetX: singleStyle.labelXOffset,
          padding: singleStyle.padding,
          backgroundFill: new Fill({
            color: singleStyle.labelBgColor,
          }),
          font: singleStyle.font,
        }),
        zIndex: 2,
      })
    }
    this.markerLayer = new VectorLayer({
      source: new VectorSource(),
    })
    // 添加图层
    map.addLayer(this.markerLayer)
    // 添加多个覆盖物
    if (flag === '[object Array]') {
      // console.log(markers);
      markers.forEach((item) => {
        const style = commonStyle(item)
        item.setStyle(style)
      })
      this.markerLayer.getSource().addFeatures(markers)
    } else {
      // MARKER => 普通覆盖物, OVERLAYMARKER => 聚合覆盖物
			if (markers.JCTYPE !== 'MARKER') {
				const overlay = markers.get('overlayMarker')
				map.addOverlay(overlay)
			} else {
				// 添加常规覆盖物，通过传img等数据进来
				// map.addOverlay(markers)
        this.markerLayer.getSource().addFeature(markers.olTarget)
			}

    }
  }

  /**
   * 移除对应的覆盖物
   * @param {*} marker
   */

   this.removeOverlays = marker => {
    if (marker.JCTYPE === 'MARKER') {
      this.markerLayer.getSource().removeFeature(marker.olTarget)
    } else {
      if (marker.get('overlayMarker')) {
        map.removeOverlay(marker.get('overlayMarker'))
        map.getMarkerClusterer() && map.getMarkerClusterer().removeMarker(marker)
      }
    }
  }


  /**
   * 清除地图上所有覆盖物
   */
   this.clearOverlays = () => {
    const overlays = map.getOverlays()
    overlays.getArray().forEach(item => this.removeOverlays(item))
    // 清除常用配置 feature
    if (this.markerLayer) {
      this.markerLayer.getSource().clear()
    }
  }

  // map 添加 Marker
  this.addMarker = (...args) => {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        this.addMarker(...args[0])
      } else if (args[0].JCTYPE === 'MARKER') {
        const markerVectorLayer = this.getMarkerVectorLayer()
        args[0].mapOn = this.on.bind(this)
        args[0].mapOff = this.off.bind(this)
        markerVectorLayer.getSource().addFeature(args[0].MARKER)
      } else if (args[0].JCTYPE === 'OVERLAYMARKER') {
        this.addOverlay(args[0].getOverlayMarker())
      }
    } else {
      args.forEach((marker) => this.addMarker(marker))
    }
  }

  // map 删除 Marker
  this.removeMarker = (...args) => {
    if (args.length === 1) {
      // 单参数或者数组
      const target = args[0]
      if (Array.isArray(target)) {
        target.forEach((marker) => this.removeMarker(marker))
      } else if (target.JCTYPE === 'MARKER') {
        const markerVectorLayer = this.getMarkerVectorLayer()
        markerVectorLayer.getSource().removeFeature(target.MARKER)
      } else if (target.JCTYPE === 'OVERLAYMARKER') {
        map.removeOverlay(target.getOverlayMarker())
      } else if (target.JCTYPE === 'OverlayMarker') {
        // 处理聚合物，change 添加到map 上的 OverlayMarker,
        map.removeOverlay(target)
      }
    } else {
      // 多个参数
      args.forEach((marker) => this.removeMarker(marker))
    }
  }

  /**
   * 判断是否有此图层, 并返回
   * @param {*} layer
   * @returns
   */
  this.hasLayer = (layerName) => {
    return map
      .getLayers()
      .getArray()
      .find((layer) => layer.getClassName().indexOf(layerName) !== -1)
  }
  /**
   * 让地图自动适应覆盖
   * 获取覆盖物群里的 总的最小经纬度和最大经纬度，以此来生成矩形框，然后视图调用fit()方法来适应层级
   * @param {*} overlay
   */
  this.setFitView = () => {
    const vectorGraph = this.hasLayer('VectorLayer') // 判断是否有矢量图层
    const clusterLayer = this.hasLayer('jc-clusterer-layer') // 判断是否有聚合图层
    const rectangleBox = {
      minLng: Infinity,
      minLat: Infinity,
      maxLng: -Infinity,
      maxLat: -Infinity,
    }
    if (vectorGraph && vectorGraph.getSource().getFeatures().length) {
      vectorGraph
        .getSource()
        .getFeatures()
        .forEach((item) => {
          //   getExtent 获取左上角 和 右上角坐标方法 分别代表最小经纬和最大经纬
          if (rectangleBox.minLng > item.getGeometry().getExtent()[0]) {
            rectangleBox.minLng = item.getGeometry().getExtent()[0]
          }
          if (rectangleBox.minLat > item.getGeometry().getExtent()[1]) {
            rectangleBox.minLat = item.getGeometry().getExtent()[1]
          }
          if (rectangleBox.maxLng < item.getGeometry().getExtent()[2]) {
            rectangleBox.maxLng = item.getGeometry().getExtent()[2]
          }
          if (rectangleBox.maxLat < item.getGeometry().getExtent()[3]) {
            rectangleBox.maxLat = item.getGeometry().getExtent()[3]
          }
        })
    }
    if (clusterLayer && clusterLayer.getSource().getSource().getFeatures().length) {
      this.markerCluster.getMarkers().forEach((item) => {
        let flag = item.get('position')
        if (rectangleBox.minLng > flag[0]) {
          rectangleBox.minLng = flag[0]
        }
        if (rectangleBox.minLat > flag[1]) {
          rectangleBox.minLat = flag[1]
        }
        if (rectangleBox.maxLng < flag[0]) {
          rectangleBox.maxLng = flag[0]
        }
        if (rectangleBox.maxLat < flag[1]) {
          rectangleBox.maxLat = flag[1]
        }
      })
    }
    const p1 = rectangleBox.minLng
    const p2 = rectangleBox.minLat
    const p3 = rectangleBox.maxLng
    const p4 = rectangleBox.maxLat
    const polygon = new Polygon([
      [
        [p1, p2],
        [p3, p2],
        [p3, p4],
        [p1, p4],
        [p1, p2],
      ],
    ])
    map.getView().fit(polygon, { padding: [5, 5, 5, 5] })
  }

  // 地图缩小
  this.setZoomOut = function (zoomNum = 1) {
    // 获取地图当前缩放等级
    const zoom = this.getZoom()
    // 每单击一次地图的缩放等级减一，以实现地图缩小
    this.setZoom(zoom - zoomNum)
  }

  // 地图放大
  this.setZoomIn = function (zoomNum = 1) {
    // 获取地图当前缩放等级
    const zoom = this.getZoom()
    // 每单击一次地图的缩放等级减一，以实现地图缩小
    this.setZoom(zoom + zoomNum)
  }

  //获取当前屏幕的 extent
  this.getPointExtent = function (n) {
    n = n ? n : 1
    let mapsize = this.getSize().map((it_) => it_ * n)
    return this.view.calculateExtent(mapsize)
  }

  // 删除 矢量交互图
  this.removeGraph = function (draw) {
    map.removeInteraction(draw)
  }

  // 添加 矢量交互图
  this.addGraph = function (draw) {
    map.addInteraction(draw)
  }
}

export default JCMap
