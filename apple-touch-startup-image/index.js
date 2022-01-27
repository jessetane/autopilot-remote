// renders apple-touch-startup-image on demand in browser
if (!window.matchMedia('(display-mode: standalone)').matches) {
  const devicePixelRatio = window.devicePixelRatio || 1
  const deviceWidth = window.screen.width * devicePixelRatio
  const deviceHeight = window.screen.height * devicePixelRatio
  const link = document.querySelector('link[rel="apple-touch-startup-image"]')
  const canvas = document.createElement('canvas')
  canvas.width = deviceWidth
  canvas.height = deviceHeight
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, deviceWidth, deviceHeight)
  const size = 6 * 16 * devicePixelRatio
  ctx.font = `${size}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseLine = 'middle'
  ctx.fillStyle = 'white'
  ctx.fillText(String.fromCodePoint('0x1f9ed'), deviceWidth / 2, deviceHeight / 2 + size / 2.5)
  link.setAttribute('href', canvas.toDataURL())
}
