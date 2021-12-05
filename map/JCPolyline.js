import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { OlFeature, OlPoint, OlLineString } from "./inherit";
import { toColorRgba } from "./utils";
import { getUid } from "ol/util";
import arrowRightImg from "../assets/arrowright.svg";

const defaultOptions = {
  path: [], // 点坐标数组
  zIndex: 2, // 覆盖物的叠加顺序
  showDir: true, // 是否显示白色方向箭头
  strokeColor: "#006600", // 线条颜色
  strokeOpacity: 0.9, //  线条透明度
  strokeWeight: 10, //  线条宽度
  strokeStyle: "solid", // 轮廓线样式，实线: solid 虚线:dashed
  strokeDasharray: [], // 轮廓线间隙
  lineCap: "butt", // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
  lineJoin: "round", // 折线拐点的绘制样式，默认值为'round'圆角，其他可选值：'round'圆角、'bevel'斜角
  isOutline: false, // 线条是否带描边，默认false
  borderWeight: 10, // 描边的宽度，默认为1
  outlineColor: "#000000", // 线条描边颜色，此项仅在isOutline为true时有效，默认：#000000
  extData: null, // 自定义信息
};

class JCPolyline {
  constructor(data) {
    const { map, ...otherOptions } = data;

    const options = Object.assign({}, defaultOptions, otherOptions);

    const olTarget = createPolyline(options, map);

    this.JCTYPE = "POLYLINE";

    this.options = options;

    this.olTarget = olTarget;

    this.id = getUid(olTarget);

    this.map = map;

    // 初始化添加到 map 默认图层上
    if (this.map && this.map.JCTYPE === "MAP") {
      this.map.add(this);
    }
  }
}

function createPolyline(options, map) {
  const geoPolyline = new OlLineString(options.path);
  const featurePolyline = new OlFeature({
    geometry: geoPolyline,
    extData: options.extData,
  });

  featurePolyline.setStyle((feature) => {
    const styles = createPolylineStyle(options);
    //箭头样式
    options.showDir &&
      styles.push(
        ...createArrowPolylineStyle(options.path, options.strokeWeight, map)
      );
    return styles;
  });

  // (feature) => {
  return featurePolyline;
}

/**
 * Polyline 箭头样式
 * 用于每次渲染集合体的时候，OL 均会调用此函数以获得自定义样式
 * 存在问题：开始和结尾没有箭头,会有留白
 * @param feature
 * @param res
 * @returns {undefined[]}
 */
const createArrowPolylineStyle1 = function (feature, res) {
  let geometry = feature.getGeometry();
  // let styles = defaultStyles();
  var styles = [
    new Style({
      stroke: new Stroke({
        color: "green",
        width: 6,
      }),
    }),
  ];
  // 如果几何体不是线条，这返回默认样式
  //   if (!(geometry instanceof ol.geom.LineString)) return styles;
  // 得到线条长度
  const length = geometry.getLength();
  // 内部箭头间隔距离（像素）
  const step = 40;
  // 将间隔像素距离转换成地图的真实距离
  // res 是 OL 自动传入的地图比例系数
  const geoStep = step * res;
  // 得到一共需要绘制多少个 箭头
  const arrowNum = Math.ceil(length / geoStep);
  const rotations = [];
  const distances = [0];

  // 分割线条，将折线根据坐标进行分割，并遍历
  // 回调函数将传入开始坐标和结束坐标
  // 利用开始距离和结束距离，得到每段线条的距离和方向信息
  geometry.forEachSegment(function (start, end) {
    let dx = end[0] - start[0];
    let dy = end[1] - start[1];
    let rotation = Math.atan2(dy, dx);
    distances.unshift(Math.sqrt(dx ** 2 + dy ** 2) + distances[0]);
    rotations.push(rotation);
  });
  // console.log(distances);
  // 利用之前计算得到的线段矢量信息，生成对应的点样式塞入默认样式中
  // 从而绘制内部箭头
  for (let i = 1; i < arrowNum; ++i) {
    const arrowCoord = geometry.getCoordinateAt(i / arrowNum);
    const d = i * geoStep;
    const grid = distances.findIndex((x) => x <= d);

    styles.push(
      new Style({
        geometry: new OlPoint(arrowCoord),
        image: new Icon({
          src: arrowRightImg,
          opacity: 0.5,
          anchor: [0.5, 0.5],
          rotateWithView: true,
          // 读取 rotations 中计算存放的方向信息
          rotation: -rotations[distances.length - grid - 1],
        }),
      })
    );
  }

  return styles;
};

/**
 * Polyline 箭头样式
 * 用于每次渲染集合体的时候，OL 均会调用此函数以获得自定义样式
 * @param path
 * @param map
 * @returns {undefined[]}
 */
const createArrowPolylineStyle = function (coords, lineWidth, map) {
  // 内部箭头间隔距离（像素）
  const step = 40;
  let distance = step / 2; //首个点放置在距离起点1/2间隔的位置
  let styles = [];
  // 获取起始像素坐标
  let pixStart = map.getPixelFromCoordinate(coords[0]);
  let pixEnd;
  for (let i = 1; i < coords.length; i++) {
    let coord, coordPix, style;

    // 获取当前第一个箭头位置
    pixEnd = map.getPixelFromCoordinate(coords[i]);
    let distanceStart2end = Math.sqrt(
      Math.pow(pixStart[0] - pixEnd[0], 2) +
        Math.pow(pixStart[1] - pixEnd[1], 2)
    ); //计算收尾在屏幕上的距离
    if (distanceStart2end > distance) {
      //距离大于间隔
      //计算距离开始点位的像素值
      coordPix = [
        (distance * (pixEnd[0] - pixStart[0])) / distanceStart2end +
          pixStart[0],
        (distance * (pixEnd[1] - pixStart[1])) / distanceStart2end +
          pixStart[1],
      ];
      //计算经纬度
      coord = map.getCoordinateFromPixel(coordPix);

      style = new Style({
        geometry: new OlPoint(coord),
        image: new Icon({
          src: arrowRightImg,
          rotateWithView: true,
          // rotation: Math.PI + Math.atan2(pixEnd[1] - pixStart[1], pixEnd[0] - pixStart[0]),
          rotation: Math.atan2(
            pixEnd[1] - pixStart[1],
            pixEnd[0] - pixStart[0]
          ),
          scale: lineWidth / 12,
        }),
      });
      //下次循环开始点为当前点
      pixStart = coordPix;
      distance = step;
      i--;
    } else if (distanceStart2end == distance) {
      //距离等于间隔
      style = new Style({
        geometry: new Point(coords[i]),
        image: new Icon({
          src: arrowRightImg,
          rotateWithView: true,
          // rotation: Math.PI +  Math.atan2(pixEnd[1] - pixStart[1], pixEnd[0] - pixStart[0]),
          rotation: Math.atan2(
            pixEnd[1] - pixStart[1],
            pixEnd[0] - pixStart[0]
          ),
          scale: lineWidth / 12,
          // imgSize:[lineWidth,lineWidth]
        }),
      });
      pixStart = pixEnd;
      distance = step;
    } else {
      //距离小于间隔
      distance = distance - distanceStart2end;
      pixStart = pixEnd;
    }
    style && styles.push(style);
  }
  // console.log(styles);
  return styles;
};

/**
 * Polyline 线条默认样式
 * 用于每次渲染集合体的时候，OL 均会调用此函数以获得自定义样式
 * @param options
 * @param toColorRgba
 * @returns {undefined[]}
 */
const createPolylineStyle = function (options) {
  let lineDash = options.strokeDasharray;
  //处理虚线
  if (options.strokeStyle === "dashed") {
    lineDash = options.strokeDasharray.length
      ? options.strokeDasharray
      : [options.strokeWeight * 2, options.strokeWeight];
  } else {
    lineDash = [0, 0];
  }

  const style = new Style({
    stroke: new Stroke({
      zIndex: options.zIndex,
      color: toColorRgba(options.strokeColor, options.strokeOpacity),
      width: options.strokeWeight,
      lineCap: options.lineCap, // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
      lineJoin: options.lineJoin, // 折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
      lineDash, // 线间隔模式 这个变化与分辨率有关 默认为undefined Internet Explorer 10和更低版本不支持
      lineDashOffset: 0, // 线段间隔偏移 默认0
      miterLimit: 0, // 默认10
    }),
  });

  const styleClone = style.clone();
  styleClone.getStroke().setColor(toColorRgba(options.outlineColor));
  styleClone.getStroke().setWidth(options.strokeWeight + options.borderWeight);
  return options.isOutline ? [styleClone, style] : [style];
};
export default JCPolyline;
