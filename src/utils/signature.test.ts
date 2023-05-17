import { Signature } from './signature.util'

describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Ruslan Yakymenko Beginner at theoretical aspects blockchain technology'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'Gyzo/bv2FTXnAf20xVeOvpZ/YPJLtmqYvvYbjc8PHbbTc3az3QibqfG98ezd7cc7pCzjZ+cVn8LWSL8WELiof1Y=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Vitaliy Zayets Beginner at theoretical aspects blockchain technologyerere'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'HCzWDJNZdqBC9n2Av+4EbfUY/XZYbdXkRhBvIXSPpNq8e1zJ+voN+K/IJz33mDw/FBfJin/ZP8H1GBeErxfq1B4=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg = 'test 2'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'HNQVjvrcDvs7UTWgM68wQYd7V6G3gPR9TS5lOM/6FcfUHD9a23cL4hHC4d/WSPSOCagufSFK0obgrlwgeVN+Hx8=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg = 'some data'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'HJeL0fLpKnCIx2nSeSCzcWO8OO93BoabNUP0+Q4ghwhPMeiYK/ZsX8EP5TTDh3pQufCNSW/2IIdhkNPQtR/JdSI=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Ruslan Yakymenko Beginner at theoretical aspects blockchain technology test 1231231231'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'HGvEjwA5LxYqLb/yRvosaFkwDWrb1Oad32Jysl+tFR6RViyvjbocmCc0XeZuYJldpRLv4lNy87KcOJpix51Sf/Y=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg = '19.01.2023 Ruslan Yakymenko Beginnehnology test 1231231231'
    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'GxYDGqL2C95EN1Fl5dPRrjolMHsgYjCs+3b3ufQ7otthF5ieAM4/t1/5Omb+19Gw/WC6ORjTMVmfiycOrsjplME=',
    )
  })
  ////////////////////
  test('signature should return correct value', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Vitaliy Zayets Beginner at theoretical aspects blockchain technology'

    const signature = sign.signMsg(msg)
    expect(signature).toStrictEqual(
      'HNRrt22bnGy3AvetqLmYiHtqmNYUibJXr5WJjGipe60JFzfKqhWjGI9seNi0XFhWXMZJQAqyrVyRCEvpzeV7vO0=',
    )
  })
  ///////////
  test('verify should return true', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Ruslan Yakymenko Beginner at theoretical aspects blockchain technology'
    const address = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'
    const verification = sign.verifySign(
      msg,
      address,
      'Gyzo/bv2FTXnAf20xVeOvpZ/YPJLtmqYvvYbjc8PHbbTc3az3QibqfG98ezd7cc7pCzjZ+cVn8LWSL8WELiof1Y=',
    )
    expect(verification).toStrictEqual(true)
  })

  test('verify should return true', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.01.2023 Vitaliy Zayets Beginner at theoretical aspects blockchain technology'
    const address = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'
    const verification = sign.verifySign(
      msg,
      address,
      'HNRrt22bnGy3AvetqLmYiHtqmNYUibJXr5WJjGipe60JFzfKqhWjGI9seNi0XFhWXMZJQAqyrVyRCEvpzeV7vO0=',
    )
    expect(verification).toStrictEqual(true)
  })

  test('verify should return false', () => {
    const sign = new Signature(
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    const msg =
      '19.0.2023 Vitaliy Zayets Beginner at theoretical aspects blockchain technology'
    const address = '1JgcGJanc99gdzrdXZZVGXLqRuDHik1SrW'
    const verification = sign.verifySign(
      msg,
      address,
      'HNRrt22bnGy3AvetqLmYiHtqmNYUibJXr5WJjGipe60JFzfKqhWjGI9seNi0XFhWXMZJQAqyrVyRCEvpzeV7vO0=',
    )
    expect(verification).toStrictEqual(false)
  })
})
