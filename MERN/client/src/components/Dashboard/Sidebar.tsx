import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Info } from 'lucide-react';
import Logo from '../icons/Logo';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  isOpen: boolean;
  onNavigate: (path: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar = ({ items, activeItem, onNavigate, onLogout }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <aside
      className="fixed md:w-20 w-20 h-screen bg-cyan-900 transition-all duration-300 ease-in-out z-40 hover:w-64"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="py-6 pl-3 border-b border-gray-200">
        <Link to="/" className="group transition-all duration-300">
          <Logo
            iconClass={!isExpanded ? 'fill-white' : 'fill-cyan-400'}
            textClass={!isExpanded ? 'fill-white' : 'fill-cyan-400'}
            hideText={!isExpanded}
            logoClass="w-[100px]"
          />
        </Link>
      </div>
      {/* Navigation Items */}
      <nav className="px-3 py-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeItem === item.id
                  ? 'bg-cyan-400 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
            >
              <span className="flex-shrink-0">
                <Icon className="w-6 h-6" />
              </span>
              <span
                className={`transition-opacity duration-300 ${
                  isExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Items */}
      <div className="border-t border-gray-300 px-3 py-4 space-y-2 absolute bottom-0 left-0 right-0">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap">
          <span className="flex-shrink-0">
            <Info className="w-6 h-6" />
          </span>
          <span
            className={`transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            Help
          </span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-300 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 text-sm font-medium whitespace-nowrap"
        >
          <span className="flex-shrink-0">
            <LogOut className="w-6 h-6" />
          </span>
          <span
            className={`transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
