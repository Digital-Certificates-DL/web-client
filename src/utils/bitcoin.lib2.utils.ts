const bitcore = require('bitcore-lib')
const Insight = require('bitcore-insight').Insight

export class Btc {
  static create = (key: string) => {
    const insight = new Insight('testnet')

    // Our private key and address
    const wif = key
    const privateKey = new bitcore.PrivateKey(wif)
    const myAddress = privateKey.toAddress()

    // Address we are sending Bitcoin to
    const addressTo = 'moCEHE5fJgb6yHtF9eLNnS52UQVUkHjnNm'
    let tx
    // Start the creating our transaction
    const amount = 50000 // Sending amount must be in satoshis
    const fee = 50000 // Fee is in satoshis

    // Get the UTXOs of your Bitcoin address
    insight.getUtxos(myAddress, (err: any, utxos: any) => {
      if (err) {
        //Handle errors
        return err
      } else {
        // Use the UTXOs to create transaction with a
        // bitcore Transaction object
        tx = bitcore.Transaction()
        tx.from(utxos)
        tx.to(addressTo, amount)
        tx.change(myAddress)
        tx.fee(fee)
        tx.sign(privateKey)
        tx.serialize()

        // Broadcast your transaction to the Bitcoin network
        insight.broadcast(tx.toString(), (error: any, txid: any) => {
          if (error) {
            return error
          } else {
            // Your Transaction Id
            console.log(txid)
          }
        })
      }
    })
    return {
      privateKey,
      tx,
    }
  }
}

export default {
  Btc,
}
