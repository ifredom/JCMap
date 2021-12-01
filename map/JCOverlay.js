// import Overlay from 'ol/Overlay'
import { OlOverlay } from './inherit'
function createOverlay(center, content, extData, img, offset, position) {
  const container = document.createElement('div')
  container.setAttribute('class', 'box-container')
  container.innerHTML = content // 用户自定义盒子
  let imgBox = document.createElement("img") // overlay图标
  imgBox.src = img
  // this.resetOffset = [-Math.floor(imgBox.naturalWidth / 2), -imgBox.naturalHeight]
  container.appendChild(imgBox)
  container.style.zIndex = 10
  const over = new OlOverlay({
    element: container,
    position: center,
    positioning: position,
    offset: offset
  })
  const id = extData.id ? extData.id : over.ol_uid
  over.getElement().setAttribute('id', `JC-Overlay-${id}`)
  over.setPosition(center)
  over.set('img', img)
  over.set('offset', offset)
  over.set('fixOffset', offset)
  return over
}
/**
   * 覆盖物信息框类
   * @param {*} center 覆盖物经纬度
   * @param {*} content 自定义html
   * @param {*} extData 自定义数据
   * @param {*} img overlay标记图标
   * @param {*} offset 偏移
   * @param {*} position 偏移参数 但是感觉目前没有生效
   */
 function JCOverlay(option) {
  const {center, content = '', extData = {}, img = '../assets/image/map/marker.png', offset = [0, 0], position = 'top-left'} = option

  this.OVERLAY = createOverlay(center, content, extData, img, offset, position)

  this.set = this.OVERLAY.set.bind(this.OVERLAY) // 通用set工厂方法

  this.get = this.OVERLAY.get.bind(this.OVERLAY) // 通用get工厂方法

  this.getId = this.OVERLAY.getId.bind(this.OVERLAY) // 获取overlayId

  this.setMap = this.OVERLAY.setMap.bind(this.OVERLAY) // 设置要与overlay关联的地图

  this.setElement = this.OVERLAY.setElement.bind(this.OVERLAY) // 设置自定义DOM元素

  this.getElement = this.OVERLAY.getElement.bind(this.OVERLAY) // 获取自定义DOM元素（html dom结构）

  this.setOffset = this.OVERLAY.setOffset.bind(this.OVERLAY) // 设置偏移

  this.getOffset = this.OVERLAY.getOffset.bind(this.OVERLAY) // 获取偏移

  this.getPosition = this.OVERLAY.getPosition.bind(this.OVERLAY) // 设置经纬度

  this.setPosition = this.OVERLAY.setPosition.bind(this.OVERLAY) // 获取经纬度
  
  /**
   * 判断该覆盖物display状态
   * @param {*} e 
   * @returns 
   */
  this.getDisplay = () => {
    let dom = this.getElement().querySelector('.single-box')
    return getComputedStyle(dom, null)['display']
  }
  /**
   * 显示信息框
   */
   this.show = () => {
    this.getElement().querySelector('.single-box').style.display = 'block'
    let o = this.get('fixOffset')
    this.setOffset(o)
    let zind = getComputedStyle(this.getElement(), null)['z-index']
    this.getElement().style.zIndex = Number(zind) + 1
  }
  /**
   * 隐藏信息框
   */
   this.hide = () => {
    this.getElement().querySelector('.single-box').style.display = 'none'
    let imgbox = document.createElement("img") // overlay图标
    imgbox.src = this.get('img')
    let imgOff = [-Math.floor(imgbox.naturalWidth / 2), -imgbox.naturalHeight]
    this.setOffset(imgOff)
    let zind = getComputedStyle(this.getElement(), null)['z-index']
    this.getElement().style.zIndex = Number(zind) - 1
  }

  

  const events = ['click', 'dblclick', 'contextmenu'] // 支持的事件

  let clickTimeId = null //单击事件定时器

  this.overlayEvents = new Map() // 存储事件
  this.on = (eventName, callBack) => {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
      if (!events.includes(eventName)) return console.warn('无效的事件：' + eventName)
      const element = this.getElement()
      const eventObject = {
        eventName,
        callBack,
        target: element,
        handler: () => {},
      }

      const clickHandler = (e, callBack) => {
        clickTimeId && clearTimeout(clickTimeId)
        clickTimeId = setTimeout(() => {
          callBack && callBack(this)
        }, 200)
      }

      const dblclickHandler = (e, callBack) => {
        clickTimeId && clearTimeout(clickTimeId)
        callBack && callBack(e)
      }

      const contextmenuHandler = (e, callBack) => {
        callBack && callBack(e)
      }

      //事件绑定函数
      const bindEvent = (eventObject) => {
        const { eventName, target, callBack } = eventObject
        // 特殊兼容， 点击图片生效
        let tmp = target.querySelector('img')
        switch (eventName) {
          case 'click':
            eventObject.handler = (e) => clickHandler(e, callBack)
            break
          case 'dblclick':
            eventObject.handler = (e) => dblclickHandler(e, callBack)
            break
          case 'contextmenu':
            eventObject.handler = (e) => contextmenuHandler(e, callBack)
            break
          default:
            break
        }
        tmp.addEventListener(eventName, eventObject.handler)
      }

      // 未绑定过事件
      if (!this.overlayEvents.has(element)) {
        this.overlayEvents.set(element, [eventObject]) //保存监听事件并执行
        bindEvent(eventObject) //绑定事件
      } else {
        //绑定过事件
        const currentEventArray = this.overlayEvents.get(element)
        const currentEventObject = currentEventArray.find((e) => e.eventName === eventName)
        // 未绑定过此事件
        if (!currentEventObject) {
          currentEventArray.push(eventObject)
          bindEvent(eventObject)
        } else {
          //绑定过此事件，移除之前事件绑定再覆盖
          element.removeEventListener(eventName, currentEventObject.handler)
          this.overlayEvents.set(element, [eventObject]) //保存监听事件并执行
          bindEvent(eventObject) //绑定事件
        }
      }

    

    // 点击图片 进行后续操作
    // dom.querySelector('img').addEventListener(type, e => {
    //   callBack && callBack(target, 'overlay')
    // })
  }
  //事件移除
  this.off = (eventName) => {
    const element = this.getElement()
    if (this.overlayEvents.has(element)) {
      const currentEventArray = this.overlayEvents.get(element)
      const currentEventObject = currentEventArray.find((e) => e.eventName === eventName)
      element.removeEventListener(eventName, currentEventObject.handler)
      const newEventArray = currentEventArray.filter((e) => e.eventName !== eventName)
      this.overlayEvents.set(element, newEventArray)
    }
  }
  
}

export default JCOverlay
