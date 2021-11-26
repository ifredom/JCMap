import 'ol/ol.css'
import { Map as _Map, View, Feature } from 'ol'
import { Point } from 'ol/geom'
import Overlay from 'ol/Overlay'
import Cluster from 'ol/source/Cluster'

function inheritPrototype(SubClass, SuperClass) {
	const p = Object.create(SuperClass.prototype)
	p.constructor = SubClass
	// 设置子类原型
	SubClass.prototype = p
}

// 继承Map
function OlMap(options) {
	_Map.call(this, options)
	this.JCTYPE = 'OlMap'
}

// 继承View
function OlView(options) {
	View.call(this, options)
	this.JCTYPE = 'OlView'
}

// 继承Feature
function OlFeature(options) {
	Feature.call(this, options)
	this.JCTYPE = 'OlFeature'
}

// 继承Point
function OlPoint(options) {
	Point.call(this, options)
	this.JCTYPE = 'OlPoint'
}

// Marker继承Point
function Marker(options) {
	OlFeature.call(this, options)
	this.JCTYPE = 'Marker'
}

// Marker继承Point
function OverlayMarker(options) {
	Overlay.call(this, options)
	this.JCTYPE = 'OverlayMarker'
}

// OlCluster 继承 Cluster
function OlCluster(options) {
	Cluster.call(this, options)
	this.name = 'OlCluster'
	this.overlaysList = [] // 聚合物，单个 overlayMarker 容器
}

inheritPrototype(OlCluster, Cluster)
inheritPrototype(OlPoint, Point)
inheritPrototype(OverlayMarker, Overlay)
inheritPrototype(Marker, Feature)
inheritPrototype(OlFeature, Feature)
inheritPrototype(OlView, View)
inheritPrototype(OlMap, _Map)

export { OlMap, OlView, OlFeature, OlPoint, Marker, OverlayMarker, OlCluster }
