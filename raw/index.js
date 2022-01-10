// reference:
// https://www.yachtd.com/downloads/ydnu02.pdf

const startTime = new Date()

function decode (str) {
  const parts = str.split(' ')
  const timestampParts = parts[0].split(':')
  const hours = parseInt(timestampParts[0]) * 60 * 60 * 1000
  const minutes = parseInt(timestampParts[1]) * 60 * 1000
  const secondsParts = timestampParts[2].split('.')
  const seconds = parseInt(secondsParts[0]) * 1000
  const milliseconds = parseInt(secondsParts[1])
  const timestamp = hours + minutes + seconds + milliseconds
  return {
    timestamp,
    direction: parts[1],
    id: parseInt(parts[2], 16),
    data: new Uint8Array(parts.slice(3).map(b => parseInt(b, 16)))
  }
}

function encode (obj) {
  let timestamp = obj.timestamp
  if (timestamp === undefined) {
    timestamp = new Date() - startTime
  }
  if (typeof timestamp === 'number') {
    let milliseconds = timestamp
    let seconds = Math.floor(milliseconds / 1000)
    let minutes = Math.floor(seconds / 60)
    let hours = Math.floor(minutes / 60) % 99
    milliseconds = String(milliseconds - seconds * 1000)
    while (milliseconds.length < 3) milliseconds = '0' + milliseconds
    seconds = String(seconds - minutes * 60)
    while (seconds.length < 2) seconds = '0' + seconds
    minutes = String(minutes - hours * 60)
    while (minutes.length < 2) minutes = '0' + minutes
    hours = String(hours)
    while (hours.length < 2) hours = '0' + hours
    timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`
  }
  const direction = obj.direction || 'R'
  const id = obj.id.toString(16).toUpperCase()
  let str = `${timestamp} ${direction} ${id}`
  if (obj.data) {
    if (obj.data.length > 8) {
      throw new RangeError('max data size 8 bytes')
    }
    const data = Array.from(obj.data).map(b => {
      b = b.toString(16).toUpperCase()
      while (b.length < 2) b = '0' + b
      return b
    }).join(' ')
    str += ` ${data}`
  }
  return str
}

export default { decode, encode }
