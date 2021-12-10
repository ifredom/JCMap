import 'ol/ol.css'
import './animation.css'

import JCGraph from './JCGraph'
import JCMap from './JCMap'
import JCMarker from './JCMarker'
import JCMarkerCluster from './JCMarkerCluster'
import JCInfoWindow from './JCInfoWindow'
import JCPolyline from './JCPolyline'
import JCControl from './JCControl'
import JCContextMenu from './JCContextMenu'

export default {
  Map: JCMap,
  // Point: _JCPoint,
  Marker: JCMarker,
  MarkerCluster: JCMarkerCluster,
  // ZoomSlider: ZoomSlider,
  // Event: new Event(),
  VectorGraph: JCGraph, // 矢量图形类
  // Search: _JCSearch, // 搜索类
  InfoWindow: JCInfoWindow, // 信息框类
  Polyline: JCPolyline, // 带箭头轨迹线类
  Control: JCControl, // 自定义控件类
  ContextMenu: JCContextMenu, // 右键菜单类
}
