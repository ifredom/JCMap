import JC from './map/index'


const map = new JC.Map('map', {
	center: [116.478935, 39.997761],
	zoom: 17,
})

const options = {
	datas:  [[116.478935,39.997761],[116.478939,39.997825],[116.478912,39.998549],[116.478912,39.998549],[116.478998,39.998555],[116.478998,39.998555],[116.479282,39.99856],[116.479658,39.998528],[116.480151,39.998453],[116.480784,39.998302],[116.480784,39.998302],[116.481149,39.998184],[116.481573,39.997997],[116.481863,39.997846],[116.482072,39.997718],[116.482362,39.997718],[116.483633,39.998935],[116.48367,39.998968],[116.484648,39.999861]]
}

new JC.NavigationLine(options, map)

const marker = new JC.Marker({
	map: map,
	position: [116.478935,39.997761],
	img: "https://webapi.amap.com/images/car.png",
	offset:  [-26, -13],
	autoRotation: true,
	rotation: -90,
});

// 按照此轨迹线行驶
// marker.moveAlong(options.datas, 200);
let index = 0
 
// setInterval(()=>{
// 	const position = options.datas[index++]
// 	console.log(position);
// 	marker.setPosition(position)
// },300)

// marker.on('moving', function (e) {
// 	// passedPolyline.setPath(e.passedPath);
// });


// 高德地图例子
// https://lbs.amap.com/demo/javascript-api/example/marker/replaying-historical-running-data/
// marker.on('moving', function (e) {
// 	passedPolyline.setPath(e.passedPath);
// });