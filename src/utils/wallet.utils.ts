// import SimpleWallet from 'simple-bitcoin-wallet'
//
// export class BitcoinWallet {
//   public Wallet!: SimpleWallet
//
//   constructor(wif: string) {
//     this.Wallet = new SimpleWallet(wif)
//     this.Wallet
//   }
//
//   public sendTX() {
//     const receivers = [
//       {
//         address: 'bitcoincash:qp2rmj8heytjrksxm2xrjs0hncnvl08xwgkweawu9h',
//         // amount in satoshis, 1 satoshi = 0.00000001 Bitcoin
//         amountSat: 100000,
//       },
//       {
//         // Post memo containing the text "Hello world!"
//         opReturn: ['0x6d02', 'Hello world!'],
//       },
//     ]
//
//     const tx = await this.Wallet.send(receivers)
//   }
//
//   public async getBalance(address?: string) {
//     if (address) {
//       const balance = await this.Wallet.getBalance(this.wrapAddress(address))
//       return balance
//     }
//     const balance = await this.Wallet.getBalance()
//     return balance
//   }
//
//   private wrapAddress(address: string) {
//     return 'bitcoincash:' + address
//   }
// }
