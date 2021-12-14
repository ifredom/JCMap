import { Control } from 'ol/control';
/**
 * element: 控件dom => 自定义
 * target: 绑定到哪个dom
 * 自定义控件
 */
class JCControl extends Control {
  constructor (option) {
    const { element, target } = option || {}
    element.firstElementChild.classList.add('ol-unselectable', 'ol-control')
    element.style.position = 'absolute'
    element.style.top = '65px'
    element.style.left = '30px'
    super({
      element: element,
      target: target
    })

    this.view = null
    element.addEventListener('click', this.handleRotate.bind(this), false)
  }
  /**
   * 旋转地图
   */
  handleRotate () {
    this.view = this.getMap().getView()
    let num = this.view.getRotation() / (Math.PI / 2) % 4
    switch (num) {
      case 0:
        this.view.setRotation(Math.PI / 2)
        break
      case 1:
        this.view.setRotation(Math.PI)
        break
      case 2:
        this.view.setRotation(Math.PI * 1.5)
        break
      case 3:
        this.view.setRotation(Math.PI * 2)
        break
    }
    
  }
}

export default JCControl
