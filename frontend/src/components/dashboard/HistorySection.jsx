import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyses } from '../../services/analysis_service';
import { History, Clock, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const HistorySection = () => {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAnalyses();
        setAnalyses(data || []);
      } catch (err) {
        setError('Analysis history unavailable.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mt-6 shadow-sm flex-1 flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-white tracking-wide">Analysis History</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <p className="text-xs text-center">{error}</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-4 text-center border border-slate-700/50 border-dashed rounded-lg">
            <FileText className="h-6 w-6 text-slate-500" />
            <p className="text-xs">No analysis history found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((item) => (
              <div key={item.analysis_id} className="bg-slate-900 border border-slate-700 p-3 rounded-md hover:border-slate-500 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-slate-200 line-clamp-2 pr-2">
                    {item.user_request || "Unknown Request"}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                    item.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                
                <div className="flex items-center text-[10px] text-slate-400 mb-3 gap-1">
                  <Clock className="h-3 w-3" />
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown Date'}
                </div>
                
                <div className="flex gap-2 text-[10px] font-medium border-t border-slate-800 pt-2">
                  <Link to={`/analyses/${item.analysis_id}`} className="text-blue-400 hover:text-blue-300 flex items-center flex-1">
                    Result
                  </Link>
                  <Link to={`/mcp/${item.analysis_id}`} className="text-slate-400 hover:text-slate-300 flex items-center border-l border-slate-700 pl-2">
                    MCP
                  </Link>
                  <Link to={`/traces/${item.analysis_id}`} className="text-slate-400 hover:text-slate-300 flex items-center border-l border-slate-700 pl-2">
                    Trace
                  </Link>
                  <Link to={`/metrics/${item.analysis_id}`} className="text-slate-400 hover:text-slate-300 flex items-center border-l border-slate-700 pl-2">
                    Metrics
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;
