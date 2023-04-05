import { Signature } from '@/utils/signature.utils'
import btc  from '@/utils/bitcoin.util'
import { PrivKey } from '@ts-bitcoin/core'
describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', async () => {
    let currentKey = 'cTtHz5enUZaCoK2yn3kswPbt4ikBdegL7Dt9ZGbswHYzrNWXRnHd'  //2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2
    //let currentKey = 'KzdiP9pMmL29vnLcuAF34tAYrWJY4HiYU6eSmSG8tzz8P6DcQYRi'
    // let currentKey = '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ'
    const usedKey = []
    for (let i = 0; i < 1; i++) {
      // btc.BitcoinHelper.PrepareTestnetTx(currentKey)
      // Bitcoin.Bitcoin.generateSegWig(currentKey)
      const tx = await btc.Bitcoin.PrepareTXTestnet(currentKey)
      console.log("tx: ", tx)
      const res = await btc.Bitcoin.SendToTestnet(tx)
      console.log("res:  ", res)
    }
  })
})

