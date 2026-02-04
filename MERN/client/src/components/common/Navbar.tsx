import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import Logo from '../icons/Logo';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/jobs', label: 'Jobs' },
    { to: '#companies', label: 'Companies' },
    { to: '#about', label: 'About' },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    if (!path.startsWith('#')) {
      navigate(path);
      closeMobileMenu();
    }
  };

  return (
    <nav className="relative lg:absolute top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out">
      <div className="container mx-auto max-w-3xl lg:max-w-6xl 2xl:max-w-7xl px-4 py-8 lg:py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-20">
            <Link to="/" className="flex flex-col items-center flex-shrink-0">
              <Logo iconClass="fill-cyan-50" textClass="fill-white" logoClass="!h-5" />
            </Link>

            <div className="hidden md:flex items-center gap-6 ml-[84px]">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="transition-colors duration-300 text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <button className="border-0 px-6 lg:px-7 h-12 transition-all duration-300 text-white bg-transparent hover:opacity-80">
                Login
              </button>
            </Link>

            <Link to="/signup">
              <button className="px-6 lg:px-7 h-12 transition-all duration-300 bg-white text-cyan-900 rounded-lg font-semibold hover:bg-cyan-50">
                Signup
              </button>
            </Link>
          </div>

          <button
            className="md:hidden transition-colors duration-300 text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-[300px] max-w-full bg-white translate-x-0 rounded-none">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-end mb-8">
                <button
                  onClick={closeMobileMenu}
                  className="text-cyan-900 hover:text-cyan-400 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => navigateTo(link.to)}
                    className="text-cyan-900 font-medium hover:text-cyan-400 transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-4 pt-6 border-t">
                <Link to="/login">
                  <button
                    className="w-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400/30 px-4 py-2 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </button>
                </Link>

                <Link to="/signup">
                  <button
                    className="w-full bg-cyan-400 hover:bg-cyan-900 text-white px-4 py-2 rounded-lg"
                    onClick={closeMobileMenu}
                  >
                    Signup
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
