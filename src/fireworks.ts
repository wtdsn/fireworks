interface ConstructorOption {
  select: string
  width?: number
  height?: number,
  autoResize?: boolean
}

class UpPathNode {
  public opacity: number
  constructor(public x0: number, public y0: number, public x: number, public y: number) {
    this.opacity = 1
  }
}


class Fireworks {
  private con: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number

  private status: 'open' | 'close'
  private upPaths: Array<UpPathNode>

  constructor(option: ConstructorOption) {
    // 初始化数据
    const { select, width, height, autoResize } = option
    let _con = document.querySelector(select) as HTMLElement | null
    if (!_con) {
      throw Error(`element ${select} not found`)
    }
    this.con = _con

    // 添加 canvas
    this.canvas = document.createElement('canvas')
    this.canvas.style.display = 'block'
    this.con.appendChild(this.canvas)

    const ctx = this.canvas?.getContext('2d')!
    if (!ctx) {
      this.con.innerText = '你的浏览器似乎不支持 canvas'
    }

    ctx.lineWidth = 8
    ctx.strokeStyle = '#fff'

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    this.ctx = ctx

    // 需要在初始化 canvas 后调用
    this.width = 0
    this.height = 0
    this.resize(width, height)

    this.status = 'close'
    this.upPaths = []

    if (autoResize) {
      window.addEventListener('resize', this.resize.bind(this, undefined, undefined))
    }
  }

  // 根据容器大小调整，如果有传入大小，则使用参数的大小
  resize(width?: number, height?: number) {
    this.width = width || parseInt(window.getComputedStyle(this.con!).width)
    this.height = height || parseInt(window.getComputedStyle(this.con!).height)

    this.canvas.width = this.width
    this.canvas.height = this.height

    this.ctx.fillStyle = '#000'
    this.ctx.strokeStyle = '#fff'

    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  listen() {
    this.con.addEventListener('click', this.start.bind(this))
    return this
  }

  start() {
    if (this.status === 'open') return
    this.status = 'open'
    const ctx = this.ctx

    ctx.moveTo(0, this.height)
    ctx.beginPath()

    this.upPaths = [new UpPathNode(0, this.height, ...this.getNextPosi(0))]
    this.drawUp()
  }

  getNextPosi(preX: number): [number, number] {
    // y =  ax^2 + bx + c
    // a = -2h/w^2
    // b = 2h/w
    // c = -h
    let x = getNextX(preX, this.width / 2)
    let w = this.width
    let h = this.height
    let y = -(2 * h / w ** 2) * x ** 2 + (2 * h / w) * x - h
    return [x, -y]
  }

  drawUp() {
    let { x, y } = this.upPaths[this.upPaths.length - 1]

    if (x < this.width / 2) {
      this.upPaths.push(new UpPathNode(x, y, ...this.getNextPosi(x)))
    }

    let ctx = this.ctx

    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillRect(0, 0, this.width, this.height)

    this.upPaths = this.upPaths.filter((node) => {
      const { x0, y0, x, y } = node
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x, y)
      ctx.globalAlpha = node.opacity
      ctx.closePath()
      ctx.stroke()
      node.opacity -= 0.05

      if (node.opacity <= 0) return false
      return true
    })


    if (this.upPaths.length) {
      window.requestAnimationFrame(this.drawUp.bind(this))
    } else {
      this.status = 'close'
    }
  }
}

function getNextX(cur: number, target: number) {
  let move = (target - cur) / 50
  if (move < 8) {
    if (move <= 0) return target
    move = 8
  }
  return cur += move
}

export default Fireworks
