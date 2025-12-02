export const valLabel = (arr: string[]) => {
  return arr.map((item: string) => ({
    value: item.toLowerCase().replace(/\s+/g, '-'),
    label: item,
  }))
}