// reference:
// https://tractorhacking.github.io/IdExplanation/
// https://www.filesthrutheair.com/downloads/user_guide(1)824228.user_guide%20(1).pdf

function decode (num) {
  let destination = 0xff
  const source = num & 0xff
  const pduSpecific = num >> 8 & 0xff
  const pduFormat = num >> 16 & 0xff
  const dataPage = num >> 24 & 1
  const extendedDataPage = num >> 25 & 1
  const priority = num >> 26 & 0b111
  let pgn = dataPage << 16 | pduFormat << 8
  if (pduFormat < 240) {
    destination = pduSpecific
  } else {
    pgn |= pduSpecific
  }
  return {
    pgn,
    source,
    destination,
    extendedDataPage,
    priority
  }
}

function encode (obj) {
  const destination = obj.destination || 0xff
  const source = obj.source || 0
  const pduSpecific = obj.pgn & 0xff
  const pduFormat = obj.pgn >> 8 & 0xff
  const dataPage = obj.pgn >> 16 & 1
  const extendedDataPage = obj.extendedDataPage || 0
  const priority = obj.priority || 0
  let num = priority << 26 | extendedDataPage << 25 | dataPage << 24 | pduFormat << 16 | source
  if (pduFormat < 240) {
    num |= destination << 8
  } else {
    num |= pduSpecific << 8
  }
  return num
}

export default { decode, encode }
