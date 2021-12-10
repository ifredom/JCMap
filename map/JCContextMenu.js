import { OlContextMenu } from './inherit'
/**
 * 右键菜单类
 */
class JCContextMenu {
  constructor (option) {
    const {} = option || {}
    this.JCTYPE = 'ContextMenu'
    this.map = null
    this.menuList = [
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
    this.menuList = this.menuList.map((item, index) => {
      return {
        id: `item${index}`,
        ...item
      }
    })
    this.olTarget = this.createMenu()
    this.defaultEvents()
  }
  /**
   * 添加菜单项
   */
  addMenu () {

  }
  /**
   * 移除菜单项
   */
  removeMenu () {

  }
  /**
   * 显示菜单栏
   */
  open (map, e) {
    this.olTarget.setPosition(e)
    map.add(this)
    this.map = map
    // this.decorateMenu(map)
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
  // decorateMenu (map) {
  //   this.menuList = this.menuList.map(item => {
  //     return {
  //       ...item,
  //       callBack: () => {

  //       }
  //     }
  //   })
  // }
  /**
   * 默认事件增加执行
   */
  defaultEvents () {
    // 禁止掉右键默认事件
    document.oncontextmenu = () => {
      return false
    }
    // 监听鼠标左键事件 当任意点击时，都关闭此右键菜单栏
    document.onmousedown = (e) => {
      if (e.button === 0) {
        if (e.target.className !== 'item') {
          this.close()
        }
      }
    }
    this.olTarget.getElement().addEventListener('click', (e) => {
      let curItem = this.menuList.find(item => item.id === e.target.id)
      curItem.callBack && curItem.callBack()
      this.close()
    })
  }
  /**
   * 创建菜单overlay
   */
  createMenu () {
    const container = document.createElement('div')
    container.setAttribute('class', 'JC-ContextMenu-box')
    this.menuList.map(item => {
      const li = document.createElement('div')
      li.innerText = item.title
      li.classList.add('item')
      li.setAttribute('id', item.id)
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
