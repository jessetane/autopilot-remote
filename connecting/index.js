import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const template = document.createElement('template')
template.innerHTML = `<h1>Connecting</h1>
<button id=cancel>Cancel</button>`

class Connecting extends HTMLElement {
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
    // hb(this, {})
  }
  
  onclick (evt) {
    var target = evt.target
    if (target.nodeName !== 'BUTTON') return
    switch (target.id) {
      case 'cancel':
        state.disconnect()
        break
      default:
        console.log('click', target.id)
    }
  }
}

customElements.define('x-connecting', Connecting)
