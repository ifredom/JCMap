import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Circle as CircleStyle, Icon, Fill, Stroke, Style } from "ol/style";
import VectorSource from "ol/source/Vector";
import { fromLonLat, transform } from "ol/proj";
import { getUid } from "ol/util";
import { Vector as VectorLayer } from "ol/layer";
import * as turf from "@turf/turf";
import GPS from "./gps";

/**
 * 绘制带方向箭头导航线
 * @param {*} opt.style  线的样式
 * @param {*} opt.datas  生成线的坐标点数组
 * @param {*} opt.id  		id
 * @param {*} map 			jc地图实列
 */

class JCNavigationLine {
  constructor(opt, map) {
    this.id = opt.id ? opt.id : getUid(opt);
    this.datas = opt.datas;
    this.olMap = map.olTarget;
    this.points_extent = new Array(4);
    this.viewZoom = map.getView().getZoom();
    this.default_style_opt = {
      line_width: 6,
      line_stroke: "#459c50",
      interval: 40,
    };
    this.style = Object.assign({}, this.default_style_opt, opt.style);
    this.init();
    this.addData();
  }
  init() {
    this.olSource_line = new VectorSource();
    this.olLayer_line = new VectorLayer({
      className: "jc-navigationLine-layer",
      source: this.olSource_line,
      zIndex: 1,
      style: (feature) => {
        if (feature.getGeometry().getType() === "LineString") {
          let coords = feature.getGeometry().getCoordinates();
          return [
            new Style({
              stroke: new Stroke({
                color: this.style.line_stroke,
                width: this.style.line_width,
              }),
            }),
            ...this.getPointsStyle(coords),
          ];
        } else {
          return new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: "black" }),
              stroke: new Stroke({
                color: "white",
                width: 2,
              }),
            }),
          });
        }
      },
    });

    this.olMap.addLayer(this.olLayer_line);
  }
  addData() {
    //添加线
    let feas = [];

    // this.datas.forEach(item => {
    // 	let coords = item.map(data_ => {
    // 		// return transform([data_.lon, data_.lat], 'EPSG:4326', 'EPSG:3857')
    // 		return  ([data_.lon, data_.lat])
    // 	})
    // 	console.log(coords);
    // 	this.geo_line = new LineString(coords)
    // 	let fea_line = new Feature({
    // 		geometry: this.geo_line
    // 	})
    // 	feas.push(fea_line)

    // })

    const coords = this.datas.map((item) => {
      // return item
      const lonLat = GPS.gcj_encrypt(item[0], item[1]);
      return [lonLat.lat, lonLat.lon];
    });

    // console.log(coords);
    this.geo_line = new LineString(coords);
    let fea_line = new Feature({
      geometry: this.geo_line,
    });
    feas.push(fea_line);
    // console.log(this.datas);
    this.olSource_line.addFeatures(feas);
  }
  getStartPoint() {
    return this.datas[0];
  }
  getfeaLine() {
    return this.olSource_line.getFeatures();
  }
  getPointsStyle(coords) {
    let this_ = this;
    let styles = [];
    let extent_ = this.getPointExtent();
    let line_ = turf.lineString(coords);
    let line_clip_arr = turf.bboxClip(line_, extent_);
    if (line_clip_arr && line_clip_arr.geometry) {
      if (line_clip_arr.geometry.type == "LineString") {
        let style_ = this_.getPointsByLine(line_clip_arr.geometry.coordinates);
        styles.push(...style_);
      } else if (line_clip_arr.geometry.type == "MultiLineString") {
        line_clip_arr.geometry.coordinates.forEach((coords) => {
          let style_ = this_.getPointsByLine(coords);
          styles.push(...style_);
        });
      }
    }
    return styles;
  }
  getPointsByLine(coords) {
    let this_ = this;
    let styles = [];
    let distance_ = this_.style.interval / 2; //首个点放置在距离起点1/2间隔的位置
    let pix_start = this_.olMap.getPixelFromCoordinate(coords[0]);
    let pix_end;
    for (let i = 1; i < coords.length; i++) {
      let coord_, coord_pix;
      let style_;
      pix_end = this_.olMap.getPixelFromCoordinate(coords[i]);
      let dis_start2end = Math.sqrt(
        Math.pow(pix_start[0] - pix_end[0], 2) +
          Math.pow(pix_start[1] - pix_end[1], 2)
      ); //计算收尾在屏幕上的距离
      if (dis_start2end > distance_) {
        //距离大于间隔
        //计算距离开始点位的像素值
        coord_pix = [
          (distance_ * (pix_end[0] - pix_start[0])) / dis_start2end +
            pix_start[0],
          (distance_ * (pix_end[1] - pix_start[1])) / dis_start2end +
            pix_start[1],
        ];
        //计算经纬度
        coord_ = this_.olMap.getCoordinateFromPixel(coord_pix);

        style_ = new Style({
          geometry: new Point(coord_),
          image: new Icon({
            src: "assets/arrowright.svg",
            rotateWithView: true,
            // rotation: Math.PI + Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0]),
            rotation: Math.atan2(
              pix_end[1] - pix_start[1],
              pix_end[0] - pix_start[0]
            ),
            scale: this.style.line_width / 12,
            // imgSize:[this.style.line_width,this.style.line_width]
          }),
        });
        // console.log(
        //   Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0])
        // );
        //下次循环开始点为当前点
        pix_start = coord_pix;
        distance_ = this_.style.interval;
        i--;
      } else if (dis_start2end == distance_) {
        //距离等于间隔
        style_ = new Style({
          geometry: new Point(coords[i]),
          image: new Icon({
            src: "assets/arrowright.svg",
            rotateWithView: true,
            // rotation: Math.PI +  Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0]),
            rotation: Math.atan2(
              pix_end[1] - pix_start[1],
              pix_end[0] - pix_start[0]
            ),
            scale: this.style.line_width / 12,
            // imgSize:[this.style.line_width,this.style.line_width]
          }),
        });
        pix_start = pix_end;
        distance_ = this_.style.interval;
      } else {
        //距离小于间隔
        distance_ = distance_ - dis_start2end;
        pix_start = pix_end;
      }
      style_ && styles.push(style_);
    }
    return styles;
  }
  getPointExtent(n) {
    n = n ? n : 1.2;
    let view = this.olMap.getView();
    let mapsize = this.olMap.getSize().map((it_) => {
      return it_ * n;
    });
    return view.calculateExtent(mapsize);
  }
}

export default JCNavigationLine;
