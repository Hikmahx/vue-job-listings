import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from './SectionTitle';

interface SuccessStory {
  id: number;
  content: string;
  name: string;
  role: string;
  company: string;
  image: string;
}

const successStories: SuccessStory[] = [
  {
    id: 1,
    content:
      "I've used several job platforms before, but this one stood out immediately. The filters are detailed, fast, and accurate, and the advanced search helped me uncover roles I would not have found otherwise. Switching between search modes and manual filters made the process both flexible and efficient.",
    name: 'Amina Yusuf',
    role: 'Senior Software Developer',
    company: 'Photosnap',
    image: '/lorem1.webp',
  },
  {
    id: 2,
    content:
      'The search felt surprisingly intuitive. I typed what I was looking for, and the results were highly relevant. It even adjusted filters automatically, which saved me time and made job hunting far less overwhelming than usual.',
    name: 'Daniel Okafor',
    role: 'Mobile Developer',
    company: 'MyHome',
    image: '/lorem2.png',
  },
  {
    id: 3,
    content:
      'What I liked most was the balance between control and intelligence. I could rely on the search for discovery, then fine-tune results using traditional filters. The experience felt thoughtful, well-designed, and clearly built with real job seekers in mind.',
    name: 'Sarah Mitchell',
    role: 'Senior Software Engineer',
    company: 'Loop Studios',
    image: '/lorem3.png',
  },
  {
    id: 4,
    content:
      'As a frontend developer, I appreciated how clean and responsive the interface felt. The search results loaded quickly, filters were precise, and the suggestions were relevant without being overwhelming. It made the entire job search experience feel modern.',
    name: 'James Carter',
    role: 'Frontend Developer',
    company: 'Shortly',
    image: '/lorem4.png',
  },
  {
    id: 5,
    content:
      'The platform made it easy to explore roles across industries without feeling lost. I especially liked how the search interpreted intent rather than just keywords. It helped surface opportunities that actually matched my skills and interests.',
    name: 'Lydia Chen',
    role: 'UI/UX Designer',
    company: 'The Air Filter Company',
    image: '/lorem5.png',
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % successStories.length);
  };

  const getCardRole = (index: number) => {
    const diff = (index - currentIndex + successStories.length) % successStories.length;

    if (diff === 0) return 'center';
    if (diff === 1 || diff === successStories.length - 1)
      return diff === 1 ? 'right' : 'left';
    if (diff === 2 || diff === successStories.length - 2)
      return diff === 2 ? 'far-right' : 'far-left';
    return 'hidden';
  };

  const roleClasses: Record<string, string> = {
    center: 'left-1/2 -translate-x-1/2 z-30 opacity-100 scale-100',
    left: 'left-[25%] -translate-x-1/2 z-20 opacity-80 scale-[0.7]',
    right: 'left-[75%] -translate-x-1/2 z-20 opacity-80 scale-[0.7]',
    'far-left': 'left-[15%] -translate-x-1/2 z-10 opacity-40 scale-[0.6]',
    'far-right': 'left-[85%] -translate-x-1/2 z-10 opacity-40 scale-[0.6]',
    hidden: 'opacity-0 pointer-events-none',
  };

  if (!isMounted) return null;

  return (
    <div className="w-full px-4 py-16 lg:py-24 bg-cyan-50 overflow-hidden">
      <SectionTitle title="WHAT THEY HAVE SAID" />

      <div className="w-full max-w-6xl mx-auto">
        <div className="relative h-[400px] md:h-[300px]">
          <div className="relative w-full h-full">
            {successStories.map((story, index) => (
              <div
                key={story.id}
                className={`absolute top-0 w-full max-w-3xl rounded-xl border border-border bg-white p-6 md:p-8 shadow-sm transition-all duration-500 ease-in-out ${roleClasses[getCardRole(index)]}`}
              >
                <div className="flex flex-col justify-between h-full gap-8">
                  <p className="text-gray-600 text-sm md:text-base leading-loose font-thin line-clamp-6 md:line-clamp-none">
                    {story.content}
                  </p>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-cyan-900 font-bold">
                        {story.name.charAt(0)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div>
                        <h4 className="font-bold text-cyan-900 text-sm mb-1">{story.name}</h4>
                        <p className="text-grayish-cyan text-xs">
                          {story.role}, {story.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="absolute left-0 right-0 bottom-[-60px] flex justify-center items-center space-x-2">
            <button className="p-2" onClick={handlePrev}>
              <ChevronLeft className="h-5 w-5 text-grayish-cyan" />
            </button>

            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${
                  currentIndex === index ? 'bg-cyan-400' : 'bg-gray-300'
                }`}
              />
            ))}

            <button className="p-2" onClick={handleNext}>
              <ChevronRight className="h-5 w-5 text-grayish-cyan" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
