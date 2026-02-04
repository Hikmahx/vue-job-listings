import Navbar from '../common/Navbar';
import bgHeaderDesktop from '../../assets/img/bg-header-desktop.svg';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header = ({ children }: HeaderProps) => {
  return (
    <div>
      <Navbar />
      <header className="h-40 md:h-[250px] w-full bg-cyan-400">
        <div className="relative w-full h-full">
          <img
            src={bgHeaderDesktop}
            className="absolute inset-0 w-full lg:hidden object-cover object-right h-full"
            alt="bg-header-mobile"
          />
          <img
            src={bgHeaderDesktop}
            className="absolute inset-0 hidden lg:flex h-full"
            alt="bg-header-desktop"
          />
          {children}
        </div>
      </header>
    </div>
  );
};

export default Header;
