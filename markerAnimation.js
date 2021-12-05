import Feature from 'ol/Feature'
import Polyline from 'ol/format/Polyline'
import { LineString } from 'ol/geom'
import Point from 'ol/geom/Point'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import Map from 'ol/Map'
import 'ol/ol.css'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style'
import View from 'ol/View'
import RBush from 'rbush'

const key = 'Get your own API key at https://www.maptiler.com/cloud/'
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'

const center = [-5639523.95, -3501274.52]

var raster = new TileLayer({
  source: new OSM(),
})
const map = new Map({
  target: document.getElementById('map'),
  view: new View({
    center: center,
    zoom: 10,
    minZoom: 2,
    maxZoom: 19,
  }),
  layers: [
    // new TileLayer({
    //   source: new XYZ({
    //     attributions: attributions,
    //     url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=' + key,
    //     tileSize: 512,
    //   }),
    // }),
    raster,
  ],
})

// The polyline string is read from a JSON similiar to those returned
// by directions APIs such as Openrouteservice and Mapbox.
const styles = {
  route: new Style({
    stroke: new Stroke({
      width: 6,
      color: 'green',
    }),
  }),
  icon: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'data/icon.png',
    }),
  }),
  geoMarker: new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: 'black' }),
      stroke: new Stroke({
        color: 'white',
        width: 2,
      }),
    }),
  }),
}
setTimeout(() => {
  const result = {
    routes: [
      {
        geometry:
          'hldhx@lnau`BCG_EaC??cFjAwDjF??uBlKMd@}@z@??aC^yk@z_@se@b[wFdE??wFfE}NfIoGxB_I\\gG}@eHoCyTmPqGaBaHOoD\\??yVrGotA|N??o[N_STiwAtEmHGeHcAkiA}^aMyBiHOkFNoI`CcVvM??gG^gF_@iJwC??eCcA]OoL}DwFyCaCgCcCwDcGwHsSoX??wI_EkUFmq@hBiOqBgTwS??iYse@gYq\\cp@ce@{vA}s@csJqaE}{@iRaqE{lBeRoIwd@_T{]_Ngn@{PmhEwaA{SeF_u@kQuyAw]wQeEgtAsZ}LiCarAkVwI}D??_}RcjEinPspDwSqCgs@sPua@_OkXaMeT_Nwk@ob@gV}TiYs[uTwXoNmT{Uyb@wNg]{Nqa@oDgNeJu_@_G}YsFw]kDuZyDmm@i_@uyIJe~@jCg|@nGiv@zUi_BfNqaAvIow@dEed@dCcf@r@qz@Egs@{Acu@mCum@yIey@gGig@cK_m@aSku@qRil@we@{mAeTej@}Tkz@cLgr@aHko@qOmcEaJw~C{w@kai@qBchBq@kmBS{kDnBscBnFu_Dbc@_~QHeU`IuyDrC_}@bByp@fCyoA?qMbD}{AIkeAgBk_A_A{UsDke@gFej@qH{o@qGgb@qH{`@mMgm@uQus@kL{_@yOmd@ymBgwE}x@ouBwtA__DuhEgaKuWct@gp@cnBii@mlBa_@}|Asj@qrCg^eaC}L{dAaJ_aAiOyjByH{nAuYu`GsAwXyn@ywMyOyqD{_@cfIcDe}@y@aeBJmwA`CkiAbFkhBlTgdDdPyiB`W}xDnSa}DbJyhCrXitAhT}x@bE}Z_@qW_Kwv@qKaaAiBgXvIm}A~JovAxCqW~WanB`XewBbK{_A`K}fBvAmi@xBycBeCauBoF}}@qJioAww@gjHaPopA_NurAyJku@uGmi@cDs[eRaiBkQstAsQkcByNmaCsK_uBcJgbEw@gkB_@ypEqDoqSm@eZcDwjBoGw`BoMegBaU_`Ce_@_uBqb@ytBwkFqiT_fAqfEwe@mfCka@_eC_UmlB}MmaBeWkkDeHwqAoX}~DcBsZmLcxBqOwqE_DkyAuJmrJ\\o~CfIewG|YibQxBssB?es@qGciA}RorAoVajA_nAodD{[y`AgPqp@mKwr@ms@umEaW{dAmb@umAw|@ojBwzDaaJsmBwbEgdCsrFqhAihDquAi`Fux@}_Dui@_eB_u@guCuyAuiHukA_lKszAu|OmaA{wKm}@clHs_A_rEahCssKo\\sgBsSglAqk@yvDcS_wAyTwpBmPc|BwZknFoFscB_GsaDiZmyMyLgtHgQonHqT{hKaPg}Dqq@m~Hym@c`EuiBudIabB{hF{pWifx@snAw`GkFyVqf@y~BkoAi}Lel@wtc@}`@oaXi_C}pZsi@eqGsSuqJ|Lqeb@e]kgPcaAu}SkDwzGhn@gjYh\\qlNZovJieBqja@ed@siO{[ol\\kCmjMe\\isHorCmec@uLebB}EqiBaCg}@m@qwHrT_vFps@kkI`uAszIrpHuzYxx@e{Crw@kpDhN{wBtQarDy@knFgP_yCu\\wyCwyA{kHo~@omEoYmoDaEcPiuAosDagD}rO{{AsyEihCayFilLaiUqm@_bAumFo}DgqA_uByi@swC~AkzDlhA}xEvcBa}Cxk@ql@`rAo|@~bBq{@``Bye@djDww@z_C_cAtn@ye@nfC_eC|gGahH~s@w}@``Fi~FpnAooC|u@wlEaEedRlYkrPvKerBfYs}Arg@m}AtrCkzElw@gjBbh@woBhR{gCwGkgCc[wtCuOapAcFoh@uBy[yBgr@c@iq@o@wvEv@sp@`FajBfCaq@fIipAdy@ewJlUc`ExGuaBdEmbBpBssArAuqBBg}@s@g{AkB{bBif@_bYmC}r@kDgm@sPq_BuJ_s@{X_{AsK_d@eM{d@wVgx@oWcu@??aDmOkNia@wFoSmDyMyCkPiBePwAob@XcQ|@oNdCoSfFwXhEmOnLi\\lbAulB`X_d@|k@au@bc@oc@bqC}{BhwDgcD`l@ed@??bL{G|a@eTje@oS~]cLr~Bgh@|b@}Jv}EieAlv@sPluD{z@nzA_]`|KchCtd@sPvb@wSb{@ko@f`RooQ~e[upZbuIolI|gFafFzu@iq@nMmJ|OeJn^{Qjh@yQhc@uJ~j@iGdd@kAp~BkBxO{@|QsAfYgEtYiGd]}Jpd@wRhVoNzNeK`j@ce@vgK}cJnSoSzQkVvUm^rSgc@`Uql@xIq\\vIgg@~kDyq[nIir@jNoq@xNwc@fYik@tk@su@neB}uBhqEesFjoGeyHtCoD|D}Ed|@ctAbIuOzqB_}D~NgY`\\um@v[gm@v{Cw`G`w@o{AdjAwzBh{C}`Gpp@ypAxn@}mAfz@{bBbNia@??jIab@`CuOlC}YnAcV`@_^m@aeB}@yk@YuTuBg^uCkZiGk\\yGeY}Lu_@oOsZiTe[uWi[sl@mo@soAauAsrBgzBqgAglAyd@ig@asAcyAklA}qAwHkGi{@s~@goAmsAyDeEirB_{B}IsJuEeFymAssAkdAmhAyTcVkFeEoKiH}l@kp@wg@sj@ku@ey@uh@kj@}EsFmG}Jk^_r@_f@m~@ym@yjA??a@cFd@kBrCgDbAUnAcBhAyAdk@et@??kF}D??OL',
      },
    ],
  }

  const polyline = result.routes[0].geometry
  const route = new Polyline({
    factor: 1e6,
  }).readGeometry(polyline, {
    dataProjection: 'EPSG:4326',
    featureProjection: 'EPSG:3857',
  })

  const routeFeature = new Feature({
    type: 'route',
    geometry: route,
  })
  const startMarker = new Feature({
    type: 'icon',
    geometry: new Point(route.getFirstCoordinate()),
  })
  const endMarker = new Feature({
    type: 'icon',
    geometry: new Point(route.getLastCoordinate()),
  })
  const position = startMarker.getGeometry().clone()
  const geoMarker = new Feature({
    type: 'geoMarker',
    geometry: position,
  })

  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [routeFeature, geoMarker, startMarker, endMarker],
    }),
    // style: function (feature) {
    //   return styles[feature.get('type')];
    // },
    style: styleFunction2,
  })

  map.addLayer(vectorLayer)

  const speedInput = document.getElementById('speed')
  const startButton = document.getElementById('start-animation')
  let animating = false
  let distance = 0
  let lastTime

  function moveFeature(event) {
    const speed = Number(speedInput.value)
    const time = event.frameState.time
    const elapsedTime = time - lastTime
    distance = (distance + (speed * elapsedTime) / 1e6) % 2
    lastTime = time

    const currentCoordinate = route.getCoordinateAt(distance > 1 ? 2 - distance : distance)
    position.setCoordinates(currentCoordinate)
    const vectorContext = event
    vectorContext.setStyle(styles.geoMarker)
    vectorContext.drawGeometry(position)
    // tell OpenLayers to continue the postrender animation
    map.render()
  }
  function getLocalTime(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
  }

  function startAnimation() {
    animating = true
    lastTime = Date.now()
    const marker = vectorLayer.getSource().getFeatures()[1]
    const position = marker.getGeometry().clone()
    startButton.textContent = 'Stop Animation'
    console.log(vectorLayer.getSource().getFeatures())

    console.log(marker)

    vectorLayer.on('postrender', moveFeature)
    // hide geoMarker and trigger map render through change event
    marker.setGeometry(null)
  }

  function stopAnimation() {
    animating = false
    startButton.textContent = 'Start Animation'
    const marker = vectorLayer.getSource().getFeatures()[1]
    // Keep marker at current animation position
    marker.setGeometry(position)
    vectorLayer.un('postrender', moveFeature)
  }

  startButton.addEventListener('click', function () {
    if (animating) {
      stopAnimation()
    } else {
      startAnimation()
    }
  })
}, 500)

function imgToCanvas(src) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const img = new Image()
  img.crossOrigin = 'anonymous' //图片转canvas
  img.src = src
  return new Promise((resolve, reject) => {
    img.onload = function () {
      context.drawImage(img, 0, 0)
      context.getImageData(0, 0, img.width, img.height)
      resolve(canvas)
    }
    img.onerror = function () {
      reject()
    }
  })
}

function styleFunction2(feature, res) {
  //轨迹线图形
  var trackLine = feature.getGeometry()
  var lineStringStyles = [
    new Style({
      stroke: new Stroke({
        lineDash: [8, 4],
        lineDashOffset: 6,
        // lineCap:"butt", //帽样式
        color: '#28F',
        width: 5,
      }),
    }),
  ]

  if (trackLine.getType() === 'LineString') {
    //对segments建立btree索引

    const tree = new RBush()

    // console.log(trackLine.getType())
    trackLine.forEachSegment(function (start, end) {
      var dx = end[0] - start[0]
      var dy = end[1] - start[1]
      //计算每个segment的方向，即箭头旋转方向
      let rotation = Math.atan2(dy, dx)
      let geom = new LineString([start, end])
      let extent = geom.getExtent()
      var item = {
        minX: extent[0],
        minY: extent[1],
        maxX: extent[2],
        maxY: extent[3],
        geom: geom,
        rotation: rotation,
      }
      tree.insert(item)
    })
    //轨迹地理长度
    let length = trackLine.getLength()
    //像素间隔步长
    let stpes = 40 //像素步长间隔
    //将像素步长转实际地理距离步长
    let geo_steps = stpes * res
    //箭头总数
    let arrowsNum = parseInt(length / geo_steps)
    for (let i = 1; i < arrowsNum; i++) {
      let arraw_coor = trackLine.getCoordinateAt((i * 1.0) / arrowsNum)
      let tol = 10 //查询设置的点的容差，测试地图单位是米。如果是4326坐标系单位为度的话，改成0.0001.
      let arraw_coor_buffer = [arraw_coor[0] - tol, arraw_coor[1] - tol, arraw_coor[0] + tol, arraw_coor[1] + tol]
      //进行btree查询

      var treeSearch = tree.search({
        minX: arraw_coor_buffer[0],
        minY: arraw_coor_buffer[1],
        maxX: arraw_coor_buffer[2],
        maxY: arraw_coor_buffer[3],
      })

      let arrow_rotation
      //只查询一个，那么肯定是它了，直接返回
      if (treeSearch.length == 1) arrow_rotation = treeSearch[0].rotation
      else if (treeSearch.length > 1) {
        let results = treeSearch.filter(function (item) {
          //箭头点与segment相交，返回结果。该方法实测不是很准，可能是计算中间结果
          //保存到小数精度导致查询有点问题
          // if(item.geom.intersectsCoordinate(QW arraw_coor))
          //   return true;

          //换一种方案，设置一个稍小的容差，消除精度问题
          let _tol = 1 //消除精度误差的容差
          if (item.geom.intersectsExtent([arraw_coor[0] - _tol, arraw_coor[1] - _tol, arraw_coor[0] + _tol, arraw_coor[1] + _tol])) return true
        })
        if (results.length > 0) arrow_rotation = results[0].rotation
      }

      const arrowIcon = new Icon({
        src: 'assets/arrowright.svg',
        rotateWithView: true,
        rotation: -arrow_rotation,
        scale: 5 / 14,
        // img:canvas,
        // img 设置canvas 图片
      })

      // console.log(arrowIcon.getSrc())
      lineStringStyles.push(
        new Style({
          geometry: new Point(arraw_coor),
          image: arrowIcon,
        })
      )
    }
    // console.log(lineStringStyles)
  } else {
    return styles[feature.get('type')]
  }

  return lineStringStyles
}
