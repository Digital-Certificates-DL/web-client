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
  private readonly NUMBER_OF_SIGNATURE_TYPES = 4

  private keyPair: KeyPair
  private address: Address

  constructor(privKey: string) {
    const key = PrivKey.Mainnet.fromWif(privKey)
    const keyPair = KeyPair.Mainnet.fromPrivKey(key)
    const address = Address.Mainnet.fromPubKey(keyPair.pubKey)
    this.keyPair = keyPair
    this.address = address
  }

  public signMsg = (message: string | Buffer) => {
    const bitcoinMsg = this.magicHash(message)
    const sign = Ecdsa.sign(bitcoinMsg, this.keyPair)

    for (let i = 0; i < this.NUMBER_OF_SIGNATURE_TYPES; i++) {
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
        return compSign.toString('base64')
      }
    }
  }

  public verifySign = (
    message: string | Buffer,
    pubKey: PubKey,
    signature: Sig,
  ) => {
    return Ecdsa.verify(Buffer.from(message), signature, pubKey)
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
    return this.hash256(buffer)
  }

  private sha256 = (b: Buffer): Buffer => {
    return Hash.sha256(b)
  }

  private hash256 = (buffer: Buffer): Buffer => {
    const hash = this.sha256(buffer)
    return this.sha256(hash)
  }
}
