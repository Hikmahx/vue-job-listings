import { useState } from 'react';
import SvgSlanted from '../icons/SvgSlanted';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'Do I need to create an account before applying for a job?',
    answer:
      'You can browse, search, and explore all job listings without creating an account. However, to apply for jobs, save listings, or receive personalized notifications, you will need to create an account. This helps us keep your applications organized and provide a better experience.',
  },
  {
    id: '2',
    question: 'Can I, as a founder, create and manage multiple company profiles?',
    answer:
      'Yes, founders can create and manage multiple company profiles from a single account. This makes it easy to post jobs for different teams or ventures, update company details independently, and track applications across all your companies in one place.',
  },
  {
    id: '3',
    question: 'How accurate is the job search?',
    answer:
      'Our search uses advanced filtering to deeply analyze your query and match it against the job database. It combines semantic understanding with structured filters to surface highly relevant roles, improving accuracy compared to keyword-only search.',
  },
  {
    id: '4',
    question: 'Can I use filters to refine my search?',
    answer:
      'Yes, you can easily use traditional filters at any time. This flexibility allows you to refine results manually using precise filters based on your exact requirements including salary, location, skills, and more.',
  },
  {
    id: '5',
    question: 'What types of jobs can I find on this platform?',
    answer:
      'The platform features a wide range of roles across different industries, experience levels, and work types. You can find remote, hybrid, and onsite positions, spanning startups and growing companies, with detailed information to help you make informed decisions.',
  },
];

const FAQs = () => {
  const [openId, setOpenId] = useState<string>('1');

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? '' : id);
  };

  return (
    <div className="relative overflow-hidden bg-cyan-50">
      <div className="bg-cyan-400 bg-opacity-[15%] overflow-hidden">
        <SvgSlanted className="text-cyan-400 absolute -left-80 -bottom-80" />
        <div className="relative z-10 py-16 lg:py-24">
          <div className="container max-w-3xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left */}
              <div className="flex flex-col justify-start flex-1 text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold mb-6 tracking-wider text-cyan-900">
                  FAQs
                </h1>

                <p className="text-sm sm:text-base leading-loose text-grayish-cyan">
                  Find clear answers to common questions about using the platform, applying for jobs,
                  and managing searches. Learn how features work, how advanced search helps, and how
                  founders and job seekers can get started quickly.
                </p>
              </div>

              {/* Accordion */}
              <div className="bg-white rounded-xl p-6 sm:p-8 lg:p-8 shadow-[0_12px_16px_0_#d7e9ec] shadow-lg w-full max-w-[720px] mx-auto lg:mr-0">
                <div className="w-full">
                  {faqItems.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 py-4 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="hover:no-underline flex justify-between items-center gap-4 text-left w-full"
                      >
                        <span className="text-base sm:text-lg font-medium">{item.question}</span>
                        <span className="text-cyan-400 text-xl font-bold">
                          {openId === item.id ? '−' : '+'}
                        </span>
                      </button>

                      {openId === item.id && (
                        <div className="text-sm sm:text-base pt-4 pb-0 leading-loose text-grayish-cyan">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
