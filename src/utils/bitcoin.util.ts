import {
  Address,
  Bn,
  deps,
  KeyPair,
  PrivKey,
  Script,
  TxBuilder,
  TxOut,
} from '@ts-bitcoin/core'
import axios from 'axios'

export class BitcoinHelper {
  public static PrepareTestnetTx(key: string) {
    const privKey1 = PrivKey.Testnet.fromRandom()
    const keyPair1 = KeyPair.Testnet.fromPrivKey(privKey1)
    const addr1 = Address.Testnet.fromPubKey(keyPair1.pubKey)

    const privKey2 = PrivKey.Testnet.fromString(key)
    const keyPair2 = KeyPair.Testnet.fromPrivKey(privKey2)
    const addr2 = Address.Testnet.fromPubKey(keyPair2.pubKey)

    const txOut = TxOut.fromProperties(new Bn(2e8), addr2.toTxOutScript())

    const txHashBuf = deps.Buffer.alloc(32).fill(0)

    const dlbook = '1DistributedLabXXXXXXXXXXXXXSGJ8Ee'
    const blockchainCourse = '1B1ockchainCourseXXXXXXXXXXXaJJNUJ'
    const opHash =
      '30362E30362E323032322044656E697320526961627473657620426567696E6E6572206174207468656F7265746963616C206173706563747320626C6F636B636861696E20746563686E6F6C6F6779'
    const tx = new TxBuilder()
      .setFeePerKbNum(0.0001e8)
      .setChangeAddress(addr1)
      .inputFromPubKeyHash(txHashBuf, 0, txOut, keyPair2.pubKey)
      .outputToAddress(new Bn(1e8), Address.fromString(dlbook))
      .outputToAddress(new Bn(1e8), Address.fromString(blockchainCourse))
      .outputToScript(
        new Bn(1e8),
        Script.fromOpReturnData(Buffer.from(opHash, 'utf-8')),
      )
      .build()
    return {
      tx: tx,
      newKey: privKey1,
    }
  }
  public static PrapareTXMainnet(key: string) {
    // make change address
    const privKey1 = PrivKey.fromRandom()
    const keyPair1 = KeyPair.fromPrivKey(privKey1)
    const addr1 = Address.fromPubKey(keyPair1.pubKey)
    // make address to send from
    const privKey2 = PrivKey.fromString(key)
    const keyPair2 = KeyPair.fromPrivKey(privKey2)
    const addr2 = Address.fromPubKey(keyPair2.pubKey)

    const txOut = TxOut.fromProperties(new Bn(778e8), addr2.toTxOutScript())
    //todo  update value
    const txHashBuf = deps.Buffer.alloc(32).fill(0)

    const dlbook = '1DistributedLabXXXXXXXXXXXXXSGJ8Ee'
    const blockchainCourse = '1B1ockchainCourseXXXXXXXXXXXaJJNUJ'
    const opHash =
      '30362E30362E323032322044656E697320526961627473657620426567696E6E6572206174207468656F7265746963616C206173706563747320626C6F636B636861696E20746563686E6F6C6F6779'
    const tx = new TxBuilder()
      .setFeePerKbNum(0.0001e8)
      .setChangeAddress(addr1)
      .inputFromPubKeyHash(txHashBuf, 0, txOut, keyPair2.pubKey)
      .outputToAddress(new Bn(1e8), Address.fromString(dlbook))
      .outputToAddress(new Bn(1e8), Address.fromString(blockchainCourse))
      .outputToScript(
        new Bn(1e8),
        Script.fromOpReturnData(Buffer.from(opHash, 'utf-8')),
      )
      .build()
    return {
      tx: tx,
      newKey: privKey1,
    }
  }

  public async SendToTestnet(tx: string) {
    await axios
      .post('https://api.blockcypher.com/v1/bcy/test/txs/push', { tx: tx })
      .then(function (response) {
        return response
      })
      .catch(function (response) {
        return response
      })
  }

  public async SendToMainnet(tx: string) {
    await axios
      .post('api.blockcypher.com/v1/btc/main/main/txs/push', { tx: tx })
      .then(function (response) {
        return response
      })
      .catch(function (response) {
        return response
      })
  }
}

// (see https://blockchain.info/pushtx)
