import state from '../state/index.js'
import hb from '/modules/hyperbind/index.js'

const template = document.createElement('template')
template.innerHTML = `<h1><div id=icon>${String.fromCodePoint(0x1F9ED)}</div>Autopilot Remote</h1><form>
  <label id=tls>
    <input name=secure type=checkbox>
    <span>Use TLS</span>
  </label>
  <input name=host placeholder=Host type=text autocapitalize=off autocomplete=off>
  <input name=preSharedKey placeholder=Password type=password>
  <button type=submit>Connect</button>
</form>`

class Disconnected extends HTMLElement {
  constructor () {
  	super()
  	this.render = this.render.bind(this)
  }

  async connectedCallback () {
    this.classList.add('view')
    this.appendChild(template.content.cloneNode(true))
  	state.addEventListener('change', this.render)
    this.addEventListener('submit', this.onsubmit)
  	this.render()
  }

  disconnectedCallback () {
  	state.removeEventListener('change', this.render)
  }

  render () {
    const peer = state.peer
    const secure = peer.secure || state.url.protocol === 'https:'
    const host = peer.host || ''
    const preSharedKey = peer.preSharedKey || ''
    hb(this, {
      '#tls': { $class: { hidden: state.url.protocol === 'https:' }},
      '[name=secure]': { $prop: { checked: secure === true }},
      '[name=host]': { $prop: { value: host }},
      '[name=preSharedKey]': { $prop: { value: preSharedKey }}
    })
  }

  async onsubmit (evt) {
    const secure = this.querySelector('[name=secure]').checked
    const host = this.querySelector('[name=host]').value
    const preSharedKey = this.querySelector('[name=preSharedKey]').value
    try {
      if (!host) throw new Error('Missing host')
      if (!preSharedKey) throw new Error('Missing password')
      state.connect({ secure, host, preSharedKey })
    } catch (err) {
      window.alert(err.message)
    }
  }
}

customElements.define('x-disconnected', Disconnected)
