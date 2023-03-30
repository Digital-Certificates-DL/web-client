import { Signature } from '@/utils/signature.utils'
import btc from '@/utils/bitcoin.util'
import bitcoin from '@/utils/bitcoin.lib2.utils'
import { PrivKey } from '@ts-bitcoin/core'
describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', async () => {
    let currentKey = 'cPtbCoKnTwEde2spUq8JLrML5Rvx7cg1yjgTXec5EptXL2PiFb8L'
    const usedKey = []
    for (let i = 0; i < 5; i++) {
      const data = bitcoin.Btc.create(currentKey)
      usedKey.push(currentKey)
      currentKey = data.privateKey.toString()
      // const res = await btc.BitcoinHelper.SendToTestnet(data.tx.toString())
      // console.log(res)
    }
  })
})

//cPtbCoKnTwEde2spUq8JLrML5Rvx7cg1yjgTXec5EptXL2PiFb8L
//my6SW54CkFDquucXQauMJAtsnwhDpyeUeN
