const { g } = require('gelerator')

const maxLenNum = (aNum, bNum) => (aNum > bNum ? aNum : bNum).toString().length

const num2PadNumArr = (num, len) => {
  const padLeftStr = (rawStr, lenNum) => (rawStr.length < lenNum ?
    padLeftStr('0' + rawStr, lenNum) :
    rawStr)
  const str2NumArr = rawStr => rawStr.split('').map(Number)
  return str2NumArr(padLeftStr(num.toString(), len)).reverse()
}

module.exports = class flip {
  constructor({
    node,
    from,
    to,
    duration,
    delay,
    easeFn,
    systemArr
  }) {
    this.beforeArr = []
    this.afterArr = []
    this.ctnrArr = []
    this.duration = (duration || 1) * 1000
    this.systemArr = systemArr || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    this.easeFn = easeFn || (pos => (pos /= .5) < 1
                              ? .5 * Math.pow(pos, 3)
                              : .5 * (Math.pow((pos - 2), 3) + 2))
    this.from = from || 0
    this.to = to || 0
    this.node = node
    this._initHTML(maxLenNum(this.from, this.to))
    if (!to) return
    if (delay) setTimeout(() => {this.flipTo({to: this.to})}, delay * 1000)
    else this.flipTo({to: this.to})
  }

  _initHTML(digits) {
    this.node.classList.add('number-flip')
    this.node.style.position = 'relative'
    this.node.style.overflow = 'hidden'
    ;[...Array(digits).keys()].forEach(i => {
      const ctnr = g(`ctnr ctnr${i}`)(
        ...this.systemArr.map(i => g('digit')(i)),
        g('digit')(this.systemArr[0])
      )
      ctnr.style.position = 'relative'
      ctnr.style.display = 'inline-block'
      this.ctnrArr.unshift(ctnr)
      this.node.appendChild(ctnr)
      this.beforeArr.push(0)
    })
    this.height = this.ctnrArr[0].clientHeight / (this.systemArr.length + 1)
    this.node.style.height = this.height + 'px'
    for (let d = 0, len = this.ctnrArr.length; d < len; d += 1)
      this._draw({
        digit: d,
        per: 1,
        alter: ~~(this.from / Math.pow(10, d))
      })
  }

  _draw({per, alter, digit}) {
    const from = this.beforeArr[digit]
    const modNum = ((per * alter + from) % 10 + 10) % 10
    this.ctnrArr[digit].style.transform = `translateY(${- modNum * this.height}px)`
  }

  flipTo({
    to,
    duration,
    easeFn,
    direct
  }) {
    const len = this.ctnrArr.length
    this.beforeArr = num2PadNumArr(this.from, len)
    this.afterArr = num2PadNumArr(to, len)
    const draw = per => {
      let temp = 0
      for (let d = this.ctnrArr.length - 1; d >= 0; d -= 1) {
        let alter = this.afterArr[d] - this.beforeArr[d]
        temp += alter
        const fn = easeFn || this.easeFn
        this._draw({
          digit: d,
          per: fn(per),
          alter: direct ? alter : temp
        })
        temp *= 10
      }
    }
    const start = performance.now()
    const dur = duration || this.duration
    requestAnimationFrame(tick = now => {
      let elapsed = now - start
      draw(elapsed / dur)
      if (elapsed < dur) requestAnimationFrame(tick)
      else {
        this.from = to
        draw(1)
      }
    })
  }
}