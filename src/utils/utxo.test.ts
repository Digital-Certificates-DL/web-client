import { Bitcoin } from '@/utils/bitcoin.util'
import { initApi } from '@/api'

describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', async () => {
    initApi()

    const btc = new Bitcoin()
    const UTXOs = await btc.getUTXOBip32MainBlockstream(
      'tenant else strategy such toward slogan spawn faculty helmet awkward figure stamp',
    )
    console.log(UTXOs)
  })
})
