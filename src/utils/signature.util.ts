import {
  Address,
  Ecdsa,
  Hash,
  KeyPair,
  PrivKey,
  PubKey,
  Sig,
} from '@ts-bitcoin/core'
import varuint from 'varuint-bitcoin'
import { Buffer } from 'buffer'

export class Signature {
  private keyPair: KeyPair
  private address: Address

  constructor(privKey: string) {
    const key = PrivKey.Mainnet.fromWif(privKey)
    const keyPair = KeyPair.Mainnet.fromPrivKey(key)
    const address = Address.Mainnet.fromPubKey(keyPair.pubKey)
    this.keyPair = keyPair
    this.address = address
  }

  /////////////////////
  public signMsg = (message: string | Buffer) => {
    const bitcoinMsg = this.magicHash(message)

    const sign = Ecdsa.sign(bitcoinMsg, this.keyPair)

    for (let i = 0; i < 4; i++) {
      // eslint-disable-next-line no-console
      console.log('I: ', i)
      const compSign = sign.toCompact(i)
      const newPB = Ecdsa.sig2PubKey(Sig.fromCompact(compSign), bitcoinMsg)
      if (newPB.toHex() !== this.keyPair.pubKey.toHex()) {
        continue
      }
      if (
        this.verifySign(
          bitcoinMsg,
          this.keyPair.pubKey,
          Sig.fromCompact(compSign),
        )
      ) {
        // eslint-disable-next-line no-console
        console.log('signBuffer : ', compSign.toString('base64'), 'I: ', i)
        return compSign.toString('base64')
      }
    }
  }

  public verifySign = (
    message: string | Buffer,
    pubKey: PubKey,
    signature: Sig,
  ) => {
    // eslint-disable-next-line no-console
    console.log('start verify')
    const isValid = Ecdsa.verify(Buffer.from(message), signature, pubKey)

    // eslint-disable-next-line no-console
    console.log('is valid  : ', isValid)
    return isValid
  }

  private magicHash = (message: string | Buffer, messagePrefix?: string) => {
    if (typeof messagePrefix !== 'string') {
      messagePrefix = Buffer.from(
        '\u0018Bitcoin Signed Message:\n',
        'utf8',
      ).toString()
    }

    if (!Buffer.isBuffer(message)) {
      message = Buffer.from(message, 'utf8')
    }

    const messageVISize = varuint.encodingLength(message.length)
    const buffer = Buffer.allocUnsafe(
      messagePrefix.length + messageVISize + message.length,
    )

    Buffer.from(messagePrefix, 'utf8').copy(buffer, 0)

    varuint.encode(message.length, buffer, messagePrefix.length)
    message.copy(buffer, messagePrefix.length + messageVISize)
    // eslint-disable-next-line no-console
    console.log('before hash')
    return this.hash256(buffer)
  }

  private sha256 = (b: Buffer): Buffer => {
    // eslint-disable-next-line no-console
    console.log('hashing')
    return Hash.sha256(b)
  }

  private hash256 = (buffer: Buffer): Buffer => {
    const hash = this.sha256(buffer)
    // eslint-disable-next-line no-console
    console.log('hash done: ', hash)
    return this.sha256(hash)
  }
}
