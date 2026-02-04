export const formatSalary = (salary: number): string => {
  if (salary >= 1000000) return `${(salary / 1000000).toFixed(0)}M`;
  if (salary >= 1000) return `${(salary / 1000).toFixed(0)}k`;
  return salary.toString();
};

export const getSalaryDisplay = (
  minSalary: number | undefined,
  maxSalary: number | undefined,
  currency: string,
  timeframe: string,
): string => {
  if (!minSalary && !maxSalary) return '';

  let salaryText = '';
  if (minSalary && maxSalary) {
    salaryText = `${currency}${formatSalary(minSalary)}-${currency}${formatSalary(maxSalary)}`;
  } else if (minSalary) {
    salaryText = `>${currency}${formatSalary(minSalary)}`;
  } else if (maxSalary) {
    salaryText = `<${currency}${formatSalary(maxSalary)}`;
  }

  if (!salaryText) return '';

  const capitalizedTimeframe = timeframe ? timeframe.replace(/^./, (c) => c.toUpperCase()) : '';

  return capitalizedTimeframe ? `${salaryText} per ${capitalizedTimeframe}` : salaryText;
};
