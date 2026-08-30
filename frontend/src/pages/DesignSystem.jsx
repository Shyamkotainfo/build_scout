import React, { useState } from 'react';
import {
  Activity, Zap, Database, GitBranch, Shield, BarChart3,
  CheckCircle, AlertTriangle, XCircle, Clock, Loader2
} from 'lucide-react';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatusIndicator from '../components/ui/StatusIndicator';
import Tabs from '../components/ui/Tabs';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Tooltip from '../components/ui/Tooltip';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import MetricCard from '../components/ui/MetricCard';
import SectionHeader from '../components/ui/SectionHeader';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="text-base font-semibold text-[var(--bs-navy-800)] border-b border-[var(--bs-border-light)] pb-2 mb-4">
      {title}
    </h3>
    {children}
  </div>
);

const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);

  const demoTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details',  label: 'Details' },
    { id: 'config',   label: 'Configuration' },
  ];

  const demoColumns = [
    { key: 'name',   label: 'Component' },
    { key: 'status', label: 'Status', render: (val) => <Badge status={val}>{val.toUpperCase()}</Badge> },
    { key: 'type',   label: 'Type' },
  ];

  const demoData = [
    { id: 1, name: 'Auth Module',    status: 'reuse', type: 'Library' },
    { id: 2, name: 'Payment Engine', status: 'adapt', type: 'Service' },
    { id: 3, name: 'Custom Logic',   status: 'build', type: 'Internal' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--bs-text-primary)]">
          BuildScout Design System
        </h1>
        <p className="text-sm text-[var(--bs-text-tertiary)] mt-1">
          Development / Design Reference — Component library and visual tokens
        </p>
      </div>

      {/* ── Colors ──────────────────────────────────────────────────── */}
      <Section title="Color Palette">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-[var(--bs-text-tertiary)] mb-2">60% — Light Backgrounds</p>
            <div className="flex gap-2">
              {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'].map((c) => (
                <div key={c} className="flex flex-col items-center">
                  <div className="h-10 w-16 rounded border border-[var(--bs-border-light)]" style={{ backgroundColor: c }} />
                  <span className="text-[10px] mt-1 text-[var(--bs-text-muted)]">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--bs-text-tertiary)] mb-2">30% — Navy Structural</p>
            <div className="flex gap-2">
              {['#0f172a', '#1e293b', '#334155', '#475569', '#64748b'].map((c) => (
                <div key={c} className="flex flex-col items-center">
                  <div className="h-10 w-16 rounded" style={{ backgroundColor: c }} />
                  <span className="text-[10px] mt-1 text-[var(--bs-text-muted)]">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--bs-text-tertiary)] mb-2">10% — Orange Accent</p>
            <div className="flex gap-2">
              {['#fff7ed', '#fdba74', '#f97316', '#ea580c', '#c2410c'].map((c) => (
                <div key={c} className="flex flex-col items-center">
                  <div className="h-10 w-16 rounded" style={{ backgroundColor: c }} />
                  <span className="text-[10px] mt-1 text-[var(--bs-text-muted)]">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Buttons ─────────────────────────────────────────────────── */}
      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </Section>

      {/* ── Cards ───────────────────────────────────────────────────── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <p className="text-sm text-[var(--bs-text-primary)]">Default card</p>
          </Card>
          <Card variant="bordered">
            <p className="text-sm text-[var(--bs-text-primary)]">Bordered card</p>
          </Card>
          <Card variant="elevated">
            <p className="text-sm text-[var(--bs-text-primary)]">Elevated card</p>
          </Card>
        </div>
      </Section>

      {/* ── Badges — Decision Outcomes ──────────────────────────────── */}
      <Section title="Badges — Decision Outcomes">
        <div className="flex flex-wrap gap-3">
          <Badge status="reuse">REUSE</Badge>
          <Badge status="adapt">ADAPT</Badge>
          <Badge status="build">BUILD</Badge>
        </div>
      </Section>

      {/* ── Badges — System States ──────────────────────────────────── */}
      <Section title="Badges — System States">
        <div className="flex flex-wrap gap-3">
          <Badge status="pass" />
          <Badge status="warning" />
          <Badge status="critical" />
          <Badge status="running" />
          <Badge status="pending" />
          <Badge status="completed" />
          <Badge status="failed" />
          <Badge status="connected" />
          <Badge status="unavailable" />
        </div>
      </Section>

      {/* ── Status Indicators ───────────────────────────────────────── */}
      <Section title="Status Indicators">
        <div className="flex flex-wrap gap-4">
          <StatusIndicator status="connected" />
          <StatusIndicator status="running" />
          <StatusIndicator status="warning" />
          <StatusIndicator status="critical" />
          <StatusIndicator status="unavailable" />
          <StatusIndicator status="pending" />
          <StatusIndicator status="completed" />
        </div>
      </Section>

      {/* ── Metric Cards ────────────────────────────────────────────── */}
      <Section title="Metric Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Analyses" value="24" icon={Activity} trend="up" />
          <MetricCard label="Components" value="142" icon={Database} />
          <MetricCard label="Decisions" value="89" icon={GitBranch} trend="flat" />
          <MetricCard label="LLM Calls" value="1,204" icon={Zap} trend="down" />
        </div>
      </Section>

      {/* ── Section Header ──────────────────────────────────────────── */}
      <Section title="Section Header">
        <Card>
          <SectionHeader
            title="Analysis Overview"
            subtitle="Latest analysis results and agent activity"
            actions={<Button variant="outline" size="sm">View All</Button>}
          />
        </Card>
      </Section>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Section title="Tabs">
        <Tabs tabs={demoTabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-4 p-4 bg-[var(--bs-bg-primary)] rounded-b-lg border border-t-0 border-[var(--bs-border-light)]">
          <p className="text-sm text-[var(--bs-text-secondary)]">
            Active tab: <strong>{activeTab}</strong>
          </p>
        </div>
      </Section>

      {/* ── Inputs ──────────────────────────────────────────────────── */}
      <Section title="Inputs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Input label="Repository URL" placeholder="https://github.com/..." />
          <Input label="API Key" placeholder="Enter key..." error="This field is required" />
          <Input label="Disabled" placeholder="Not editable" disabled />
        </div>
      </Section>

      {/* ── Select ──────────────────────────────────────────────────── */}
      <Section title="Select">
        <div className="max-w-xs">
          <Select
            label="LLM Provider"
            options={[
              { value: 'bedrock', label: 'AWS Bedrock' },
              { value: 'groq',    label: 'Groq' },
            ]}
          />
        </div>
      </Section>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <Section title="Table">
        <Table columns={demoColumns} data={demoData} />
      </Section>

      {/* ── Empty / Loading / Error States ──────────────────────────── */}
      <Section title="Empty State">
        <Card>
          <EmptyState
            title="No analyses yet"
            description="Run your first analysis to see results here."
            action={<Button variant="primary" size="sm">New Analysis</Button>}
          />
        </Card>
      </Section>

      <Section title="Loading State">
        <Card>
          <LoadingState message="Processing analysis..." />
        </Card>
      </Section>

      <Section title="Error State">
        <Card>
          <ErrorState
            title="Connection Failed"
            message="Unable to reach the BuildScout backend."
            onRetry={() => {}}
          />
        </Card>
      </Section>

      {/* ── Skeleton ────────────────────────────────────────────────── */}
      <Section title="Skeleton Loading">
        <Card>
          <div className="space-y-3">
            <Skeleton variant="text" width="60%" height="1rem" />
            <Skeleton variant="text" count={3} />
            <Skeleton variant="rect" height="5rem" />
          </div>
        </Card>
      </Section>

      {/* ── Tooltip ─────────────────────────────────────────────────── */}
      <Section title="Tooltip">
        <div className="flex gap-6 py-4">
          <Tooltip content="Top tooltip" position="top">
            <Button variant="outline" size="sm">Hover (Top)</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" position="right">
            <Button variant="outline" size="sm">Hover (Right)</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <Button variant="outline" size="sm">Hover (Bottom)</Button>
          </Tooltip>
        </div>
      </Section>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      <Section title="Modal">
        <Button variant="outline" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Action"
        >
          <p className="text-sm text-[var(--bs-text-secondary)] mb-4">
            This is a modal dialog. Press Escape or click the backdrop to close.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>Confirm</Button>
          </div>
        </Modal>
      </Section>
    </div>
  );
};

export default DesignSystem;
