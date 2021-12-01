import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector'
import { Feature, Map as _Map, View } from 'ol'
import Draw from 'ol/interaction/Draw';
import { Fill, Icon, Style, Text } from 'ol/style'
import { Point,LineString } from 'ol/geom'
import RBush from 'rbush';
 // Open Street Map地图
 var raster = new TileLayer({    
  source: new OSM()
});

// 用于绘制线串的矢量图层源
var source = new VectorSource();

// 用于绘制线串的矢量图层
var vector = new VectorLayer({
  source: source,
  style: styleFunction2
});

var map = new _Map({
  target: 'map',
  layers: [
      raster, vector
  ],
  view: new View({
      center: [-11000000, 4600000],
      zoom: 4
  })
});

// 添加一个绘制线串的控件
map.addInteraction(new  Draw({
  source: source,
  type: 'LineString'
}));

// 用于设置线串所在的矢量图层样式的函数
var styleFunction = function(feature){
  var geometry = feature.getGeometry();
  var styles = [
      new Style({                    // 线串的样式
          stroke: new Stroke({
              color: '#FC3',
              width: 2
          })
      })
  ];
  




  // 对线段的每一个子线段都设置箭头样式
  geometry.forEachSegment(function(start, end){
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);      // 获取子线段的角度（弧度）
      //arrows
      styles.push(new Style({        // 与线串的各个子线段对应的样式
          geometry: new Point(end),
          image: new Icon({
              src: 'data/arrow.png',
              anchor: [0.75, 0.5],        // 图标锚点
              rotateWithView: true,       // 与地图视图一起旋转
              // 设置子线段箭头图标样式的角度
              rotation: rotation         // 因为角度以顺时针旋转为正值，所以前面添加负号
          })
      }));
  });

  return styles;
};
var styleFunction2 = function(feature,res){
  //轨迹线图形
 var trackLine= feature.getGeometry();
 var styles = [
    new Style({
      stroke: new Stroke({
        color: '#2E8B57',
        width: 10
      })
    })
  ];
  //对segments建立btree索引
  let tree= RBush();//路段数
  trackLine.forEachSegment(function(start, end) {
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      //计算每个segment的方向，即箭头旋转方向
      let rotation = Math.atan2(dy, dx);
      let geom=new LineString([start,end]);
      let extent=geom.getExtent();
      var item = {
        minX: extent[0],
        minY: extent[1],
        maxX: extent[2],
        maxY: extent[3],
        geom: geom,
        rotation:rotation
      };
      tree.insert(item);
  });
  //轨迹地理长度
  let length=trackLine.getLength();
  //像素间隔步长
  let stpes=40;//像素步长间隔
  //将像素步长转实际地理距离步长
  let geo_steps=stpes*res;
  //箭头总数
  let arrowsNum=parseInt(length/geo_steps);
  for(let i=1;i<arrowsNum;i++){
      let arraw_coor=trackLine.getCoordinateAt(i*1.0/arrowsNum);
      let tol=10;//查询设置的点的容差，测试地图单位是米。如果是4326坐标系单位为度的话，改成0.0001.
      let arraw_coor_buffer=[arraw_coor[0]-tol,arraw_coor[1]-tol,arraw_coor[0]+tol,arraw_coor[1]+tol];
      //进行btree查询
      var treeSearch = tree.search({
        minX: arraw_coor_buffer[0],
        minY: arraw_coor_buffer[1],
        maxX: arraw_coor_buffer[2],
        maxY: arraw_coor_buffer[3]
      });
      let arrow_rotation;
      //只查询一个，那么肯定是它了，直接返回
      if(treeSearch.length==1)
        arrow_rotation=treeSearch[0].rotation;
      else if(treeSearch.length>1){
          let results=treeSearch.filter(function(item){
            //箭头点与segment相交，返回结果。该方法实测不是很准，可能是计算中间结果
            //保存到小数精度导致查询有点问题
            // if(item.geom.intersectsCoordinate(arraw_coor))
            //   return true;

            //换一种方案，设置一个稍小的容差，消除精度问题
            let _tol=1;//消除精度误差的容差
            if(item.geom.intersectsExtent([arraw_coor[0]-_tol,arraw_coor[1]-_tol,arraw_coor[0]+_tol,arraw_coor[1]+_tol]))
              return true;
          })
          if(results.length>0)
            arrow_rotation=results[0].rotation;
      }
      styles.push(new Style({
          geometry: new Point(arraw_coor),
          image: new Icon({
            src: '../static/content/images/arrowright.png',
            anchor: [0.75, 0.5],
            rotateWithView: true,
            rotation: -arrow_rotation
          })
      }));
  }
  console.log(styles);
  return styles;
}