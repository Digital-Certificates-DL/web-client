// import {testnet} from "ecpair/src/networks";
//
// import * as bitcoin from 'bitcoinjs-lib';
// import BIP32Factory from 'bip32';
// import * as ecc from 'tiny-secp256k1';
// import { BIP32Interface } from 'bip32';import {instantiateBIP32Crypto} from "@bitauth/libauth";
// const network = bitcoin.networks.regtest
// const bip32 = BIP32Factory(ecc);
// import ECPairFactory from 'ecpair';
// import {fromBuffer} from "pdf2pic";
//
// import {networks} from "bitcoinjs-lib";
// import * as buffer from "buffer";
//
// const ECPair = ECPairFactory(ecc);
//
//
//
// export class Bitcoin {
//
//
//
// // Define the transactios.testnet,
//       redeem: bitcoin.payments.p2wpkh({
//         network: networks.testnet,
//         pubkey: keyPair.publicKey }),
//     });
//     console.log(address)
//   }
//
//   //523177def8c3b90550dcf30942bd158ad60c90e51d6bfec8e560e8191d2838bd
//   static prepareTXTestnet =(key: string, txid?: string )=>{
//     const keyPair = ECPair.fromWIF(
//       key,
//       testnet
//     );
//     const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
//     psbt.addInput({
//       hash: 'b56ab72ea88f6b9d93a2982266e3096cb1c344543d6ee583133f579a96b600b4',
//       index: 0,
//       nonWitnessUtxo: Buffer.from("020000000102d558c7121da4c53437edb4cd9db37a00389fab913bcdd3b395e7832fb32e03000000006a47304402206ded3b67180ba9839bc444ba97a0193acb3d9e2c86eea18cfef8b0a6e9c32c45022047b20388784cafe6a1c707bd7bb31abdcc89c68a614801675aeb073457193ee20121039e6dbc2fb47a65ca3addd00cd045c141ef031d1d58059aa5b43f59a6a26dde23feffffff0297260000000000001976a914e81cd0d3db52b8ea4e5ca12df1acde3eb5d1c59588acf2a29d00000000001976a91426dcbf25c2f6555c4c8c5ccce7b90c6cb7730c6188acdd062500", "hex")
//     });
//     psbt.addOutput({
//       address: "2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2",
//       value: 700,
//     })
//     console.log("add input")
//     psbt.addOutput({
//       address: 'n2gFaiBfqAqnfDExzXRh6sFtGzYjHxQP9K',
//       value: 10,
//     });
//     console.log("sign")
//     psbt.signInput(0, keyPair);
//     psbt.finalizeAllInputs();
//     return psbt.extractTransaction().toHex()
//   }
// }
//
// export default {
//   Bitcoin
// }
