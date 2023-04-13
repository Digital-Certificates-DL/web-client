import {Bip} from "@/utils/bip.util";
describe('Test bip 39', () => {
  test('test 39', async () => {
    for (let i = 0; i < 3; i++) {
      const tx = await Bip.genAddress(
        'tenant else strategy such toward slogan spawn faculty helmet awkward figure stamp',
        i,
      )
    }
  })
})
