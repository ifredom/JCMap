import "ol/ol.css";
import JCGraph from "./JCGraph";
import JCMap from "./JCMap";
import JCMarker from "./JCMarker";
import JCMarkerCluster from "./JCMarkerCluster";
import JCOverlay from "./JCOverlay";
import JCNavigationLine from "./JCNavigationLine";
import JCPolyline from "./JCPolyline";

export default {
  Map: JCMap,
  // Point: _JCPoint,
  Marker: JCMarker,
  MarkerCluster: JCMarkerCluster,
  // ZoomSlider: ZoomSlider,
  // Event: new Event(),
  VectorGraph: JCGraph, // 矢量图形类
  // Search: _JCSearch, // 搜索类
  InfoOverlay: JCOverlay, // 信息框覆盖物类
  NavigationLine: JCNavigationLine, // 带箭头轨迹线类
  Polyline: JCPolyline, // 带箭头轨迹线类
};
