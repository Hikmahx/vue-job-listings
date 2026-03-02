/** Convert string array to { value: slug, label: original } for selects */
export const valLabel = (arr: string[]): { value: string; label: string }[] => {
  return arr.map((item: string) => ({
    value: item.toLowerCase().replace(/\s+/g, '-'),
    label: item,
  }));
};
