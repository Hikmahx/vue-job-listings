import { Bell } from 'lucide-react';
import bgHeaderDesktop from '../../assets/img/bg-header-desktop.svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const notifications = 5;

  return (
    <nav className="relative bg-cyan-400 shadow-sm border-b border-gray-200 h-20 flex items-center px-6 md:px-12">
      <img
        src={bgHeaderDesktop}
        className="absolute inset-0 w-full lg:hidden object-cover object-right h-full"
        alt="bg-header-mobile"
      />
      <img
        src={bgHeaderDesktop}
        className="absolute inset-0 hidden lg:flex w-full h-full object-cover"
        alt="bg-header-desktop"
      />
      <div className="w-full flex items-center justify-between relative">
        <div>
          <h1 className="text-2xl font-bold text-cyan-50 hidden">Job Portal</h1>
        </div>

        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-cyan-50" />
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-cyan-50">
                {user?.fullName?.split(' ')[0]} {user?.fullName?.split(' ')[1]?.charAt(0)}.
              </p>
              <p className="text-xs text-cyan-50 capitalize">
                {user?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-cyan-900 font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
