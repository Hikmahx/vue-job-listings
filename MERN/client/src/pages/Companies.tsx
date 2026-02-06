import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { AppDispatch, RootState } from '../redux/store'
import { fetchMyCompanies, deleteCompany } from '../redux/reducers/companySlice'

const Companies = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { companies, loading, error } = useSelector(
    (state: RootState) => state.companies,
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchMyCompanies())
  }, [dispatch])

  const handleCreate = () => {
    navigate('/dashboard/companies/create')
  }

  const handleView = (slug: string) => {
    navigate(`/dashboard/companies/${slug}`)
    setShowMenu(null)
  }

  const handleEdit = (slug: string) => {
    navigate(`/dashboard/companies/${slug}/edit`)
    setShowMenu(null)
  }

  const handleDeleteClick = (slug: string) => {
    setCompanyToDelete(slug)
    setShowDeleteDialog(true)
    setShowMenu(null)
  }

  const confirmDelete = async () => {
    if (companyToDelete) {
      try {
        await dispatch(deleteCompany(companyToDelete)).unwrap()
        setShowDeleteDialog(false)
        setCompanyToDelete(null)
      } catch (err) {
        console.error('Failed to delete company:', err)
      }
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog(false)
    setCompanyToDelete(null)
  }

  const toggleMenu = (slug: string) => {
    setShowMenu(showMenu === slug ? null : slug)
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-8'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>My Companies</h2>
        <button
          onClick={handleCreate}
          className='flex items-center gap-2 bg-cyan-400 hover:bg-cyan-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors'
        >
          <Plus className='w-5 h-5' />
          Create Company
        </button>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4'>
          {error}
        </div>
      )}

      {loading ? (
        <div className='text-center py-12'>
          <p className='text-gray-600'>Loading companies...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 mb-4'>
            You haven't created any companies yet.
          </p>
          <button
            onClick={handleCreate}
            className='bg-cyan-400 hover:bg-cyan-900 text-white px-6 py-3 rounded-lg font-semibold'
          >
            Create Your First Company
          </button>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-4 font-semibold text-gray-900'>
                  Company
                </th>
                <th className='text-left py-3 px-4 font-semibold text-gray-900'>
                  Market
                </th>
                <th className='text-left py-3 px-4 font-semibold text-gray-900'>
                  Location
                </th>
                <th className='text-left py-3 px-4 font-semibold text-gray-900'>
                  Permission
                </th>
                <th className='text-left py-3 px-4 font-semibold text-gray-900'>
                  Created
                </th>
                <th className='text-right py-3 px-4 font-semibold text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
                >
                  <td className='py-4 px-4'>
                    <div className='flex items-center gap-3'>
                      {company.logo ? (
                        <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                          <img
                            src={company.logo}
                            alt={company.name}
                            className='w-full h-full object-cover'
                          />
                        </div>
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center'>
                          <span className='text-white font-bold text-sm'>
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {company.name}
                        </p>
                        <p className='text-sm text-gray-500'>
                          {company.description?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='capitalize text-gray-700'>
                      {company.market?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='text-gray-700'>{company.location}</span>
                  </td>
                  <td className='py-4 px-4'>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        company.permission === 'owner'
                          ? 'bg-purple-100 text-purple-700'
                          : company.permission === 'admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {company.permission}
                    </span>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='text-sm text-gray-600'>
                      {company.createdAt
                        ? new Date(company.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </td>
                  <td className='py-4 px-4'>
                    <div className='flex justify-end relative'>
                      <button
                        onClick={() => toggleMenu(company.slug)}
                        className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                      >
                        <MoreVertical className='w-5 h-5 text-gray-600' />
                      </button>
                      {showMenu === company.slug && (
                        <div className='absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]'>
                          <button
                            onClick={() => handleView(company.slug)}
                            className='w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700'
                          >
                            <Eye className='w-4 h-4' />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(company.slug)}
                            className='w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700'
                          >
                            <Edit className='w-4 h-4' />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(company.slug)}
                            className='w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600'
                          >
                            <Trash2 className='w-4 h-4' />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          onClick={cancelDelete}
        >
          <div
            className='bg-white rounded-lg p-6 max-w-md w-full mx-4'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='text-xl font-bold text-gray-900 mb-4'>
              Delete Company
            </h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this company? This action cannot
              be undone.
            </p>
            <div className='flex gap-4 justify-end'>
              <button
                onClick={cancelDelete}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Companies
