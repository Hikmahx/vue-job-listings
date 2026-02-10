import { useState, useMemo } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import { BarChart3, Briefcase, Settings, Menu, Building2 } from 'lucide-react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../redux/store'
import { logout } from '../../redux/reducers/authSlice'

const MainLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const sidebarItems = useMemo(() => {
    const role = user?.role
    const items: Array<{ id: string; label: string; icon: typeof BarChart3; path: string }> = [
      { id: 'overview', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    ]
    if (role === 'team_member') {
      items.push({ id: 'companies', label: 'Companies', icon: Building2, path: '/dashboard/companies' })
    }
    if (role === 'job_seeker') {
      items.push({ id: 'applied-jobs', label: 'Applied Jobs', icon: Briefcase, path: '/dashboard/applied-jobs' })
    }
    items.push({ id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' })
    return items
  }, [user?.role])

  const activeItem = (() => {
    const path = location.pathname
    if (path === '/dashboard') return 'overview'
    if (path.includes('companies')) return 'companies'
    if (path.includes('applied-jobs')) return 'applied-jobs'
    if (path.includes('settings')) return 'settings'
    return 'overview'
  })()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const navigateTo = (path: string) => {
    navigate(path)
    setIsSidebarOpen(false)
  }

  return (
    <div className='min-h-screen bg-cyan-50'>
      <div className='flex h-screen'>
        <Sidebar
          items={sidebarItems}
          activeItem={activeItem}
          isOpen={isSidebarOpen}
          onNavigate={navigateTo}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className='overflow-auto w-[calc(100%_-_96px)] w-full ml-auto'>
          <Navbar />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className='md:hidden fixed top-[120px] left-4 z-30 bg-white p-2 rounded-lg shadow-md text-gray-900 hover:bg-gray-100'
          >
            <Menu className='w-6 h-6' />
          </button>

          <div className='p-6 md:p-12 pl-[104px] md:pl-32'>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
