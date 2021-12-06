import { Feature, Map as _Map, View } from "ol";
import { Point, LineString } from "ol/geom";
import Overlay from "ol/Overlay";
import Cluster from "ol/source/Cluster";
import Draw from 'ol/interaction/Draw'

function inheritPrototype(SubClass, SuperClass) {
  const p = Object.create(SuperClass.prototype);
  p.constructor = SubClass;
  // 设置子类原型
  SubClass.prototype = p;
}

// 继承Map
function OlMap(options) {
  _Map.call(this, options);
  this.JCTYPE = "OlMap";
}

// 继承View
function OlView(options) {
  View.call(this, options);
  this.JCTYPE = "OlView";
}

// 继承Feature
function OlFeature(options) {
  Feature.call(this, options);
  this.JCTYPE = "OlFeature";
}

// 继承Point
function OlPoint(options) {
  Point.call(this, options);
  this.JCTYPE = "OlPoint";
}

// Marker继承Point
function Marker(options) {
  OlFeature.call(this, options);
  this.JCTYPE = "OlMarker";
}

// Marker继承Point
function OverlayMarker(options) {
  Overlay.call(this, options);
  this.JCTYPE = "OverlayMarker";
}

// OlCluster 继承 Cluster
function OlCluster(options) {
  Cluster.call(this, options);
  this.name = "OlCluster";
  this.overlayIds = []; // 聚合物，单个 overlayMarker 容器
}

function OlOverlay(options) {
  Overlay.call(this, options);
  this.JCTYPE = "OlOverlay";
}

function OlLineString(options) {
  LineString.call(this, options);
  this.JCTYPE = "OlLineString";
}

function OlDraw(options) {
  Draw.call(this, options)
  this.JCTYPE = "OlFeature";
}
inheritPrototype(OlCluster, Cluster);
inheritPrototype(OlPoint, Point);
inheritPrototype(OverlayMarker, Overlay);
inheritPrototype(Marker, Feature);
inheritPrototype(OlFeature, Feature);
inheritPrototype(OlView, View);
inheritPrototype(OlMap, _Map);
inheritPrototype(OlOverlay, Overlay);
inheritPrototype(OlLineString, LineString);
inheritPrototype(OlDraw, Draw)

export {
  OlMap,
  OlView,
  OlFeature,
  OlPoint,
  Marker,
  OverlayMarker,
  OlCluster,
  OlOverlay,
  OlLineString,
  OlDraw
};
