import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const template = document.createElement('template')
template.innerHTML = `<h1></h1>
<button id=reconnect>Reconnect</button>
<button id=disconnect>Disconnect</button>
<button id=wait>Wait</button>`

class Failure extends HTMLElement {
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
    let reason = state.error.message
    if (reason) {
      reason = reason[0].toUpperCase() + reason.slice(1)
    }
    hb(this, {
      'h1': reason,
      '#reconnect': { $class: { hidden: state.socket }},
      '#wait': { $class: { hidden: !state.socket }}
    })
  }
  
  async onclick (evt) {
    var target = evt.target
    if (target.nodeName !== 'BUTTON') return
    delete state.error
    switch (target.id) {
      case 'reconnect':
        state.connect()
        break
      case 'disconnect':
        state.disconnect()
        break
      case 'wait':
        state.wait()
        break
    }
  }
}

customElements.define('x-failure', Failure)
