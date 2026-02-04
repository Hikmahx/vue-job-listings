import SectionTitle from './SectionTitle';
import mapImage from '../../assets/img/map.png';
import filtersImage from '../../assets/img/filters.png';
import aiPoweredSearchImage from '../../assets/img/ai-powered-search.png';

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="">
        <SectionTitle title="WHY CHOOSE US" />

        {/* Global Opportunities Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center mb-12 lg:mb-16">
          <div className="order-2 md:order-1 max-w-xl m-auto text-center md:text-left md:ml-auto md:mr-0 px-4">
            <h2 className="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 sm:mt-7 md:mt-0">
              Global Job Opportunities to Build a Career From Anywhere Worldwide
            </h2>
            <p className="text-grayish-cyan leading-relaxed">
              Explore job opportunities from companies across the globe, including remote, hybrid, and
              onsite roles. Build your career without location limits and discover positions that
              match your goals, no matter where you are.
            </p>
          </div>
          <div className="order-1 md:order-2 relative sm:h-72 xl:h-[330px] 2xl:h-[450px]">
            <div className="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:h-3/4 before:sm:h-[80%] before:2xl:h-[372px] before:top-0 before:right-0 before:w-4/5 before:xl:w-[93%] before:rounded-l-lg before:bg-grayish-cyan">
              <img
                src={mapImage}
                className="relative xl:h-[400px] 2xl:h-[450px] w-full max-w-3xl object-cover"
                alt="map"
              />
            </div>
          </div>
        </div>

        {/* Filter Accuracy Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center">
          <div className="relative sm:h-72 xl:h-[330px] 2xl:h-[450px] xl:flex">
            <div className="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:top-0 before:left-0 before:w-4/5 before:xl:w-[93%] before:h-3/4 before:sm:h-[80%] before:2xl:h-full before:rounded-r-lg before:bg-grayish-cyan">
              <img
                src={filtersImage}
                className="relative h-full 2xl:h-[380px] 3xl:h-[450px] w-auto object-cover object-right 3xl:object-center"
                alt="filters"
              />
            </div>
          </div>
          <div className="order-1 md:order-2 max-w-xl m-auto text-center md:text-left md:mr-auto md:ml-0 px-4">
            <h2 className="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 mt-6 md:mt-0">
              High Accuracy in Sorting and Filtering jobs to your preference
            </h2>
            <p className="text-grayish-cyan leading-relaxed">
              Narrow down job listings quickly using powerful and precise filters. From salary range
              and work type to skills, markets, and company size, easily find roles that truly fit
              what you're looking for.
            </p>
          </div>
        </div>

        {/* AI-Powered Search Section */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-16 md:gap-3 lg:gap-10 items-center mt-12 lg:mt-0">
          <div className="order-2 md:order-1 max-w-xl m-auto text-center md:text-left md:ml-auto md:mr-0 px-4">
            <h2 className="text-2xl font-semibold text-cyan-900 mb-4 tracking-[0.6px] !leading-10 sm:mt-7 md:mt-0">
              Advanced Search Filtering — switch between smart and precise
            </h2>
            <p className="text-grayish-cyan leading-relaxed">
              Go beyond keyword search with advanced filtering that understands meaning and intent. Switch seamlessly
              between search modes and regular filters to get deeper, more relevant results or exact
              matches—without losing your selected preferences.
            </p>
          </div>
          <div className="order-1 md:order-2 relative sm:h-72 xl:h-[330px] 2xl:h-[450px]">
            <div className="p-0 lg:h-inherit flex items-center justify-center before:content-[''] before:absolute before:h-full before:sm:h-3/4 before:2xl:h-[372px] before:top-0 before:right-0 before:w-4/5 before:xl:w-[93%] before:rounded-l-lg before:bg-grayish-cyan">
              <img
                src={aiPoweredSearchImage}
                className="relative w-[90%] md:mt-6 xl:mt-9 ml-auto object-cover"
                alt="ai-powered-search"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
