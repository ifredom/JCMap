import { boundingExtent } from "ol/extent";
import { fromExtent } from "ol/geom/Polygon";
import { Vector as VectorLayer } from "ol/layer";
import VectorSource from "ol/source/Vector";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import img0 from "../assets/image/map/m0.png";
import img1 from "../assets/image/map/m1.png";
import img2 from "../assets/image/map/m2.png";
import img3 from "../assets/image/map/m3.png";
import { OlCluster, OlFeature } from "./inherit";

const defaultOptions = {
  zIndex: 3, // 覆盖物的叠加顺序
  noClusterZoom: 18, // 在zoom及以上不聚合
  distance: 40, // 要素将聚集在一起的距离（以像素为单位）
  minDistance: 30, //  簇之间的最小距离（以像素为单位）
  showViewExtent: true, // 只展示可视区域 Marker
  zoomOnClick: true, // 是否点击展开 Cluster
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAZCAYAAADe1WXtAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHrSURBVEjHrdW9a1NxFMbxT9qmNWmaRqlFhE6CLuIL1DcUHDqJm/0HBEUk3RQXpW7dXdysWlAEHQSlo4IoIoggFCko4lJEEaq296aNtvk5JIG2NGmSOjzbuV9+9zzPOUcIwUbCvg7uYGtD9RsVdDCSJh7iT5ofONEyFLkeJvcw/5EQCE8JvRTSjKG9KSiOdvMtz0KxAqzqK+E4cZZ3GNgQikQXV7PET9bAVmqZMMbfNPM4UxOK/iwvB5mfqQNcqTeEHcQ93EVqFRRDaWZHKS41CKzqN2GYQoYv2BtCoJNrvRRe1PnwPeFGpZ+1am5TSrGQ5CJc2E1UqlH8nJCuKFN5WS3wIIUko5DIMjVOab3CEUIbASFLeFwD+Kgct09or/b0cI54rsWXRoQ+Yhxb5X4PDy9TbKWnlyj28mC9SO1MEX9u0v0P5b+YQ9+64e/i+iniZqBHiJLk603Ulm6+P2sQeI9Slmm01Z19DO8iWmog9LmyOYcaWihZ3t5kuR40z2KWiWa21P4eCj/rTFjFnG1N7dMME3kW1wJLhANE7ZxvZUlvTxFNr4GOl82ZQqKlc9LJlZNEVeBseVRjHGz5RiGZYWayAj3HQoZbmz58OD1A9JqQ4hdym4ZWIvaqn8UEZ//Lia5GrJP79cxZqX+cR1gC9S9TwAAAAABJRU5ErkJggg==", // 默认 marker icon 图标
};

// 默认 marker  样式
const getDefaultStyle = () => ({
  //icon style
  img: defaultOptions.src,
  rotateWithView: true,
  rotation: 0,
  //text style
  font: "normal 12px sans-serif",
  label: "",
  fontSize: "12px",
  fontFamily: "sans-serif",
  fontWeight: "normal",
  fontColor: "#fff",
  placement: "point", // 默认为point
  labelBgColor: "transparent",
  borderColor: "transparent", // 边框颜色
  borderWidth: "0", // 边框宽度
  labelXOffset: 0, // 水平文本偏移量
  labelYOffset: 3, // 垂直文本偏移量
  padding: [0, 0, 0, 0],
  textBaseline: "middle", //
  textAlign: "center", //文本对齐方式
});

// marker Text样式处理
function createSingleTextStyle(style) {
  // console.log(style)
  return {
    placement: style.placement, // 默认为point
    text: style.label,
    offsetX: style.labelXOffset,
    offsetY: style.labelYOffset,
    fill: new Fill({
      // 字体颜色
      color: style.fontColor,
    }),
    font:
      style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, // 字体样式
    backgroundFill: new Fill({
      // 背景颜色
      color: style.labelBgColor,
    }),
    backgroundStroke: new Stroke({
      // 边框样式
      color: style.borderColor,
      width: style.borderWidth,
      lineCap: "square", // 线帽风格  butt, round, 或者 square 默认 round
      lineJoin: "bevel", // 线连接方式 bevel, round, 或者 miter 默认 round
      lineDash: [], // 线间隔模式 控制虚线
      lineDashOffset: 0, // 线段间隔偏移 默认0
      miterLimit: 10, // 默认10
    }),
    padding: style.padding,
    textBaseline: style.textBaseline, // 似乎无效
    textAlign: style.textAlign, //文本对齐方式,似乎无效，设置会让文本消失
  };
}

function createSingleIconStyle(style) {
  const sIconStyle = {
    crossOrigin: "anonymous", // 图片跨域允许
    anchor: [0.5, 0.5], // 原点位置
    anchorOrigin: "top-left", // 原点位置偏移方向
    anchorXUnits: "fraction", // 基于原点位置百分比
    anchorYUnits: "fraction", // 基于原点位置像素
    offset: [0, 0], // 偏移量设置，相对于原点
    scale: 1, // 图标缩放比例
    opacity: 1, // 透明度
    src: style.img,
    // img: style.img, // 图标的url
    rotateWithView: style.rotateWithView, // 是否旋转
    rotation: style.rotation, // 旋转角度
  };

  return sIconStyle;
}

// 设置聚合要素样式
function createClusterStyle(styleCache, assignOptions, feature, resolution) {
  const size = feature.get("features").length; // 获取该要素所在聚合群的要素数量
  let style = styleCache[size];
  const defaultStyle = getDefaultStyle();

  if (!style) {
    const textStyle = createSingleTextStyle({
      label: size.toString() || defaultStyle.label,
      font: defaultStyle.font,
      fontSize: defaultStyle.fontSize,
      fontFamily: defaultStyle.fontFamily,
      fontWeight: defaultStyle.fontWeight,
      fontColor: defaultStyle.fontColor,
      labelXOffset: defaultStyle.labelXOffset,
      labelYOffset: defaultStyle.labelYOffset,
      labelBgColor: defaultStyle.labelBgColor,
      borderColor: defaultStyle.borderColor,
      borderWidth: defaultStyle.borderWidth,
      padding: defaultStyle.padding,
      placement: defaultStyle.placement,
      textBaseline: defaultStyle.textBaseline,
      textAlign: defaultStyle.textAlign,
    });

    const iconStyle = createSingleIconStyle({
      src: defaultStyle.img,
      rotateWithView: defaultStyle.rotateWithView,
      rotation: defaultStyle.rotation,
    });

    if (size == 1) {
      // 处理 overlayMarker 和 正常 Marker
      const marker = feature.get("features")[0];
      return !marker.get("overlayMarker") ? marker.getStyle() : null;
    } else if (size < 11) {
      iconStyle.src = img0;
    } else if (size < 101) {
      iconStyle.src = img1;
    } else if (size < 1001) {
      iconStyle.src = img2;
    } else {
      iconStyle.src = img3;
    }

    style = [
      new Style({
        image: new Icon(iconStyle),
        text: new Text(textStyle),
        zIndex: defaultStyle.zIndex, // 设置层级
      }),
    ];
    styleCache[size] = style;
  }
  return style;
}

// Cluster change 单个 maker 添加
const addOverlaysAction = (map, clusterSource, features, showViewExtent) => {
  //获取可视区域范围的1.2倍
  const mapsize = map.getSize().map((it_) => it_ * 1.2);
  const extent = map.getView().calculateExtent(mapsize);
  //获取可视区域范围的几何对象
  const viewGeometry = fromExtent(extent);
  // console.log(viewGeometry.getBottomLeft())

  features.forEach((feature) => {
    const markers = feature.get("features");
    const showZoomFeature = feature.get("showZoomFeature");

    if (!markers) {
      //不存在 features 即为 单个  overlayMarker
      const overlayMarker = feature.get("overlayMarker");

      if (overlayMarker) {
        // 获取 overlayMarker id
        const id = overlayMarker.getId();
        // 获取 overlayMarker 经纬度
        const coordinate = overlayMarker.getPosition();
        // 判断是否在可视区域内
        const inViewGeometry = viewGeometry.intersectsCoordinate(coordinate);
        // 判断是否已经添加
        const inOverlaysList = clusterSource.overlayIds.includes(id);

        if (!inOverlaysList) {
          // 未被添加的 overlayMarker
          if (inViewGeometry && showViewExtent) {
            //只添加在可视区域
            clusterSource.overlayIds.push(id);

            map.add(overlayMarker);
          }
          if (!showViewExtent) {
            // 可视区域外的也添加
            clusterSource.overlayIds.push(id);
            map.add(overlayMarker);
          }
        }
      }
    } else if (showZoomFeature) {
      //处理zoom 不聚合情况
      addOverlaysAction(map, clusterSource, markers, showViewExtent);
    }
  }, 100);
};

//创建要素聚合数据来源
function createClusterSource(map, vectorSource, options) {
  const { distance, minDistance, showViewExtent, noClusterZoom } = options;

  // 创建要素聚合数据来源
  const clusterSource = new OlCluster({
    distance: parseInt(distance, 10),
    minDistance: parseInt(minDistance, 10),
    source: vectorSource,
    createCluster(point, features) {
      let cluster = null;
      // console.log('createCluster---------')
      const zoom = map.getZoom();
      const showZoomFeature = zoom >= noClusterZoom;
      // console.log(zoom)

      if (features.length == 1) {
        const overlayMarker = features[0].get("overlayMarker");
        // 创建聚合对象时候，只有一个聚合物情况
        cluster = overlayMarker
          ? new OlFeature({
              overlayMarker,
            })
          : new OlFeature({
              geometry: point,
              features,
              JCEvents: features[0].get("JCEvents"),
            });
      } else {
        cluster = new OlFeature({
          geometry: point,
          features,
          showZoomFeature,
          // JCEvents: clusterSource.get('JCEvents'), // 为每个聚合要素添加 JCEvents，去除麻烦，已经统一设置在聚合图层
        });
        cluster.setId(cluster.ol_uid);
      }

      cluster.JCTYPE = "ClusterMarker";
      return cluster;
    },
  });

  // 拖动变化-主动触发 clusterSource  change
  // 拖动时，判断Feature是否有变化，可优化
  map.on("moveend", (e) => clusterSource.changed(e));

  /**
   * 监听聚合物体变化 ，用于清除聚合状态下 自定义overlays数量
   * 	addFeatures/removeFeature 也会触发
   */

  clusterSource.on("change", function (e) {
    const features = e.target.getFeatures();
    // 添加前先清除所有 overlayMarker

    clusterSource.overlayIds.forEach((id) => {
      const overlayMarker = map.getOverlayById(id);
      map.removeMarker(overlayMarker);
    });

    clusterSource.overlayIds = [];

    if (features.length > 0) {
      // 添加每个聚合物相应的 OverlayMarker
      addOverlaysAction(map, clusterSource, features, showViewExtent);
    }
  });

  return clusterSource;
}

/**
 * 创建聚合物覆盖群
 * @param {object} map
 * @param {object} options distance = 40, minDistance = 30
 * @param {object} features
 * @returns
 */
function createMarkerCluster(map, markers, options) {
  const styleCache = {};
  const assignOptions = Object.assign({}, defaultOptions, options);

  const features = markers.map((marker) => {
    // 聚合对象单个矢量对象需要重新注册
    return marker.olTarget;
  });
  // console.log(features)

  // 创建要素数据来源
  const vectorSource = new VectorSource({
    features,
  });

  // const finalPath = fromLonLat([center[0], center[1]], 'EPSG:4326')
  // 创建要素聚合数据来源

  const clusterSource = createClusterSource(map, vectorSource, assignOptions);

  // 创建一个图层
  const clusterLayer = new VectorLayer({
    className: "jc-clusterer-layer",
    source: clusterSource,
    zIndex: 1,
    style: (feature, resolution) =>
      createClusterStyle(styleCache, assignOptions, feature, resolution),
  });

  // 默认添加图层
  map.addLayer(clusterLayer); // 初始默认数据添加图层

  return { clusterLayer, assignOptions };
}

function JCMarkerCluster(map, features = [], options) {
  if (!map || map.JCTYPE !== "MAP")
    throw new Error("JCMarkerCluster warn: 请传入正确的map对象~");

  const events = ["click", "dblclick", "contextmenu"]; // 支持的事件

  const { clusterLayer, assignOptions } = createMarkerCluster(
    map,
    features,
    options
  ); // 聚合图层

  this.olTarget = clusterLayer; // 聚合图层

  this.options = assignOptions;

  this.map = map;

  this.JCTYPE = "MARKERCLUSTER";

  this.JCEvents = new Map(); // 存储事件

  this.getView = () => this.map.getView(); // 获取地图的初始化 View 信息

  this.getMaxZoom = () => this.getView().getMaxZoom(); // 获取地图设置的最大放大

  this.getVectorSource = () => this.olTarget.getSource().getSource(); //  Marker集合数据对象

  this.getClusterSource = () => this.olTarget.getSource(); //  聚合物集合数据对象

  this.getDistance = () => this.getClusterSource().getDistance(); // 聚合的距离

  this.setDistance = (distance) =>
    this.olTarget.getSource().setDistance(distance);

  this.getMinDistance = () => this.olTarget.getSource().getMinDistance(); // 聚合物的最小间距

  this.setMinDistance = (minDistance) =>
    this.olTarget.getSource().setMinDistance(minDistance);

  this.getId = function () {
    return this.getClusterSource().ol_uid;
  };

  // 获取聚合类的所有基础Marker集合
  this.getMarkers = () => {
    return this.getVectorSource().getFeatures();
  };

  // 将Marker集合添加到聚合
  this.setMarkers = (features) => {
    const distance = this.getDistance();
    const minDistance = this.getMinDistance();
    if (Array.isArray(features) && features.length > 0) {
      this.olTarget && this.map.removeLayer(this.olTarget);

      const { clusterLayer, assignOptions } = createMarkerCluster(
        this.map,
        features,
        {
          distance,
          minDistance,
        }
      );

      this.options = assignOptions;

      this.olTarget = clusterLayer;

      return this.olTarget;
    }
  };

  // 添加Marker
  this.add = (...args) => {
    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        this.add(...args[0]);
      } else if (
        args[0].JCTYPE === "OVERLAYMARKER" ||
        args[0].JCTYPE === "MARKER"
      ) {
        this.getVectorSource().addFeature(args[0].olTarget);
      }
    } else {
      const markers = args.map((marker) => {
        if (marker.JCTYPE === "OVERLAYMARKER" || marker.JCTYPE === "MARKER") {
          return marker.olTarget;
        }
      });
      this.getVectorSource().addFeatures(markers);
    }
  };

  // 删除Marker
  this.removeMarker = (...args) => {
    console.log(args);
    if (args.length === 1) {
      // 单参数或者数组
      if (Array.isArray(args[0])) {
        this.removeMarker(...args[0]);
      } else if (
        args[0].JCTYPE === "MARKER" ||
        args[0].JCTYPE === "OVERLAYMARKER"
      ) {
        // removeFeature 时候 触发 change 事件，并且会 remove overlayMarker
        this.getVectorSource().removeFeature(args[0].olTarget);
      }
    } else {
      // 多个参数
      args.forEach((marker) => this.removeMarker(marker));
    }
  };

  // 清空 Markers
  this.clearMarkers = () => {
    // 遍历清空已经渲染 OverlayMarkers
    this.getClusterSource().overlayIds.forEach((id) => {
      const overlayMarker = this.map.getOverlayById(id);
      this.map.removeMarker(overlayMarker);
    });
    this.getClusterSource().overlayIds = []; // 清空overlayMarkers 数据
    this.getVectorSource().clear(); // 清空 Marker集合数据对象
  };

  /* 聚合物放大展开，视野适应地图
   *@param{object}  target  聚合features 对象
   *@param{Array}  	options  组成聚合物的 feature 集合
   *@return {object} target
   *@存在问题，会使 zoom 出现小数
   */

  this.setClusterExtentView = function (target, options = {}) {
    // 所有要素坐标集合
    if (!target || target.JCTYPE !== "ClusterMarker") return;
    const features = target.get("features");
    const coordinates =
      features.length > 1
        ? features.map((r) => r.getGeometry().getCoordinates())
        : features.getGeometry().getCoordinates();

    // 放大地图，让要素刚好出现在视野
    this.getView().fit(boundingExtent(coordinates), {
      maxZoom: this.getMaxZoom(),
      duration: 300,
      padding: [100, 100, 100, 100], // 点要素距离视野边距
      nearest: true,
      ...options,
    });

    return target;
  };

  //事件监听
  this.on = (eventName, callBack = () => {}) => {
    if (!eventName || typeof eventName !== "string")
      throw new Error("请传入正确的 eventName！");
    const JCEventName = !events.includes(eventName)
      ? eventName
      : "JCCluster(" + eventName + ")" + this.getId();
    const eventObject = {
      eventName: JCEventName,
      callBack,
      handler: (e) => {
        if (e.type === "zoomOnClick") {
          this.setClusterExtentView(e.eventTarget);
        }
        e.callBack({
          type: e.eventName,
          target: this,
          event: e.event,
          eventTarget: e.eventTarget,
        });
      },
    };
    // 未绑定过事件
    if (!this.JCEvents.has(eventObject.eventName)) {
      //事件监听-  传递如：JCMarkerCluster(cliclk)
      this.olTarget.on(eventObject.eventName, eventObject.handler);

      //储存事件
      this.JCEvents.set(eventObject.eventName, eventObject);
    } else {
      const currentEventObject = this.JCEvents.get(eventObject.eventName);

      // 移除事件
      this.olTarget.un(
        currentEventObject.eventName,
        currentEventObject.handler
      );

      // 重新设置监听事件
      this.olTarget.on(currentEventObject.eventName, eventObject.handler);

      //储存新事件
      this.JCEvents.set(currentEventObject.eventName, eventObject);
    }
    //设置 JCEvents
    this.olTarget.set("JCEvents", this.JCEvents);
  };

  //事件移除
  this.off = (eventName, callBack = () => {}) => {
    eventName = "JCCluster(" + eventName + ")" + this.getId();

    if (this.JCEvents.has(eventName)) {
      // 获取事件对象
      const currentEventObject = this.JCEvents.get(eventName);

      // 移除事件
      this.olTarget.un(
        currentEventObject.eventName,
        currentEventObject.handler
      );

      // 删除事件存储
      this.JCEvents.delete(eventName);

      this.olTarget.set("JCEvents", this.JCEvents);
      callBack();
    }
  };

  map.markerCluster = this; // map 上添加 markerCluster

  // 注册点击散开事件
  const hasClick = map.JCEvents.some((e) => e.eventName === "zoomOnClick");
  if (!hasClick && this.options) {
    // zoomOnClick 事件监听，-统一 this.on 处理
    this.on("zoomOnClick");
  }
}

export default JCMarkerCluster;
