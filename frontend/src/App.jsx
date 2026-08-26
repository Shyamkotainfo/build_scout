import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import ResearchExplorer from './pages/ResearchExplorer';
import ArchitectureExplorer from './pages/ArchitectureExplorer';
import AgentTraceExplorer from './pages/AgentTraceExplorer';
import McpConsole from './pages/McpConsole';
import LlmMetricsConsole from './pages/LlmMetricsConsole';
import DocumentationExplorer from './pages/DocumentationExplorer';
import V2Specification from './pages/V2Specification';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-analysis" element={<NewAnalysis />} />
          <Route path="analyses/:analysisId" element={<AnalysisResult />} />
          <Route path="research/:analysisId" element={<ResearchExplorer />} />
          <Route path="architecture/:analysisId" element={<ArchitectureExplorer />} />
          <Route path="traces/:analysisId" element={<AgentTraceExplorer />} />
          <Route path="mcp/:analysisId" element={<McpConsole />} />
          <Route path="metrics/:analysisId" element={<LlmMetricsConsole />} />
          <Route path="docs" element={<DocumentationExplorer />} />
          <Route path="docs/:documentId" element={<DocumentationExplorer />} />
          <Route path="v2" element={<V2Specification />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="analyses" element={<PlaceholderPage title="Analyses" />} />
          <Route path="research" element={<PlaceholderPage title="Research" />} />
          <Route path="architecture" element={<PlaceholderPage title="Architecture" />} />
          <Route path="agent-trace" element={<PlaceholderPage title="Agent Trace" />} />
          <Route path="tools" element={<PlaceholderPage title="MCP & Tools" />} />
          <Route path="metrics" element={<PlaceholderPage title="LLM Metrics" />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
