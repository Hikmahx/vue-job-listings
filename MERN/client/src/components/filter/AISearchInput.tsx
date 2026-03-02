import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const AISearchInput = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAISearch = async () => {
    if (loading || !aiQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Placeholder: wire to your MERN AI search endpoint when available
      // const response = await axios.post('/api/jobs/ai-search/', { query: aiQuery });
      await new Promise((r) => setTimeout(r, 500));
      setError('AI search not configured. Use Advanced Filters for now.');
    } catch {
      setError('Failed to process search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeydown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      handleAISearch();
    }
  };

  return (
    <div className="space-y-4 p-4 py-2 bg-gradient-to-r from-cyan-50 to-cyan-50 rounded-lg border-2 border-gray-200">
      <div className="flex items-start gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <input
          type="text"
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
          onKeyDown={handleKeydown}
          placeholder='Try: "Senior Frontend developer in Nigeria with Vue.js experience, remote work, SaaS companies"'
          className="flex-1 border-none shadow-none focus:ring-0 focus:outline-none text-sm bg-transparent p-0 placeholder:text-gray-500 w-full text-cyan-900"
        />
      </div>
      {loading && <p className="text-sm text-cyan-400">Searching with AI…</p>}
      {error && (
        <p className="text-sm text-red-500 bg-red-50/50 p-2 rounded">{error}</p>
      )}
    </div>
  );
};

export default AISearchInput;
