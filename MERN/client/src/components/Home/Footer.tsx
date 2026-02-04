import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Github } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'twitter', href: '#', icon: Twitter },
    { name: 'facebook', href: '#', icon: Facebook },
    { name: 'instagram', href: '#', icon: Instagram },
    { name: 'github', href: '#', icon: Github },
  ];

  const footerColumns = [
    {
      title: 'Resources',
      links: [
        { text: 'Service', href: '#' },
        { text: 'Browse Jobs', href: '#' },
        { text: 'Companies', href: '#' },
      ],
    },
    {
      title: 'Help',
      links: [
        { text: 'Customer Support', href: '#' },
        { text: 'Terms & Conditions', href: '#' },
        { text: 'Privacy Policy', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-cyan-900 text-white py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 xl:gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="flex items-center">
                <img src="/logo.svg" alt="JobList Logo" className="h-5" />
              </Link>
            </div>
            <p className="text-grayish-cyan text-sm leading-relaxed mb-6">
              A modern job platform connecting talent with opportunity. Find roles faster using smart
              filters and advanced search.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-grayish-cyan hover:bg-cyan-400 hover:text-cyan-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-semibold text-lg mb-4 md:mb-6">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="text-grayish-cyan hover:text-white transition-colors text-sm md:text-base"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-white font-semibold text-lg mb-4 md:mb-6">Subscribe to Newsletter</h3>
            <div className="flex w-full">
              <input
                type="email"
                placeholder="Enter email address"
                className="flex-1 w-full px-4 py-3 rounded-l-lg text-xs placeholder:text-xs focus:outline-none bg-white text-cyan-900"
              />
              <button className="px-6 md:px-8 py-3 rounded-r-lg text-white bg-cyan-400 font-medium text-sm md:text-base hover:opacity-90 transition-opacity">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-grayish-cyan">
          <p className="text-grayish-cyan text-center text-sm">
            © {currentYear} JobList, All Rights Reserved. | Site by{' '}
            <a
              href="https://github.com/Hikmahx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-50 hover:text-white transition-colors underline"
            >
              Hikmah
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
