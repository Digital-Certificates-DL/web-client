import btc from '@/utils/bitcoin.util'
describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', async () => {
    const currentKey = 'cTtHz5enUZaCoK2yn3kswPbt4ikBdegL7Dt9ZGbswHYzrNWXRnHd' //2N1fWEgZG7tYDQvdyHcs3LQMJtqrvf6vTW2
    //let currentKey = 'KzdiP9pMmL29vnLcuAF34tAYrWJY4HiYU6eSmSG8tzz8P6DcQYRi'
    // let currentKey = '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ'
    const usedKey = []
    for (let i = 0; i < 3; i++) {
      const tx = await btc.Bitcoin.PrepareLegacyTXTestnet(
        'tenant else strategy such toward slogan spawn faculty helmet awkward figure stamp',
        i,
      )
      await btc.Bitcoin.SendToTestnet(tx?.hex || '')
    }
  })
})
