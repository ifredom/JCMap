import { JCCluster, Marker, OlPoint, OverlayMarker } from './inherit'
import VectorSource from 'ol/source/Vector'
/**
 * 创建聚合物覆盖群
 * @param {*} map
 * @param {*} options
 * @param {*} features
 * @returns
 */
function createMarkerClusterer(map, options, features) {
	const { distance = 40, minDistance = 30 } = options || {}
	const styleCache = {}

	// 创建要素数据来源
	const vectorSource = new VectorSource({
		features
	})
	// 这里是给第一级覆盖物添加的样式， 给聚合添加样式不在这里
	vectorSource.forEachFeature(feature => {
		if (!feature.getContent()) {
			feature.setStyle(createMarkerStyleFn(feature.getStyle()))
		}
	})

	// 创建要素聚合数据来源

	Cluster.prototype.overlaysList = []

	const clusterSource = new Cluster({
		distance: parseInt(distance, 10), // 要素将聚集在一起的距离（以像素为单位）
		minDistance: parseInt(minDistance, 10), //  簇之间的最小距离（以像素为单位）
		source: vectorSource,
		createCluster(point, features) {
			if (features.length == 1) {
				const cluster = new Feature({
					// geometry: point,
					// features: features,

					overlayMarker: features[0].get('overlayMarker')
				})

				return cluster
			} else {
				const cluster = new Feature({
					geometry: point,
					features: features
				})
				return cluster
			}
		}
	})

	const addOverlaysAction = (map, clusterSource, features) => {
		const extent = map.getView().calculateExtent(map.getSize())
		const viewGeometry = fromExtent(extent)
		// console.log(extent)
		// console.log(viewGeometry.getBottomLeft())

		features.forEach(feature => {
			if (!feature.get('features')) {
				const marker = feature.get('overlayMarker')
				if (marker) {
					const id = marker.getId()
					const coordinate = marker.getPosition()
					const inViewGeometry = viewGeometry.intersectsCoordinate(coordinate) // 是否在可视区域内
					if (!clusterSource.overlaysList.includes(id) && inViewGeometry) {
						clusterSource.overlaysList.push(id)
						map.addOverlay(marker)
					}
				}
			}
		}, 100)
	}
	/**
	 * 监听聚合层级变化 ，用于清除聚合状态下 自定义overlays数量
	 */

	clusterSource.on('change', function (e) {
		const features = e.target.getFeatures()
		// 添加先清除所有overlayMarker
		clusterSource.overlaysList.forEach(item => {
			const over = map.getOverlayById(item)
			map.removeOverlays(over)
		})
		clusterSource.overlaysList = []
		clusterSource.dispatchEvent('clusterSource:change')
		if (features.length > 0) {
			// const removeFeatures = []
			// 添加每个聚合物相应的 OverlayMarker
			addOverlaysAction(map, clusterSource, features)
		}
	})

	// 拖动变化-主动触发 clusterSource  change
	map.on('moveend', function (e) {
		// console.log('moveend------------')
		clusterSource.changed()
	})

	// 创建一个图层
	const clusterLayer = new VectorLayer({
		source: clusterSource,
		style: (feature, resolution) => createFeatureStyleFn(styleCache, feature, resolution)
	})
	return clusterLayer
}
