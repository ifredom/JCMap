import { OlContextMenu } from './inherit'
/**
 * 右键菜单类
 */
class JCContextMenu {
  constructor (option) {
    const {} = option || {}
    this.JCTYPE = 'ContextMenu'
    this.map = null
    this.curControlStatus = ''
    this.defaultMenuList = [ // 默认菜单栏
      {
        title: '放大一级',
        callBack: () => {
          this.map.setZoomIn()
        }
      },
      {
        title: '缩小一级',
        callBack: () => {
          this.map.setZoomOut()
        }
      }
    ]
    this.olTarget = this.createMenu()
    this.defaultEvents()
    this.menuList = [...this.defaultMenuList]
    this.menuList = new Proxy(this.defaultMenuList, {
      get: (target, key, receiver) => {
        return Reflect.get(target, key, receiver)
      },
      set: (target, key, value, receiver) => {
        
        let flag = Reflect.set(target, key, value, receiver)
        if (flag) {
          if (this.curControlStatus === 'remove' || key !== 'length') {
            this.decorateMenu()
          }
        }
        return true
      }
    })
  }
  /**
   * 添加菜单项
   */
  addMenu (item) {
    this.curControlStatus = 'add'
    this.menuList.push(item)
  }
  /**
   * 移除菜单项
   */
  removeMenu (title) {
    this.curControlStatus = 'remove'
    let ind = this.menuList.findIndex(i => i.title === title)
    this.menuList.splice(ind, 1)
  }
  /**
   * 显示菜单栏
   */
  open (map, e) {
    this.defaultEvents()
    this.olTarget.setPosition(e)
    map.add(this)
    this.map = map
  }
  /**
   * 关闭菜单栏
   */
  close () {
    this.olTarget.setPosition(undefined)
  }
  /**
   * 菜单栏数据修正
   */
  decorateMenu () {
    let ele = this.olTarget.getElement()
    let childs = ele.childNodes
    for (let i = childs.length - 1; i >= 0 ; i--) {
      ele.removeChild(childs[i])
    }
    this.menuList.map(item => {
      const li = document.createElement('div')
      li.innerText = item.title
      li.classList.add('item')
      li.setAttribute('data-title', item.title)
      ele.appendChild(li)
    })
    this.olTarget.getElement().addEventListener('click', (e) => {
      let clickVal = e.target.getAttribute('data-title')
      let curItem = this.menuList.find(item => item.title === clickVal)
      curItem.callBack && curItem.callBack()
      this.close()
    })
  }
  /**
   * 默认事件增加执行
   */
  defaultEvents () {
    // 禁止掉右键默认事件
    document.oncontextmenu = (e) => {
      e.preventDefault()
    }
    // 监听鼠标左键事件 当任意点击时，都关闭此右键菜单栏
    document.onmousedown = (e) => {
      if (e.button === 0) {
        if (e.target.className !== 'item') {
          this.close()
        }
      }
    }
  }
  /**
   * 创建菜单overlay
   */
  createMenu () {
    const container = document.createElement('div')
    container.setAttribute('class', 'JC-ContextMenu-box')
    this.defaultMenuList.map(item => {
      const li = document.createElement('div')
      li.innerText = item.title
      li.classList.add('item')
      li.setAttribute('data-title', item.title)
      container.appendChild(li)
    })
    const menu = new OlContextMenu({
      element: container,
      insertFirst: false,
      stopEvent: true
    })
    return menu
  }
}

export default JCContextMenu
