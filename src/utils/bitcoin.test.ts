import btc from '@/utils/bitcoin.util'
describe('Performs bitcoin class unit test', () => {
  test('func should return txs hashes', async () => {
    for (let i = 0; i < 3; i++) {
      const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
        'tenant else strategy such toward slogan spawn faculty helmet awkward figure stamp',
        i,
      )
      await btc.Bitcoin.SendToTestnet(tx?.hex || '')
    }
  })
})
