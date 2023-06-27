export const prepareAddress = (isConnected: boolean, fullAddrss: string) => {
  if (isConnected) {
    return fullAddrss!.slice(0, 6) + '...' + fullAddrss!.slice(-4)
  }
  return ''
}
