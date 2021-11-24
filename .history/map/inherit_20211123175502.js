import 'ol/ol.css'
import { Map as _Map, View, Feature } from 'ol'
import { Point } from 'ol/geom'
import Overlay from 'ol/Overlay'

function inheritPrototype(SubClass, SuperClass) {
	const p = Object.create(SuperClass.prototype)
	p.constructor = SubClass
	// 设置子类原型
	SubClass.prototype = p
}

// 继承Map
function OlMap(options) {
	_Map.call(this, options)
}

// 继承View
function OlView(options) {
	View.call(this, options)
}

// 继承Feature
function OlFeature(options) {
	Feature.call(this, options)
}

// 继承Point
function OlPoint(options) {
	Point.call(this, options)
}

// Marker继承Point
function Marker(options) {
	OlFeature.call(this, options)
}

// Marker继承Point
function OverlayMarker(options) {
	Overlay.call(this, options)
}

inheritPrototype(OlPoint, Point)
inheritPrototype(OverlayMarker, Overlay)
inheritPrototype(Marker, Feature)
inheritPrototype(OlFeature, Feature)
inheritPrototype(OlView, View)
inheritPrototype(OlMap, _Map)

export { OlMap, OlView, OlFeature, OlPoint, Marker, OverlayMarker }