import { instantiateSecp256k1 } from '@bitauth/libauth'

export class Signature {
  static verifySignature = async (
    sig: Uint8Array,
    pubkey: Uint8Array,
    msgHash: Uint8Array,
  ) => {
    const secp256k1 = await instantiateSecp256k1()
    return secp256k1.verifySignatureDERLowS(sig, pubkey, msgHash)
  }

  static signMess = async (key: Uint8Array, msgHash: Uint8Array) => {
    const secp256k1 = await instantiateSecp256k1()
    return secp256k1.signMessageHashDER(key, msgHash)
  }
}
