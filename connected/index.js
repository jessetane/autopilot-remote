import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const circle = Math.PI * 2

const template = document.createElement('template')
template.innerHTML = `<div class=row>
  <button id=mode>Lock</button>
  <button id=disconnect>Disconnect</button>
</div>
<div id=heading></div>
<div class=row>
  <button id=left>Port</button>
  <button id=right>Starboard</button>
</div>`

class Connected extends HTMLElement {
  constructor () {
  	super()
  	this.render = this.render.bind(this)
  }

  async connectedCallback () {
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
    if (heading === null) {
      heading = NaN
    } else {
      heading = Math.round(heading / 100 / circle * 360) / 100
    }
    hb(this, {
      '#mode,#left,#right': {
        $attr: { disabled: state.mode === null ? 'disabled' : null },
      },
      '#mode': state.mode ? 'Unlock' : 'Lock',
      '#heading': `${isNaN(heading) ? '0' : heading}\u00b0`
    })
  }

  async onclick (evt) {
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
