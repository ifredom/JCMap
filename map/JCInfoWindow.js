import { OlInfoWindow } from './inherit'
function createOverlay(center, content, extData, offset, position) {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.backgroundColor = '#fff'
  if (content) {
    container.setAttribute('class', 'content-title')
    container.innerHTML = content
  } else {
    let exit = document.createElement('span')
    let singleBox = document.createElement('div')
    singleBox.setAttribute('class', 'single-box')
    let title = document.createElement('div')
    title.setAttribute('class', 'title')
    singleBox.appendChild(title)
    container.appendChild(singleBox)
  }
  
  
  
  
  
  
  // container.style.zIndex = 10
  const over = new OlInfoWindow({
    element: container,
    position: center,
    positioning: position,
    offset: offset
  })
  const id = extData.id ? extData.id : over.ol_uid
  over.getElement().setAttribute('id', `JC-Overlay-${id}`)
  over.setPosition(center)
  over.set('offset', offset)
  over.set('fixOffset', offset)
  return over
}
/**
   * 覆盖物信息框类
   * @param {*} center 覆盖物经纬度
   * @param {*} content 自定义html
   * @param {*} extData 自定义数据
   * @param {*} offset 偏移
   * @param {*} position 偏移参数 但是感觉目前没有生效
   */
 class JCInfoWindow {
  constructor (option) {
    const {center, content = '', extData = {}, offset = [0, 0], position = 'top-left'} = option
    this.events = ['click', 'dblclick', 'contextmenu'] // 支持的事件
    this.clickTimeId = null //单击事件定时器
    this.JCEvents = new Map() // 存储事件
    this.JCTYPE = 'INFOWINDOW'
    this.olTarget = createOverlay(center, content, extData, offset, position)
    this.getId = this.olTarget.getId.bind(this.olTarget) // 获取overlayId
  }
  
//   set = OlInfoWindow.set.bind() // 通用set工厂方法

//   get = OlInfoWindow.get.bind(OlInfoWindow) // 通用get工厂方法

  

//  setMap = OlInfoWindow.setMap.bind(OlInfoWindow) // 设置要与overlay关联的地图

//   setElement = OlInfoWindow.setElement.bind(OlInfoWindow) // 设置自定义DOM元素

//   getElement = OlInfoWindow.getElement.bind(OlInfoWindow) // 获取自定义DOM元素（html dom结构）

//   setOffset = OlInfoWindow.setOffset.bind(OlInfoWindow) // 设置偏移

//   getOffset = OlInfoWindow.getOffset.bind(OlInfoWindow) // 获取偏移

//   getPosition = OlInfoWindow.getPosition.bind(OlInfoWindow) // 设置经纬度

//   setPosition = OlInfoWindow.setPosition.bind(OlInfoWindow) // 获取经纬度
  
  /**
   * 判断该覆盖物display状态
   * @param {*} e 
   * @returns 
   */
  getDisplay = () => {
    let dom = this.getElement().querySelector('.single-box')
    return getComputedStyle(dom, null)['display']
  }
  /**
   * 显示信息框
   */
   show = (map, position) => {
    this.olTarget.setPosition(position)
    map.add(this)
    // this.getElement().querySelector('.single-box').style.display = 'block'
    // let o = this.get('fixOffset')
    // this.setOffset(o)
    // let zind = getComputedStyle(this.getElement(), null)['z-index']
    // this.getElement().style.zIndex = Number(zind) + 1
  }
  /**
   * 隐藏信息框
   */
   hide = () => {
    this.getElement().querySelector('.single-box').style.display = 'none'
    let imgbox = document.createElement("img") // overlay图标
    imgbox.src = this.get('img')
    let imgOff = [-Math.floor(imgbox.naturalWidth / 2), -imgbox.naturalHeight]
    this.setOffset(imgOff)
    let zind = getComputedStyle(this.getElement(), null)['z-index']
    this.getElement().style.zIndex = Number(zind) - 1
  }

  // 事件注册
  on (eventName, callBack = () => {}) {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
    if (!this.events.includes(eventName)) return console.warn('无效的事件：' + eventName)
    const eventObject = {
      eventName:  'JCInfoWindow(' + eventName + ')' + this.getId(),
      callBack,
      handler: e => {
        e.callBack({
          type: e.eventName,
          target: e.target,
          event: e.event
        })
      }
    }
    // 未绑定过事件
    if (!this.JCEvents.has(eventObject.eventName)) {
      //监听事件 - JCMap 处理成 cliclk
      this.olTarget.on(eventObject.eventName, eventObject.handler)
      //储存事件
      this.JCEvents.set(eventObject.eventName, eventObject)
    } else {
      const currentEventObject = this.JCEvents.get(eventObject.eventName)

      // 移除事件
      this.olTarget.un(currentEventObject.eventName, currentEventObject.handler)

      // 重新设置监听事件
      this.olTarget.on(currentEventObject.eventName, eventObject.handler)

      //储存新事件
      this.JCEvents.set(currentEventObject.eventName, eventObject)
    }
    this.olTarget && this.olTarget.set('JCEvents', this.JCEvents) 
  }
  //事件移除
  off (eventName, callBack = () => {}) {
    eventName =  'JCInfoWindow(' + eventName + ')' + this.getId()
    if (this.JCEvents.has(eventName)) {
      // 获取事件对象
      const currentEventObject = this.JCEvents.get(eventName)
      
      // 移除事件
      this.olTarget.un(currentEventObject.eventName, currentEventObject.handler)

      // 删除事件存储
      this.JCEvents.delete(eventName)
      
      this.olTarget && this.olTarget.set('JCEvents', this.JCEvents)
      callBack()
    }
  }
 
  
}

export default JCInfoWindow
