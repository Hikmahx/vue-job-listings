import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Sparkles } from 'lucide-react';
import { AppDispatch } from '../../redux/store';
import { setFilters } from '../../redux/reducers/filterSlice';
import { fetchJobs } from '../../redux/reducers/jobSlice';
import { jobService } from '../../services/jobService';
import type { FilterFields } from '../../types';

const STANDARD_KEYS = new Set([
  'search',
  'location',
  'minSalary',
  'maxSalary',
  'workType',
  'level',
  'skills',
  'markets',
  'companySizes',
  'contract',
  'roles',
  'currency',
  'timeframe',
  'sortByCompany',
]);

const AISearchInput = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [aiQuery, setAiQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiAppliedCriteria, setAiAppliedCriteria] = useState<string[]>([]);

  const handleAISearch = async () => {
    if (loading || !aiQuery.trim()) return;
    setLoading(true);
    setError('');
    setAiAppliedCriteria([]);
    try {
      const { filters, ai_filters, ai_applied_criteria } =
        await jobService.parseQuery(aiQuery.trim());

      const standard: Partial<FilterFields> = {};
      const aiBag: Record<string, unknown> = { ...(ai_filters || {}) };

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (!STANDARD_KEYS.has(key)) {
          aiBag[key] = value;
          return;
        }
        // Basic normalization
        if (key === 'minSalary' || key === 'maxSalary') {
          (standard as any)[key] =
            typeof value === 'number' ? value : undefined;
          return;
        }
        if (key === 'sortByCompany') {
          (standard as any)[key] =
            typeof value === 'boolean' ? value : undefined;
          return;
        }
        if (
          ['skills', 'markets', 'companySizes', 'contract', 'roles'].includes(
            key,
          )
        ) {
          (standard as any)[key] = Array.isArray(value) ? value : undefined;
          return;
        }
        (standard as any)[key] = typeof value === 'string' ? value : undefined;
      });

      dispatch(setFilters({ ...standard, aiFilters: aiBag } as any));
      dispatch(fetchJobs({ page: 1 }));
      if (ai_applied_criteria?.length) {
        setAiAppliedCriteria(ai_applied_criteria);
      } else {
        setAiAppliedCriteria([]);
      }
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Failed to process search. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    // submit only on Enter without Shift (allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISearch();
    }
  };

  return (
    <div className='space-y-4 p-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-50 rounded-lg border-2 border-gray-200'>
      <div className='flex items-center gap-2'>
        <Sparkles className='w-5 h-5 text-cyan-400 shrink-0' />
        <input
          type='text'
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={handleKeydown}
          placeholder='e.g. "Frontend developer in Nigeria, SaaS, Vue.js" or "Female founder, 20+ employees"'
          className='flex-1 border-none shadow-none focus:ring-0 focus:outline-none text-sm bg-transparent p-0 placeholder:text-gray-500 w-full text-cyan-900'
        />
      </div>{' '}
      {/* button removed per request */}
      {loading && <p className='text-sm text-cyan-400'>Searching with AI…</p>}
      {error && (
        <p className='text-sm text-red-500 bg-red-50/50 p-2 rounded'>{error}</p>
      )}
      {aiAppliedCriteria.length > 0 && (
        <p className='text-xs text-cyan-900 mt-1'>
          Applied: {aiAppliedCriteria.join(' · ')}
        </p>
      )}
    </div>
  );
};

export default AISearchInput;
