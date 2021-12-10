import { defaults as defaultControls, FullScreen, ZoomSlider } from 'ol/control'
import { boundingExtent } from 'ol/extent'
import Polygon from 'ol/geom/Polygon' //
import { defaults as DefaultInteraction } from 'ol/interaction'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { getUid } from 'ol/util'
import XYZ from 'ol/source/XYZ'
import { Fill, Icon, Style, Text } from 'ol/style'
import { OlMap, OlView } from './inherit'
import JCVectorLayer from './JCVectorLayer'

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
    visible: false, //底图显示隐藏
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
    visible: false, //底图显示隐藏
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

  //请求高德图层
  const AMapLayer = new TileLayer({
    zIndex: 0, // 底图图层层级
    visible: true,
    className: 'ol-layer standard',
    source: new XYZ({
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
    }),
  })

  //默认控件
  const controlsExtend = [fullScreen ? new FullScreen() : null, zoomSlider ? new ZoomSlider() : null]

  // console.log('vectorLayer---' ,vectorLayer.getZIndex());

  // 地图初始化
  return new OlMap({
    target,
    layers: [satelliteTileLayer, standardTileLayer, layerTianDi, layerTianDiLabel, layerTianDiImg, layerTianDiImgLabel, AMapLayer], // 图层
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

  const assignOptions = Object.assign({}, defaultMapOptions, options)

  const map = initJCMap(target, assignOptions) // 继承this属性

  let clickTimeId = null //单击事件定时器

  // 支持的事件
  const events = ['complete', 'moveend', 'click', 'dblclick', 'contextmenu', 'moving', 'pointermove']

  //是否移除 map 点击事件
  let isOffClick = false

  // 默认的矢量图层
  this.vectorLayer = new JCVectorLayer({ map, className: 'jc-vector-layer' })

  this.JCTYPE = 'MAP'

  this.olTarget = map

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

  this.getCoordinateFromPixel = map.getCoordinateFromPixel.bind(map) // 获取当前点击坐标点

  this.getPixelFromCoordinate = map.getPixelFromCoordinate.bind(map) // 获取当前经纬度坐标像素点

  this.removeOverlay = map.removeOverlay.bind(map) // 移除覆盖物

  this.getKeys = map.getKeys.bind(map)

  this.render = map.render.bind(map)

  this.addOverlay = (overlay) => overlay && map.addOverlay(overlay) // 添加overlay

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
  // 获取默认矢量图层
  this.getVectorLayer = () => {
    return this.getLayers()
      .getArray()
      .find((layer) => layer.getClassName().indexOf('jc-vector-layer') !== -1)
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
  this.on = (eventName, callBack = () => {}, option = {}) => {

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
      //处理 JCMarker 矢量图形自定义事件
      if (eventName.substring(0, 8) === 'JCMarker') {
        // JCMarker_click 事件
        eventObject.JCEventName = eventName
        eventName = /\((.+)\)/.exec(eventName)[1]
      }

      // 处理 JCCluster  自定义事件
      if (eventName.substring(0, 9) === 'JCCluster') {
        // JCCluster_click 事件
        eventObject.JCEventName = eventName
        eventName = /\((.+)\)/.exec(eventName)[1]
      }

      const eventHandler = (e, olMap, eventObject, callBack) => {
        clickTimeId && clearTimeout(clickTimeId)
        clickTimeId = setTimeout(() => {
          if (olMap.hasFeatureAtPixel(e.pixel)) {
            // 获取点击的图层，以及要素
            const [olFeature, olLayer] = olMap.forEachFeatureAtPixel(e.pixel, (feature, layer) =>  [feature, layer])
            const JCEvents = olFeature.get('JCEvents') || new Map()
            const dispatchAction = (target, eventTarget, JCEvents, event) => {
              JCEvents.forEach(function (currentEventObject, eventName) {
                if (eventName.indexOf(getUid(target)) !== -1 ) {
                  target.dispatchEvent({
                    type: eventName, // 订阅事件对象的名称
                    callBack: currentEventObject.callBack, // 订阅事件对象的回调
                    eventName: event.type, // 实际派发的事件
                    event, // 触发的事件的鼠标事件
                    eventTarget, // 实际应该接收事件ol 对象
                  })
                }
              })

              // for(let [key, value] of JCEvents.entries()) {
              //   if (key.indexOf(target.getId()) >= 0) {
              //     target.dispatchEvent({
              //       type: key, // 订阅事件对象的名称
              //       callBack: value.callBack, // 订阅事件对象的回调
              //       eventName: event.type, // 实际派发的事件
              //       event, // 触发的事件的鼠标事件
              //       eventTarget, // 实际应该接收事件ol 对象
              //     })
              //     break
              //   }
              // }


            }
            if (olFeature.JCTYPE === 'ClusterMarker') {
              //聚合要素 features
              const features = olFeature.get('features')

              if (features.length === 1) {
                // 存在单个feature
                if (!JCEvents.size) {
                  //执行地图事件
                  !isOffClick && callBack(e)
                } else {
                  // 派发事件
                  dispatchAction(features[0], features[0], JCEvents, e)
                }
              } else {
                //聚合物对象
                const JCEvents = olLayer.get('JCEvents') || new Map()
                // console.log(JCEvents);
                if (!JCEvents.size) {
                  //执行地图事件
                  !isOffClick && callBack(e)
                } else {
                  // 派发事件
                  dispatchAction(olLayer, olFeature, JCEvents, e)
                }
              }
            } else if (!olFeature.JCTYPE && olFeature.get('JCTYPE') === 'OlDraw'){
              // dispatchAction(olFeature, olFeature, JCEvents, e)
              // 这里暂时不做处理 特殊实例：主动绘制完图形点击事件，目前可不加
            } else {
              // 非聚合要素features
              if (!JCEvents.size) {
                //执行地图事件
                !isOffClick && callBack(e)
              } else {
                // 派发事件
                dispatchAction(olFeature, olFeature, JCEvents, e)
              }
            }
          } else if (e.type === eventObject.eventName) {
            //点击其他地方处理
            !isOffClick && callBack(e)
          }
        }, 200)
      }

      eventObject.handler = (e) => eventHandler(e, map, eventObject, callBack)

      eventObject.getEventObject = (e) => eventObject

      map.on(eventName, eventObject.handler)

      isOffClick = false
    }

    this.JCEvents.push(eventObject)
  }

  // 注销事件监听
  this.off = (eventName, callBack = () => {}) => {
    if (eventName === 'click') return (isOffClick = true)
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
   * 添加 单个或者多个  覆盖物
   * @param {*} markers
   */
  this.add = (...args) => {
    if (args.length === 1) {
      const target = args[0]
      const vectorLayer = this.getVectorLayer()
      const JCTYPE = target.JCTYPE ? target.JCTYPE : 'unknown'
      const targetSwitch = {
        MARKER: () => {
          vectorLayer.getSource().addFeature(target.olTarget)
        },
        OVERLAYMARKER: () => {
          vectorLayer.getSource().addFeature(target.olTarget)
          this.addOverlay(target.getOverlayMarker())
        },
        OverlayMarker: () => {
          // JCMarkerCluster change 添加 Overlay, 聚合图层会自动添加删除 feature
          this.addOverlay(target)
        },
        POLYLINE: () => {
          vectorLayer.getSource().addFeature(target.olTarget)
        },
        // 信息框
        INFOWINDOW: () => {
          this.addOverlay(target.olTarget)
        },
        // 右键菜单栏
        ContextMenu: () => {
          this.addOverlay(target.olTarget)
        },
        unknown: () => {},
      }
      Array.isArray(target) ? this.add(...target) : targetSwitch[JCTYPE]()
    } else {
      args.forEach((marker) => this.add(marker))
    }
  }

  // map 删除 覆盖物
  this.remove = (...args) => {
    if (args.length === 1) {
      // 单参数或者数组
      const target = args[0]
      if (Array.isArray(target)) {
        target.forEach((marker) => this.remove(marker))
      } else if (target.JCTYPE === 'MARKER') {
        const vectorLayerSource = this.getVectorLayer().getSource()
        if (vectorLayerSource.hasFeature(target.olTarget)) {
          vectorLayerSource.removeFeature(target.olTarget)
        }
      } else if (target.JCTYPE === 'OVERLAYMARKER') {
        const vectorLayerSource = this.getVectorLayer().getSource()
        if (vectorLayerSource.hasFeature(target.olTarget)) {
          vectorLayerSource.removeFeature(target.olTarget)
          map.removeOverlay(target.getOverlayMarker())
        }
      } else if (target.JCTYPE === 'OverlayMarker') {
        // 处理聚合物，change 添加到map 上的 OverlayMarker,
        map.removeOverlay(target)
      } else if (target.JCTYPE === 'POLYLINE') {
        const vectorLayerSource = this.getVectorLayer().getSource()
        if (vectorLayerSource.hasFeature(target.olTarget)) {
          vectorLayerSource.removeFeature(target.olTarget)
        }
      }
    } else {
      // 多个参数
      args.forEach((marker) => this.remove(marker))
    }
  }

  /**
   * 清除地图上所有覆盖物
   */
  this.clearOverlays = () => {
    const overlays = map.getOverlays()
    overlays.forEach((item) => this.removeOverlay(item))
  }

  /**
   * 判断是否有此图层, 并返回
   * @param {*} layer
   * @returns
   */
  this.getLayer = (layerName) => {
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
    const vectorGraph = this.getLayer('VectorLayer') // 判断是否有矢量图层
    const clusterLayer = this.getLayer('jc-clusterer-layer') // 判断是否有聚合图层
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
  this.getInteractions = () => {
    return map.getInteractions()
  }
  // 添加 矢量交互图
  this.addGraph = function (draw) {
    map.addInteraction(draw)
  }

  /**
   * 默认事件
   */
  this.defaultEvents = () => {
    if (this.olTarget) {
      this.olTarget.on('pointermove', (e) => {
        let pixel= this.olTarget.getEventPixel(e.originalEvent);
        let feature= this.olTarget.forEachFeatureAtPixel(pixel,function (feature) {
            return feature
          })
          if(!feature){
            this.olTarget.getTargetElement().style.cursor = 'auto'
          }else{
            this.olTarget.getTargetElement().style.cursor = 'pointer'
          }
      })
    }
  }

  this.defaultEvents() // 默认事件添加
}

export default JCMap
