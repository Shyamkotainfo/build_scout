import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import ResearchExplorer from './pages/ResearchExplorer';
import EvaluationDecisionExplorer from './pages/EvaluationDecisionExplorer';
import ArchitectureExplorer from './pages/ArchitectureExplorer';
import AgentTraceExplorer from './pages/AgentTraceExplorer';
import McpConsole from './pages/McpConsole';
import LlmMetricsConsole from './pages/LlmMetricsConsole';
import DocumentationExplorer from './pages/DocumentationExplorer';
import V2Specification from './pages/V2Specification';
import Roadmap from './pages/Roadmap';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';
import DesignSystem from './pages/DesignSystem';
import AnalysesList from './pages/AnalysesList';
import ValidationExplorer from './pages/ValidationExplorer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-analysis" element={<NewAnalysis />} />
          <Route path="analyses" element={<AnalysesList />} />
          <Route path="analyses/:analysisId" element={<AnalysisResult />} />
          <Route path="research/:analysisId" element={<ResearchExplorer />} />
          <Route path="decisions/:analysisId" element={<EvaluationDecisionExplorer />} />
          <Route path="architecture/:analysisId" element={<ArchitectureExplorer />} />
          <Route path="validation/:analysisId" element={<ValidationExplorer />} />
          <Route path="traces/:analysisId" element={<AgentTraceExplorer />} />
          <Route path="mcp/:analysisId" element={<McpConsole />} />
          <Route path="metrics/:analysisId" element={<LlmMetricsConsole />} />
          <Route path="docs" element={<DocumentationExplorer />} />
          <Route path="docs/:documentId" element={<DocumentationExplorer />} />
          <Route path="v2" element={<V2Specification />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="settings" element={<Settings />} />
          <Route path="design-system" element={<DesignSystem />} />
          
          {/* Catch-all global pages without an analysisId that user might click from navbar placeholders */}
          <Route path="research" element={<ResearchExplorer />} />
          <Route path="decisions" element={<EvaluationDecisionExplorer />} />
          <Route path="architecture" element={<ArchitectureExplorer />} />
          <Route path="validation" element={<ValidationExplorer />} />
          <Route path="agent-trace/:analysisId" element={<AgentTraceExplorer />} />
          <Route path="agent-trace" element={<AgentTraceExplorer />} />
          <Route path="tools/:analysisId" element={<McpConsole />} />
          <Route path="tools" element={<McpConsole />} />
          <Route path="metrics" element={<LlmMetricsConsole />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
