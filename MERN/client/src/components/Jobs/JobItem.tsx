import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { addRole, setLevel, addSkill } from '../../redux/reducers/filterSlice';
import { levelsOptions } from '../../constants/filters';
import { Job } from '../../types';

interface JobItemProps {
  job: Job;
}

const JobItem = ({ job }: JobItemProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleFilterClick = (filterType: 'role' | 'level' | 'skills', value: string) => {
    if (filterType === 'role') {
      dispatch(addRole(value));
    } else if (filterType === 'level') {
      const levelObj = levelsOptions.find((l) => l.label === value || l.value === value);
      if (levelObj) {
        dispatch(setLevel(levelObj.value));
      }
    } else if (filterType === 'skills') {
      const normalizedValue = value.toLowerCase().replace(/\s+/g, '-');
      dispatch(addSkill(normalizedValue));
    }
  };

  return (
    <li
      className={`relative flex flex-col lg:flex-row gap-8 lg:gap-4 bg-white rounded-md shadow-[0_12px_16px_0_#d7e9ec] mb-8 lg:mb-4 p-7 px-6 lg:px-10 ${
        job.featured
          ? "before:content-[''] before:absolute before:w-1.5 before:h-full before:bg-[#5ea4a6] before:top-0 before:left-0 before:rounded-l-md"
          : ''
      }`}
    >
      <div className="relative w-16 h-16 lg:w-[88px] lg:h-[88px] -mt-14 md:mt-0 mb-[-16px] flex-shrink-0">
        {job.logo ? (
          <img
            src={job.logo}
            alt={`${job.company} logo`}
            className="w-16 h-16 object-contain rounded-lg"
          />
        ) : (
          <div
            className="w-16 h-16 my-auto rounded-full bg-grayish-cyan/10 text-cyan-400/60 flex items-center justify-center text-2xl font-bold"
            aria-hidden
          >
            <p className="my-auto">{job.company.trim().charAt(0).toUpperCase()}</p>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center">
        <div className="">
          <div className="flex items-center justify-start gap-1 flex-wrap">
            <Link
              to={`/jobs/${job.id}`}
              aria-label={`View details for ${job.position} at ${job.company}`}
              className="text-sm text-cyan-400 hover:text-cyan-400/50 mr-5 whitespace-nowrap font-semibold hover:underline"
            >
              <h2>{job.company}</h2>
            </Link>
            {job.new && (
              <span className="bg-cyan-400 text-white uppercase px-2 pt-1 h-6 rounded-full flex items-center justify-center text-[11px] font-bold">
                New!
              </span>
            )}
            {job.featured && (
              <span className="bg-black text-white uppercase px-2 pt-1 h-6 rounded-full flex items-center justify-center text-[11px] font-bold">
                Featured
              </span>
            )}
          </div>

          <h3 className="mt-3 hover:text-cyan-400 transition-colors duration-200 cursor-pointer text-base font-bold">
            {job.position}
          </h3>

          <div className="mt-4 flex items-center flex-wrap text-sm text-[#7b8e8e]">
            <span className="relative mr-6 after:content-['.'] after:ml-1.5 after:text-3xl after:absolute after:top-[-18px] after:opacity-70 after:blur-[0.06rem]">
              {job.postedAt}
            </span>
            <span className="relative mr-6 after:content-['.'] after:ml-1.5 after:text-3xl after:absolute after:top-[-18px] after:opacity-70 after:blur-[0.06rem] capitalize">
              {job.contract}
            </span>
            <span>{job.location}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-4 lg:ml-auto">
          <button
            onClick={() => handleFilterClick('role', job.role)}
            className="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
          >
            {job.role}
          </button>
          <button
            onClick={() => handleFilterClick('level', job.level)}
            className="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
          >
            {job.level}
          </button>
          {job.skills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleFilterClick('skills', skill)}
              className="px-3 py-2 h-8 bg-[#eef6f6] text-cyan-400 font-bold rounded-sm hover:bg-cyan-400 hover:text-white transition-colors duration-200 capitalize"
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
};

export default JobItem;
