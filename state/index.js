import url from '/modules/url-state/index.js'
import raw from '../raw/index.js'
import can from '../can/index.js'

const circle = Math.PI * 2

const acksMax = 3

const state = window.state = new EventTarget()

state.url = url
url.addEventListener('change', () => {
  state.dispatchEvent(new Event('change'))
})

Object.defineProperty(state, 'peer', {
  get: function () {
    const peer = {}
    const preSharedKey = sessionStorage.preSharedKey
    if (preSharedKey) {
      peer.preSharedKey = preSharedKey
    }
    try {
      Object.assign(peer, JSON.parse(localStorage.peer))
    } catch (err) {}
    return peer
  },
  set: function (peer = {}) {
    if (peer.host && peer.preSharedKey) {
      localStorage.peer = JSON.stringify({
        secure: peer.secure,
        host: peer.host
      })
      sessionStorage.preSharedKey = peer.preSharedKey
    } else {
      delete localStorage.peer
      delete sessionStorage.preSharedKey
    }
  }
})

state.connect = function (peer) {
  if (state.socket) {
    if (state.socket.readyState === 0) {
      throw new Error('already connecting')
    } else if (state.socket.readyState === 1) {
      throw new Error('already connected')
    }
    throw new Error('socket exists')
  }
  if (peer) {
    state.peer = peer
  } else {
    peer = state.peer
  }
  const proto = `${peer.secure ? 'wss' : 'ws'}://`
  const url = `${proto}${peer.host}`
  const socket = state.socket = new WebSocket(url)
  state.mode = state.heading = state.headingLocked = null
  clearTimeout(state.timeout)
  state.timeout = setTimeout(() => socket.close(), 2500)
  socket.authenticated = false
  socket.addEventListener('open', () => {
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
      state.error = new Error('connected but peer was unresponsive')
      socket.close()
    }, 5000)
    socket.didOpen = true
    socket.send(peer.preSharedKey)
  })
  socket.addEventListener('close', () => {
    if (socket !== state.socket) return
    clearTimeout(state.timeout)
    delete state.socket
    delete state.desiredMode
    delete state.desiredHeading
    if (!socket.userClosed) {
      if (socket.didOpen) {
        if (!state.error || state.error.code === 1) {
          // state.error = new Error('connection closed unexpectedly')
          delete state.error
          this.connect()
          return
        }
      } else {
        state.error = new Error('connection failed')
      }
    }
    state.dispatchEvent(new Event('change'))
  })
  socket.addEventListener('message', evt => {
    clearTimeout(state.timeout)
    if (state.error && state.error.code === 1) {
      delete state.error
    }
    const message = evt.data
    if (socket.authenticated) {
      receiveNmea(message)
      state.wait(false)
    } else if (message === 'ok') {
      socket.authenticated = true
      state.dispatchEvent(new Event('change'))
      state.wait(false)
    } else {
      state.error = new Error('authentication failed')
      socket.close()
    }
  })
  state.dispatchEvent(new Event('change'))
}

state.disconnect = function () {
  clearTimeout(state.timeout)
  if (state.socket) {
    state.socket.userClosed = true
    state.socket.close()
    state.socket.dispatchEvent(new Event('close'))
  } else {
    state.dispatchEvent(new Event('change'))
  }
}

state.wait = function (shouldDispatch = true) {
  clearTimeout(state.timeout)
  if (state.socket) {
    state.timeout = setTimeout(() => {
      state.mode = state.heading = state.headingLocked = null
      state.error = new Error('connected but no data received in > 5 seconds')
      state.error.code = 1
      state.dispatchEvent(new Event('change'))
    }, 7500)
  }
  if (shouldDispatch) {
    state.dispatchEvent(new Event('change'))
  }
}

state.setMode = function (on) {
  const mode = on ? 0x40 : 0x00
  if (!state.desiredMode || mode !== state.desiredMode.value) {
    state.desiredMode = { acks: 0, value: mode }
  }
  delete state.desiredHeading
  sendNmea({ destination: 204, pgn: 126208, data: [0x00, 0x11, 0x01, 0x63, 0xff, 0x00, 0xf8, 0x04] })
  sendNmea({ destination: 204, pgn: 126208, data: [0x01, 0x01, 0x3b, 0x07, 0x03, 0x04, 0x04, mode] })
  sendNmea({ destination: 204, pgn: 126208, data: [0x02, 0x00, 0x05, 0xff, 0xff, 0xff, 0xff, 0xff] })
}

state.changeHeading = function (degrees) {
  const circleHires = circle * 10000
  const radians = degrees / 360 * circleHires
  let newHeading = (state.desiredHeading ? state.desiredHeading.vlaue : state.headingLocked) + radians
  if (newHeading > circleHires) newHeading -= circleHires
  else if (newHeading < 0) newHeading += circleHires
  state.setHeading(newHeading)
}

state.setHeading = function (heading) {
  if (!state.desiredHeading || heading !== state.desiredHeading.value) {
    state.desiredHeading = { acks: 0, value: heading }
  }
  let big = heading >> 8
  let small = heading & 0xff
  sendNmea({ destination: 204, pgn: 126208, data: [0x00, 0x0e, 0x01, 0x50, 0xff, 0x00, 0xf8, 0x03] })
  sendNmea({ destination: 204, pgn: 126208, data: [0x01, 0x01, 0x3b, 0x07, 0x03, 0x04, 0x06, small] })
  sendNmea({ destination: 204, pgn: 126208, data: [0x02, big, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff] })
}

function receiveNmea (lines) {
  lines.split('\r\n').slice(0, -1).forEach(line => {
    const message = raw.decode(line)
    const pgn = can.decode(message.id).pgn
    if (pgn === 65379) { // pilot mode
      const mode = message.data[2] !== 0
      if (mode !== state.mode) {
        state.mode = mode
        state.dispatchEvent(new Event('change'))
      }
      if (state.desiredMode) {
        if (++state.desiredMode.acks > acksMax || mode === state.desiredValue.value) {
          delete state.desiredMode
        } else {
          state.setMode(state.desiredMode.value)
        }
      }
    } else if (pgn === 65359) { // pilot heading
      const small = message.data[5]
      const big = message.data[6]
      const heading = big << 8 | small
      if (heading !== state.heading) {
        state.heading = heading 
        state.dispatchEvent(new Event('change'))
      }
    } else if (pgn === 65360) { // pilot heading locked
      const small = message.data[5]
      const big = message.data[6]
      const headingLocked = big << 8 | small
      if (headingLocked !== state.headingLocked) {
        state.headingLocked = headingLocked
        state.dispatchEvent(new Event('change'))
      }
      if (state.desiredHeading) {
        if (++state.desiredHeading.acks > acksMax || headingLocked === state.desiredHeading.value) {
          delete state.desiredHeading
        } else {
          state.setHeading(state.desiredHeading.value)
        }
      }
    }
  })
}

function sendNmea (params) {
  const { source, destination, pgn, data } = params
  const cmd = raw.encode({
    id: can.encode({
      pgn,
      source,
      destination,
    }),
    data: new Uint8Array(data)
  })
  state.socket.send(cmd + '\r\n')
}

export default state
