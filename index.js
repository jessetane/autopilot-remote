import state from './state/index.js'
import './disconnected/index.js'
import './connecting/index.js'
import './connected/index.js'
import './failure/index.js'

class App extends HTMLElement {
  constructor () {
    super()
    this.render = this.render.bind(this)
  }

  connectedCallback () {
    state.addEventListener('change', this.render)
    this.render()
  }

  render () {
    let nodeName = null
    if (state.error) {
      nodeName = 'x-failure'
    } else if (state.socket) {
      if (state.socket.readyState === 1) {
        nodeName = 'x-connected'
      } else {
        nodeName = 'x-connecting'
      }
    } else {
      nodeName = 'x-disconnected'
    }
    nodeName = nodeName.toUpperCase()
    if (!this.firstElementChild || this.firstElementChild.nodeName !== nodeName) {
      if (this.firstElementChild) {
        this.firstElementChild.remove()
      }
      this.appendChild(
        document.createElement(nodeName)
      )
    }
  }
}

customElements.define('x-app', App)

window.app = document.querySelector('x-app')
