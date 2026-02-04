import HeroSection from '../components/Home/HeroSection';
import WhyChooseUs from '../components/Home/WhyChooseUs';
import JobsForYou from '../components/Home/JobsForYou';
import FAQs from '../components/Home/FAQs';
import Testimonials from '../components/Home/Testimonials';
import CTA from '../components/Home/CTA';
import Footer from '../components/Home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhyChooseUs />
      <JobsForYou />
      <FAQs />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;
