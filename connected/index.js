import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const circle = Math.PI * 2

const template = document.createElement('template')
template.innerHTML = `<div class=row>
  <button id=mode>Standby</button>
  <button id=disconnect>Disconnect</button>
</div>
<div id=heading></div>
<div class=row>
  <button id=left>-1\u00b0</button>
  <button id=right>+1\u00b0</button>
</div>`

class Connected extends HTMLElement {
  constructor () {
    super()
    this.render = this.render.bind(this)
  }

  connectedCallback () {
    this.classList.add('view')
    this.appendChild(template.content.cloneNode(true))
    state.addEventListener('change', this.render)
    this.addEventListener('click', this.onclick)
    this.render()
  }

  disconnectedCallback () {
    state.removeEventListener('change', this.render)
  }

  render () {
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
      '#heading': {
        $text: `${heading === null ? '0' : heading}\u00b0`,
        $attr: { disabled: heading === null ? 'disabled' : null },
      }
    })
  }

  onclick (evt) {
    var target = evt.target
    if (target.nodeName !== 'BUTTON') return
    switch (target.id) {
      case 'mode':
        state.toggleMode()
        break
      case 'left':
        state.changeHeading(-1)
        break
      case 'right':
        state.changeHeading(1)
        break
      case 'disconnect':
        state.disconnect()
    }
  }
}

customElements.define('x-connected', Connected)
