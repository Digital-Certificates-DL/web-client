export const abbrCenter = (fullAddrss: string | undefined): string => {
  if (!fullAddrss) {
    return ''
  }
  return fullAddrss.slice(0, 6) + '...' + fullAddrss.slice(-4)
}
