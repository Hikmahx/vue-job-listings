export const levelsOptions = [
  { label: 'Junior', value: 'junior' },
  { label: 'Midweight', value: 'midweight' },
  { label: 'Senior', value: 'senior' },
];

const currenciesData = [
  { label: '$', value: 'USD' },
  { label: '£', value: 'GBP' },
  { label: '¥', value: 'CNY' },
  { label: '৳', value: 'BDT' },
  { label: '฿', value: 'THB' },
  { label: '₡', value: 'CRC' },
  { label: '₦', value: 'NGN' },
  { label: '₩', value: 'KRW' },
  { label: '₪', value: 'ILS' },
  { label: '₫', value: 'VND' },
  { label: '€', value: 'EUR' },
  { label: '₱', value: 'PHP' },
  { label: '₲', value: 'PYG' },
  { label: '₴', value: 'UAH' },
  { label: '₹', value: 'INR' },
  { label: '₺', value: 'TRY' },
  { label: '₽', value: 'RUB' },
  { label: '₾', value: 'GEL' },
  { label: '₿', value: 'BTC' },
  { label: 'Ł', value: 'LTC' },
  { label: 'ɱ', value: 'XMR' },
  { label: 'zł', value: 'PLN' },
  { label: 'Ξ', value: 'ETH' },
];

export const currenciesOptions = currenciesData
  .map(({ value, label }) => ({
    label: `${value} (${label})`,
    value: label,
  }))
  .sort((a, b) => {
    const abbrA = a.label.split(' ')[0] || '';
    const abbrB = b.label.split(' ')[0] || '';
    return abbrA.localeCompare(abbrB);
  });

export const workTypesOptions = ['remote', 'hybrid', 'onsite'];

export const skillsOptions = [
  'JavaScript',
  'React.js',
  'React',
  'Python',
  'Node.js',
  'TypeScript',
  'Java',
  'Ruby on Rails',
  'CSS',
  'HTML',
  'Angular',
  'Vue.js',
  'Sass',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'GraphQL',
  'REST API',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Redux',
  'Next.js',
  'Express.js',
];

export const marketsOptions = [
  'SaaS',
  'FinTech',
  'HealthTech',
  'E-commerce',
  'Education',
  'Enterprise Software',
  'Marketplace',
  'AI/ML',
  'DevTools',
  'Gaming',
  'Social Media',
  'Cryptocurrency',
  'Security',
  'Climate Tech',
  'Real Estate',
  'Travel',
  'Food & Beverage',
  'Others',
];

export const companySizesOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];
export const contractOptions = ['full-time', 'part-time', 'contract', 'internship'];
export const rolesOptions = ['Backend', 'Frontend', 'Full-Stack', 'Mobile', 'DevOps', 'Data'];

export const timeframeOptions = ['Hour', 'Day', 'Week', 'Month', 'Year'];
