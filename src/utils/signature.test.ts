import { Signature } from './signature.utils'

describe('Performs bitcoin signature class unit test', () => {
  test('signature should return correct value', () => {
    const sign = new Signature()
    const msg =
      '19.01.2023 Ruslan Yakymenko Beginner at theoretical aspects blockchain technology'
    const signature = sign.signMsg(
      msg,
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    expect(signature).toStrictEqual(
      'Gyzo/bv2FTXnAf20xVeOvpZ/YPJLtmqYvvYbjc8PHbbTc3az3QibqfG98ezd7cc7pCzjZ+cVn8LWSL8WELiof1Y=',
    )
  })

  test('signature should return correct value', () => {
    const sign = new Signature()
    const msg =
      '19.01.2023 Vitaliy Zayets Beginner at theoretical aspects blockchain technology'

    const signature = sign.signMsg(
      msg,
      '5HtbQzoofDVmEvzAMd89iq5nRpFUm8xudgkSNZ4rPN9z5AWcGEJ',
    )
    expect(signature).toStrictEqual(
      'HNRrt22bnGy3AvetqLmYiHtqmNYUibJXr5WJjGipe60JFzfKqhWjGI9seNi0XFhWXMZJQAqyrVyRCEvpzeV7vO0=',
    )
  })
  ///////////
  test('verify should return true', () => {
    const sign = new Signature()
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
    const sign = new Signature()
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
    const sign = new Signature()
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
