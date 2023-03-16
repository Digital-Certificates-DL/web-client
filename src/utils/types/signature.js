const createHash = require('create-hash')
const varuint = require('varuint-bitcoin')

function sha256(b) {
  return createHash('sha256').update(b).digest()
}
function hash256(buffer) {
  return sha256(sha256(buffer))
}

function magicHash(message, messagePrefix) {
  messagePrefix = messagePrefix || '\x18Bitcoin Signed Message:\n'
  if (!Buffer.isBuffer(messagePrefix)) {
    messagePrefix = Buffer.from(messagePrefix, 'utf8')
  }
  if (!Buffer.isBuffer(message)) {
    message = Buffer.from(message, 'utf8')
  }
  const messageVISize = varuint.encodingLength(message.length)
  const buffer = Buffer.allocUnsafe(
    messagePrefix.length + messageVISize + message.length,
  )
  messagePrefix.copy(buffer, 0)
  varuint.encode(message.length, buffer, messagePrefix.length)
  message.copy(buffer, messagePrefix.length + messageVISize)

  return hash256(buffer)
}

module.exports = {
  magicHash: magicHash,
}
