import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const circle = Math.PI * 2

const template = document.createElement('template')
template.innerHTML = `<div class=row>
  <button id=mode>Standby</button>
  <button id=disconnect>Disconnect</button>
</div>
<div id=heading>
  <div id=value></div>
  <div id=displacement class=hidden>+1</div>
</div>
<div class=row>
  <button id=left>-1\u00b0</button>
  <button id=right>+1\u00b0</button>
</div>`

class Connected extends HTMLElement {
  constructor () {
    super()
    this.direction = 'left'
    this.multiplier = 0
    this.render = this.render.bind(this)
  }

  connectedCallback () {
    this.classList.add('view')
    this.appendChild(template.content.cloneNode(true))
    state.addEventListener('change', this.render)
    this.addEventListener('mousedown', this.onmouseDown)
    this.addEventListener('mouseup', this.onmouseUp)
    this.addEventListener('touchstart', this.onmouseDown)
    this.addEventListener('touchcancel', this.onmouseUp)
    this.addEventListener('touchend', this.onmouseUp)
    this.render()
  }

  disconnectedCallback () {
    clearTimeout(this.multiplierTimeout)
    state.removeEventListener('change', this.render)
  }

  render () {
    let multiplier = this.multiplier === 0 ? 1 : this.multiplier
    let heading = state.mode === true ? state.headingLocked : state.heading
    if (heading !== null) {
      heading = Math.round(heading / 10000 / circle * 360)
    }
    hb(this, {
      '#mode': {
        $text: state.mode ? 'Auto' : 'Standby',
        $class: { red: !state.mode, white: state.mode },
        $attr: { disabled: heading === null ? 'disabled' : null }
      },
      '#left,#right': {
        $attr: { disabled: !state.mode ? 'disabled' : null },
      },
      '#heading #value': {
        $text: `${heading === null ? '0' : heading}\u00b0`,
        $attr: { disabled: heading === null ? 'disabled' : null },
      },
      '#heading #displacement': {
        $text: `${this.direction === 'left' ? '-' : '+'}${multiplier}\u00b0`,
        $class: { hidden: this.multiplier === 0 }
      }
    })
  }

  onmouseDown (evt) {
    evt.preventDefault()
    var target = evt.target
    if (target.nodeName !== 'BUTTON' || target.disabled) return
    switch (target.id) {
      case 'left':
      case 'right':
        this.direction = target.id
        this.setMultiplierTimeout()
    }
  }

  onmouseUp (evt) {
    clearTimeout(this.multiplierTimeout)
    if (this.multiplier > 0) {
      this.multiplierTimeout = setTimeout(() => {
        this.multiplier = 0
        this.render()
      }, 500)
    }
    let target = evt.target
    let multiplier = this.multiplier === 0 ? 1 : this.multiplier
    if (target.nodeName !== 'BUTTON') return
    switch (target.id) {
      case 'mode':
        state.toggleMode()
        break
      case 'left':
        state.changeHeading(-multiplier)
        break
      case 'right':
        state.changeHeading(multiplier)
        break
      case 'disconnect':
        state.disconnect()
    }
  }

  setMultiplierTimeout () {
    clearTimeout(this.multiplierTimeout)
    this.multiplierTimeout = setTimeout(() => {
      if (this.multiplier === 0) {
        this.multiplier = 5
      } else if (this.multiplier === 5) {
        this.multiplier = 10
      } else {
        this.multiplier += 10
      }
      this.setMultiplierTimeout()
      this.render()
    }, 500)
  }
}

customElements.define('x-connected', Connected)
