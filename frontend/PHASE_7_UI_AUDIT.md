# BuildScout Phase 7 UI Audit

## Findings

1. **Duplicate UI Information**
   - **Health Status**: Both `Navbar.jsx` and `SystemStatusPanel.jsx` (on the Dashboard) show the backend health status. This is redundant since Navbar is always visible. The Dashboard panel should be removed or repurposed to only show deeper metric thresholds if needed.
   
2. **Broken Navigation / Orphan Pages**
   - **Sidebar Analysis Links**: Links to `/research`, `/decisions`, `/architecture`, `/agent-trace`, `/tools`, and `/metrics` in `Sidebar.jsx` do not include an `:analysisId` parameter. Clicking them drops the user into a `PlaceholderPage` or empty route state. They should inject the current active `analysisId` from the URL, or redirect to the dashboard/history if none is selected.

3. **Inconsistent Typography & Spacing**
   - **Page Headers**: The `<SectionHeader>` component is used inconsistently across pages. Some use custom inline flex layouts, while others use the design system.
   
4. **Dead/Unused Legacy Components**
   - **`PhasesAndRisks.jsx`**: (Previously removed in Phase 6, but need to check for any residual imports).
   - **`PlaceholderPage.jsx`**: Should only be used for genuinely unimplemented V2 features, not as a fallback for broken route params.
   
5. **Responsive Behavior**
   - Architecture Data Flow and Tables need to be checked for horizontal scrolling overflow on smaller viewports.

6. **Information Overload**
   - The Dashboard has a lot of dense components: `AgentWorkflowVisualizer`, `ResearchDiscovery`, `ValidationPanel`, `DecisionHighlights`, `WhyBuild`. These can be overwhelming. Some may need their visual prominence reduced to guide the user's eye to the primary action: viewing the latest analysis result.

## Action Plan
- **Remove** the duplicate SystemStatusPanel from the Dashboard.
- **Fix** the Sidebar to track the active `analysisId` and append it to dependent routes.
- **Ensure** consistent page layouts matching the `HEADER -> CONTEXT -> EVIDENCE -> ACTION` pattern.
- **Audit** and remove any fully dead files like `DashboardHeader.jsx` if it's just a duplicate of `SectionHeader`.
- **Run** full test suite to ensure regressions are caught.
