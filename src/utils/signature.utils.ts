import { Ecdsa, Address, KeyPair, PrivKey } from '@ts-bitcoin/core'
import bitcoinMessage from 'bitcoinjs-message'

export class Signature {
  private keyPair: KeyPair
  private address: Address

  constructor(privKey: string) {
    this.keyPair = KeyPair.Mainnet.fromPrivKey(PrivKey.Mainnet.fromWif(privKey))
    this.address = Address.Mainnet.fromPubKey(this.keyPair.pubKey)
  }

  public signMsg = (message: string | Buffer) => {
    const sign = Ecdsa.sign(bitcoinMessage.magicHash(message), this.keyPair)
    for (let i = 0; i < 4; i++) {
      const compSign = sign.toCompact(i).toString('base64')
      if (this.verifySign(message, this.address.toString(), compSign)) {
        return compSign
      }
    }
  }

  public verifySign = (
    message: string | Buffer,
    address: string,
    signature: string | Buffer,
  ) => {
    return bitcoinMessage.verify(message, address, signature)
  }
}
