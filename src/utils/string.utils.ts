export class stringUtils {
  static stringToArray = (bufferString: string) => {
    return new TextEncoder().encode(bufferString)
  }
  static arrayToString = (bufferValue: Uint8Array) => {
    return new TextDecoder('utf-8').decode(bufferValue)
  }

  static stringToBuffer = (str: string) => {
    return Buffer.from(str, 'utf-8')
  }

  static bufferToStr = (buffer: Buffer) => {
    return buffer.toString()
  }
}
