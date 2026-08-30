import React from 'react';
import { Network, Database, Shield, Server, Box, BookOpen, Layers, Globe } from 'lucide-react';

const ToolArchitecture = () => {
  return (
    <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded-lg p-8 mb-8 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Network className="w-64 h-64" />
      </div>
      
      <h3 className="text-sm font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Available BuildSmart Tool Architecture</h3>
      <p className="text-xs text-[var(--bs-text-secondary)] mb-8 max-w-xl mx-auto">This diagram outlines the registered tool capabilities. It does not imply that every tool was executed for this specific analysis.</p>

      <div className="flex flex-col items-center gap-6 relative z-10 max-w-4xl mx-auto">
        
        {/* Research Agent */}
        <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-3 w-48 shadow-lg shadow-black/50 relative z-10">
          <span className="text-sm font-bold text-[var(--bs-text-primary)] flex items-center justify-center gap-2"><Server className="w-4 h-4 text-[var(--bs-orange-500)]" /> Research Agent</span>
        </div>

        <div className="w-px h-6 bg-[var(--bs-border-medium)]"></div>

        {/* Unified Gateway */}
        <div className="bg-[var(--bs-status-running-light)] border border-[var(--bs-status-running-border)] rounded-lg p-3 w-64 shadow-lg shadow-black/50 relative z-10">
          <span className="text-sm font-bold text-[var(--bs-status-running)] flex items-center justify-center gap-2"><Network className="w-4 h-4" /> Unified Tool Gateway</span>
        </div>

        <div className="w-px h-6 bg-[var(--bs-border-medium)]"></div>
        <div className="w-[600px] h-px bg-[var(--bs-border-medium)]"></div>
        
        <div className="flex gap-[300px] relative -top-[1px]">
          <div className="w-px h-6 bg-[var(--bs-border-medium)]"></div>
          <div className="w-px h-6 bg-[var(--bs-border-medium)]"></div>
        </div>

        <div className="flex gap-[180px] w-full justify-center">
          {/* External MCP */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[var(--bs-orange-600)] uppercase tracking-wider mb-4 bg-[var(--bs-orange-100)] px-3 py-1 rounded-full border border-[var(--bs-orange-200)]">External MCP Providers</span>
            <div className="flex gap-4">
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-4 w-32 shadow-lg flex flex-col items-center gap-2">
                <Box className="w-5 h-5 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)]">GitHub MCP</span>
              </div>
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-4 w-32 shadow-lg flex flex-col items-center gap-2">
                <Globe className="w-5 h-5 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)]">Tavily MCP</span>
              </div>
            </div>
          </div>

          {/* Local Tools */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[var(--bs-status-success)] uppercase tracking-wider mb-4 bg-[var(--bs-status-success-light)] px-3 py-1 rounded-full border border-[var(--bs-status-success-border)]">Local Native Tools</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-3 w-32 shadow-lg flex flex-col items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)] text-center">Security</span>
              </div>
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-3 w-32 shadow-lg flex flex-col items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)] text-center">License</span>
              </div>
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-3 w-32 shadow-lg flex flex-col items-center gap-2">
                <Database className="w-4 h-4 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)] text-center text-balance leading-tight">AWS Docs</span>
              </div>
              <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-3 w-32 shadow-lg flex flex-col items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--bs-text-secondary)]" />
                <span className="text-xs font-semibold text-[var(--bs-text-primary)] text-center text-balance leading-tight">Cloud Arch</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ToolArchitecture;
