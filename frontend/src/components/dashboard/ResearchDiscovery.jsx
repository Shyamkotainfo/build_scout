import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink, Code } from 'lucide-react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

const ResearchDiscovery = ({ analysis }) => {
  if (!analysis) return null;

  const candidates = analysis.candidates || [];
  
  if (candidates.length === 0) {
    return (
      <div className="mb-6">
        <SectionHeader title="Research Discovery" subtitle="What BuildScout found" />
        <Card>
          <EmptyState 
            icon={Search} 
            title="No candidates discovered" 
            description="The research phase did not identify any existing solutions for these requirements." 
          />
        </Card>
      </div>
    );
  }

  // Pick exactly 3 representative candidates
  const topCandidates = candidates.slice(0, 3);

  return (
    <div className="mb-6 h-full flex flex-col">
      <SectionHeader 
        title="What BuildScout Discovered" 
      />
      
      {/* Evidence Summary */}
      <div className="mb-4">
        <p className="text-sm font-medium text-[var(--bs-text-secondary)]">
          <span className="text-[var(--bs-text-primary)] font-bold">{candidates.length} candidate solutions</span> from GitHub + Web + MCP tools
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {topCandidates.map(c => {
          const isGithub = c.url && c.url.includes('github.com');
          return (
            <Card key={`${c.component_id}-${c.name}`} className="p-4 hover:border-[var(--bs-border-medium)] transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-[var(--bs-text-primary)] text-sm">{c.name}</h3>
                {isGithub ? (
                  <Badge variant="outline" className="text-[10px]">GitHub</Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Web</Badge>
                )}
              </div>
              <div className="text-xs text-[var(--bs-text-secondary)] line-clamp-2 mb-3 flex-1">
                <span className="font-semibold text-[var(--bs-text-primary)] mr-1">Why relevant:</span>
                {c.description}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-auto pt-2 border-t border-[var(--bs-border-light)]">
                {c.license && c.license !== 'Unknown' && (
                  <div className="flex items-center text-[11px] font-mono text-[var(--bs-text-tertiary)]">
                    <Code className="w-3 h-3 mr-1" /> {c.license}
                  </div>
                )}
                {c.url && (
                  <a 
                    href={c.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="ml-auto text-[11px] font-medium text-[var(--bs-orange-500)] hover:text-[var(--bs-orange-600)] flex items-center"
                  >
                    Source <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </Card>
          );
        })}
        
        {candidates.length > 3 && (
          <div className="mt-2 text-center">
            <Link to={`/research/${analysis.analysis_id}`} className="text-xs font-semibold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors">
              View all {candidates.length} candidates
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchDiscovery;
