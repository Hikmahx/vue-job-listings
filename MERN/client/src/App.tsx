import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MainLayout from './components/Dashboard/MainLayout'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import CompanyForm from './pages/CompanyForm'
import AppliedJobs from './pages/AppliedJobs'
import Settings from './pages/Settings'
import CreateJob from './pages/CreateJob'
import ColdEmailTracker from './pages/ColdEmailTracker'
import ColdEmailEntryPage from './pages/ColdEmailEntryPage'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/jobs' element={<Jobs />} />
      <Route path='/jobs/:id' element={<JobDetail />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/dashboard' element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='companies'>
          <Route index element={<Companies />} />
          <Route path='create' element={<CompanyForm />} />
          <Route path=':slug'>
            <Route index element={<CompanyDetail />} />
            <Route path='edit' element={<CompanyForm />} />
          </Route>
        </Route>
        <Route path='applied-jobs' element={<AppliedJobs />} />
        <Route path='cold-email-tracker/new' element={<ColdEmailEntryPage />} />
        <Route path='cold-email-tracker/:id' element={<ColdEmailEntryPage />} />
        <Route path='cold-email-tracker' element={<ColdEmailTracker />} />
        <Route path='settings' element={<Settings />} />
        <Route path='create-job' element={<CreateJob />} />
      </Route>
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App
