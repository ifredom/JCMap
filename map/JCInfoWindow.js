import { OlInfoWindow } from './inherit'
/**
   * 覆盖物信息框类
   * @param {*} ?title 常规配置中的标题
   * @param {*} content 自定义html / 常规配置中的内容数据
   * @param {*} offset 偏移
   */
 class JCInfoWindow {
  constructor (option) {
    const {content, title = 'JCMap 信息框', offset = [0, 0], position = 'bottom-center', width = 200, height = 100} = option
    this.events = ['click', 'dblclick', 'contextmenu'] // 支持的事件
    this.clickTimeId = null //单击事件定时器
    this.JCEvents = new Map() // 存储事件
    this.JCTYPE = 'INFOWINDOW'
    this.contentType = this.judgeContentType(content)
    if (this.contentType === 'string') {
      this.olTarget = this.createCommonOverlay(title, content, offset, position, width, height)
    } else {
      this.olTarget = this.createHtmlOverlay(content, offset, position, width, height)
    }
    
    this.defaultEvents()
  }
  /**
   * 用来判断传入的content是什么类型
   */
  judgeContentType (content) {
    let fromPrototype = Object.prototype.toString.call(content)
    if (fromPrototype === '[object String]' || fromPrototype === '[object Number]') {
      // html字符串
      if (content.indexOf('<') >= 0) {
        return 'htmlString'
      } else {
      // 普通字符串
        return 'string'
      }
      // DOM
    } else if (fromPrototype === '[object HTMLDivElement]' || fromPrototype === '[object Undefined]') {
      return 'dom'
    }
  }
  /**
   * 默认事件增加执行
   */
  defaultEvents () {
    if (this.olTarget) {
      let dom = this.olTarget.getElement()
      // 常规配置下的关闭按钮
      dom.querySelector('.title') && dom.querySelector('.title').addEventListener('click', () => {
        this.close()
      })
      // 自定义配置下的关闭按钮
      dom.querySelector('.title-line') && dom.querySelector('.title-line').addEventListener('click', () => {
        this.close()
      })
    }
  }
  /**
   * 获取指定id或者class所对应的dom
   */
  getElementByName (name) {
    return this.olTarget && this.olTarget.getElement().querySelector(name)
  }
  /**
   * 创建常规信息框
   * @returns  Overlay
   */
  createCommonOverlay = (titleString, contentString, offset, position, width, height) => {
    const container = document.createElement('div')
    container.style.backgroundColor = '#fff'
    let singleBox = document.createElement('div')
    singleBox.setAttribute('class', 'single-box')
    let title = document.createElement('div')
    title.setAttribute('class', 'title')
    title.innerText = titleString
    singleBox.appendChild(title)
    let content = document.createElement('div')
    content.setAttribute('class', 'content')
    content.style.width = width + 'px'
    content.style.height = height + 'px'
    content.innerText = contentString
    singleBox.appendChild(content)
    container.appendChild(singleBox)
    const over = new OlInfoWindow({
      element: container,
      offset: offset,
      insertFirst: false,
      stopEvent: true,
      positioning: position
    })
    over.getElement().setAttribute('id', `JC-Overlay`)
    over.getElement().setAttribute('class', 'info-box')
    return over
  }
  /**
   * 创建自定义信息框
   * @returns  Overlay
   */
  createHtmlOverlay = (content, offset, position, width, height) => {
    const container = document.createElement('div')
    container.style.backgroundColor = '#fff'
    container.setAttribute('class', 'content-title')
    container.style.width = width + 'px'
    container.style.height = height + 'px'
    let title = document.createElement('div')
    title.setAttribute('class', 'title-line')
    container.appendChild(title)
    let box = document.createElement('div')
    box.style.height = (height - 16) + 'px'
    box.setAttribute('class', 'html-content')
    if (content) {
      if (this.contentType === 'dom') {
        box.appendChild(content)
      } else if (this.contentType === 'htmlString') {
        box.innerHTML = content
      }
    }
    container.appendChild(box)
    const over = new OlInfoWindow({
      element: container,
      offset: offset,
      insertFirst: false,
      stopEvent: true,
      positioning: position
    })
    over.getElement().setAttribute('id', `JC-Overlay`)
    return over
  }
  
  /**
   * 设置信息框的值
   */
  setContent = (content) => {
    if (this.contentType === 'string') {
      this.getElementByName('.content').innerText = content
    } else if (this.contentType === 'dom') {
      let firstChild = this.getElementByName('.html-content').firstElementChild
      content && this.getElementByName('.html-content').replaceChild(content, firstChild)
    } else if (this.contentType === 'htmlString') {
      this.getElementByName('.html-content').innerHTML = content
    }
  }
  /**
   * 显示信息框
   */
  open = (map, e) => {
    let position = e.getPosition()
    this.olTarget.setPosition(position)
    let id = e.getId()
    this.olTarget.set('id', id)
    this.olTarget.getElement().setAttribute('id', `JC-Overlay-${id}`)
    this.olTarget.getElement().classList.add('jc-infoWindow-display')
    map.add(this)
  }
  /**
   * 隐藏信息框
   */
  close = () => {
    this.olTarget.setPosition(undefined)
  }

  // 事件注册
  on (eventName, callBack = () => {}) {
    if (!eventName || typeof eventName !== 'string') throw new Error('请传入正确的 eventName！')
    if (!this.events.includes(eventName)) return console.warn('无效的事件：' + eventName)

    const eventObject = {
      eventName:  'JCInfoWindow(' + eventName + ')',
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
}

export default JCInfoWindow
