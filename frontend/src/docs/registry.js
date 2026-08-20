export const documentRegistry = [
  {
    id: "overview",
    title: "Overview",
    category: "Getting Started",
    load: () => import('../../../docs/overview.md?raw').then(m => m.default)
  },
  {
    id: "architecture",
    title: "System Architecture",
    category: "Architecture",
    load: () => import('../../../docs/architecture.md?raw').then(m => m.default)
  },
  {
    id: "agent_workflow",
    title: "Agent Workflow",
    category: "Architecture",
    load: () => import('../../../docs/agent_workflow.md?raw').then(m => m.default)
  },
  {
    id: "mcp",
    title: "MCP Architecture",
    category: "MCP / Tools",
    load: () => import('../../../docs/mcp.md?raw').then(m => m.default)
  },
  {
    id: "skills",
    title: "Skills",
    category: "AI / Agents",
    load: () => import('../../../docs/skills.md?raw').then(m => m.default)
  },
  {
    id: "llm_observability",
    title: "LLM Observability",
    category: "AI / Agents",
    load: () => import('../../../docs/llm_observability.md?raw').then(m => m.default)
  },
  {
    id: "prompt_optimizer",
    title: "Prompt Optimizer",
    category: "AI / Agents",
    load: () => import('../../../docs/prompt_optimizer.md?raw').then(m => m.default)
  }
];

export const getDocumentById = (id) => {
  return documentRegistry.find(doc => doc.id === id);
};

export const searchDocuments = async (query) => {
  if (!query) return [];
  
  const q = query.toLowerCase();
  const results = [];
  
  for (const doc of documentRegistry) {
    if (doc.title.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q)) {
      results.push({ ...doc, matchType: 'title' });
      continue;
    }
    
    try {
      const content = await doc.load();
      if (content.toLowerCase().includes(q)) {
        results.push({ ...doc, matchType: 'content' });
      }
    } catch (e) {
      // safely ignore failed loads during search
      console.error(`Failed to load ${doc.id} for search`, e);
    }
  }
  
  return results;
};
