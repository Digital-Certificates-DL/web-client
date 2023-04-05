import {Network, testnet} from "ecpair/src/networks";

import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';import {instantiateBIP32Crypto} from "@bitauth/libauth";
const bip32 = BIP32Factory(ecc);
import ECPairFactory from 'ecpair';


const ECPair = ECPairFactory(ecc);


import axios from 'axios'

export class Bitcoin {
  static PrepareTXTestnet = async (key: string, address2?: string,  txID?: string)=>{
    const keyPair = ECPair.fromWIF(
      key,
      testnet
    );
    const {address} =bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: testnet})
    console.log(address)
    const psbt = new bitcoin.Psbt({network: testnet})
    let fee = 0
    let butxoAmount = 0
    let utxo
    if (!txID){
      const utxos =  await axios
        .get('https://api.blockcypher.com/v1/btc/test3/addrs/'+address + "?unspentOnly=true")
        .then(function (response) {
          let txs = response.data.txrefs
          console.log("response.data.unconfirmed_txrefs: ", response.data.unconfirmed_txrefs)
          txs = txs.concat(response.data.unconfirmed_txrefs)
          console.log("txs: ",  txs)
          return txs
        })
        .catch(function (err) {
          console.log("err",  err)
        })
      console.log(utxos)
      const { txs, utxoAmount, value} = await this.betterUtxoTestnet(utxos, 2,556+557+558)
      fee = value
      utxo = txs
      console.log("txs: ", txs)
      butxoAmount = utxoAmount || 0
      console.log("utxoAmount: " ,utxoAmount)
    }
    console.log("***************")
    console.log(utxo)
    console.log("tx_hash ",utxo.tx_hash)

    if (utxo.length){
      for (let i = 0; i<utxo.length;  i++){
        const hex = await this.getTxTestnet(utxo[i].tx_hash)
        console.log("input: ", utxo[i].tx_hash)
        console.log("tx_output_n: ", utxo[i].tx_output_n)
        psbt.addInput({
          hash: utxo[i].tx_hash,
          index: utxo[i].tx_output_n,
          nonWitnessUtxo: Buffer.from(hex, "hex")
        });
      }
    }else{
      const hex = await this.getTxTestnet(utxo.tx_hash)
      console.log("input: ", hex)
      console.log("tx_output_n: ", utxo.tx_output_n)

      psbt.addInput({
        hash: utxo.tx_hash,
        index: utxo.tx_output_n,
        nonWitnessUtxo: Buffer.from(hex, "hex")
      });
    }

    let balance = butxoAmount
    psbt.addOutput({
      address: "2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2",
      value: 556,
    })
    psbt.addOutput({
      address: "2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW4",
      value: 557,
    })
    psbt.addOutput({
      address: "2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW1",
      value: 558,
    })
    balance -= 556+557+558
    balance -= fee
    psbt.addOutput({
      address: 'n2gFaiBfqAqnfDExzXRh6sFtGzYjHxQP9K',
      value:balance,
    });



    console.log("sign")
    psbt.signInput(0, keyPair);
    psbt.finalizeAllInputs();
    return psbt.extractTransaction().toHex()

  }

  static async PrepareTXMainnet(key: string, txID?: string, address?: string){
    const keyPair = ECPair.fromWIF(
      key,
    );
    const psbt = new bitcoin.Psbt();
    let amount = 0
    let butxoAmount = 0
    let utxo
    if (!txID){
     const utxos =  await axios
        .get('https://api.blockcypher.com/v1/btc/test3/addrs/'+address + "?unspentOnly=true")
        .then(function (response) {
          return response.data.txrefs
        })
        .catch(function (err) {
          console.log("err",  err)
        })
      const { txs, utxoAmount, value} = await this.betterUtxoMainnet(utxos, 4)
      amount = value
      utxo = txs
      butxoAmount = utxoAmount || 0
    }

    for (let i = 0; i<utxo.length;  i++){
      const hex = await this.getTxMainnet(utxo[i].tx_hash)

      psbt.addInput({
        hash: utxo[i].tx_hash || "",
        index: i,
        nonWitnessUtxo: Buffer.from(hex, "hex")
      });
    }
    psbt.addOutput({
      address: "2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2",
      value: (amount||0 - butxoAmount ||0),
    })
    console.log("add input")
    psbt.addOutput({
      address: 'n2gFaiBfqAqnfDExzXRh6sFtGzYjHxQP9K',
      value: 10,
    });
    console.log("sign")
    psbt.signInput(0, keyPair);
    psbt.finalizeAllInputs();
    return psbt.extractTransaction().toHex()

  }

  static async SendToTestnet(tx: string) {
    console.log("tx inner: ", tx)
    await axios
      .post('https://api.blockcypher.com/v1/btc/test3/txs/push', { tx: tx })
      .then(function (response) {
        console.log(response.data)
        return response
      })
      .catch(function (err) {
        console.log("err",  err)
        return err
      })
  }
  // f3940bcec5bb4f1b9edfca8f6cabce65
  static async SendToMainnet(tx: string) {
    await axios
      .post('api.blockcypher.com/v1/btc/main/main/txs/push?token=f3940bcec5bb4f1b9edfca8f6cabce65', { tx: tx })
      .then(function (response) {
        console.log(response.data)
        return response
      })
      .catch(function (response) {
        console.log(response.data)
        return response
      })
  }

  static async calculateFeeMainnet   (outs: number, ins: number) {
      const size = ins * 180 + outs*34 +10 - ins
      let fee: number

      fee = await axios
        .get('api.blockcypher.com/v1/btc/main' )
        .then( (response) =>{
          console.log(response.data.medium_fee_per_kb)
          fee = response.data.medium_fee_per_kb
        })
        .catch( (err)  =>{
          return err
        })
      return size * fee
  }
  static async calculateFeeTestnet  (outs: number, ins: number) {
      const size = ins * 180 + outs*34 +10 - ins
      let fee = 10
      //
      fee = await axios
        .get('https://bitcoinfees.earn.com/api/v1/fees/recommended' )
        .then( (response) =>{
          console.log("hourFee  ",response.data.hourFee)
          return response.data.hourFee
        })
        .catch( (err)  =>{
          return err
        })

      return size * Number(fee)
  }

  private static async betterUtxoMainnet(txs: any, outs: number){
    const largeTxs=  []
    const smaller = []
    let value = await this.calculateFeeMainnet(outs, 1)
    for(const  tx of txs ){
        if(tx.value > value){
          largeTxs.push(tx.value)
        }else {
          smaller.push(tx.value)
        }
    }
    smaller.sort(this.reverseSort)
    largeTxs.sort(this.sort)
    if (smaller.length > 1){
      let bufferValue =0
      let utxos = []
      for (let i=0;i < smaller.length; i++ ){
        value = await this.calculateFeeMainnet(outs, i)
        if (bufferValue < value){
          bufferValue +=  smaller[i].value
          utxos.push(smaller)
        }
        return {
          txs: utxos,
          utxoAmount: bufferValue,
          value: value
        }
      }
    }
    return {
      txs: largeTxs[0],
      utxoAmoutn: largeTxs[0].value,
      value: value
    }
  }

  private static async getTxTestnet(hash: string){
    console.log("tx ", hash)
    const tx = await axios
      .get('https://api.blockcypher.com/v1/btc/test3/txs/'+hash +"?includeHex=true" )
      .then( (response) =>{
        console.log("hex: ", response.data.hex )
        return response.data.hex
      })
      .catch( (err)  =>{
        return err
      })
    return tx
  }
  private static async getTxMainnet(hash: string){
    const tx = await axios
      .get('https://api.blockcypher.com/v1/btc/main/txs/'+hash +"?includeHex=true" )
      .then( (response) =>{
        console.log("hex: ", response.data.hex )
        return response.data.hex
      })
      .catch( (err)  =>{
        return err
      })
    return tx
  }

  private static async betterUtxoTestnet(txs: any, outs: number, txsValue: number ){
    const largeTxs=  []
    const smaller = []
    let value = await this.calculateFeeTestnet(outs, 1)
    value += txsValue
    for(const  tx of txs ){
      if(tx.value > value){
        largeTxs.push(tx)
      }else {
        smaller.push(tx)
      }
    }
    console.log("val ",  value)
    smaller.sort(this.reverseSort)
    largeTxs.sort(this.sort)
    console.log("smaller ", smaller)
    console.log("large ", largeTxs)
    if (smaller.length > 1){
      let bufferValue =0
      let utxos = []
      for (let i=0;i < smaller.length; i++ ){
        value = await this.calculateFeeTestnet(outs, i)
        value += txsValue
        if (bufferValue < value){
          bufferValue +=  smaller[i].value
          utxos.push(smaller)
        }else{
          return {
            txs: utxos,
            utxoAmount: bufferValue,
            value: value
          }
        }
      }
    }
    let result = []
    console.log("largeTxs",largeTxs)
    return {
      txs: largeTxs[0],
      utxoAmount: largeTxs[0].value,
      value: value
    }
  }

  private  static sort = (a: number, b: number) =>{
    return a - b;
  }

  private static reverseSort = (a: number, b: number) =>{
    return a - b;
  }
}

// (see https://blockchain.info/pushtx)

export default {
  Bitcoin
}
