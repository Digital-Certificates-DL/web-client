export const abbrCenter = (text = '', reduceValue = 4): string => {
  if (text.length <= reduceValue * 2) {
    return text
  }
  return `${text.slice(0, reduceValue)}...${text.slice(-reduceValue)}`
}
