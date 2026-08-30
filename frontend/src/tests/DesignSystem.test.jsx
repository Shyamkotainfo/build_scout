import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataProvider } from "../contexts/DataContext";
import { HealthProvider } from "../contexts/HealthContext";
import { MemoryRouter } from 'react-router-dom';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import StatusIndicator from '../components/ui/StatusIndicator';
import Tabs from '../components/ui/Tabs';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import MetricCard from '../components/ui/MetricCard';
import SectionHeader from '../components/ui/SectionHeader';

// ── Button ─────────────────────────────────────────────────────────────

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders primary variant by default', () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-[var(--bs-orange-500)]');
  });

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-[var(--bs-navy-800)]');
  });

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-transparent');
  });

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-transparent');
  });

  it('applies disabled attribute', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('text-xs');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('text-base');
  });

  it('calls onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// ── Card ───────────────────────────────────────────────────────────────

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild.className).toContain('rounded-lg');
    expect(container.firstChild.className).toContain('border');
  });

  it('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    expect(container.firstChild.className).toContain('shadow');
  });
});

// ── Badge ──────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renders status text when no children', () => {
    render(<Badge status="reuse" />);
    expect(screen.getByText('REUSE')).toBeInTheDocument();
  });

  it('renders children over status text', () => {
    render(<Badge status="reuse">Custom Text</Badge>);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('applies aria-label for status', () => {
    render(<Badge status="adapt" />);
    expect(screen.getByText('ADAPT').closest('span')).toHaveAttribute('aria-label', 'Status: adapt');
  });

  it('renders all decision statuses', () => {
    const statuses = ['reuse', 'adapt', 'build'];
    statuses.forEach((s) => {
      const { unmount } = render(<Badge status={s} />);
      expect(screen.getByText(s.toUpperCase())).toBeInTheDocument();
      unmount();
    });
  });

  it('renders all system statuses', () => {
    const statuses = ['pass', 'warning', 'critical', 'running', 'pending', 'completed', 'failed', 'connected', 'unavailable'];
    statuses.forEach((s) => {
      const { unmount } = render(<Badge status={s} />);
      expect(screen.getByText(s.toUpperCase())).toBeInTheDocument();
      unmount();
    });
  });
});

// ── StatusIndicator ────────────────────────────────────────────────────

describe('StatusIndicator', () => {
  it('renders with label by default', () => {
    render(<StatusIndicator status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<StatusIndicator status="connected" showLabel={false} />);
    expect(screen.queryByText('Connected')).not.toBeInTheDocument();
  });

  it('has role=status', () => {
    render(<StatusIndicator status="running" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<StatusIndicator status="failed" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Status: Failed');
  });
});

// ── Tabs ───────────────────────────────────────────────────────────────

describe('Tabs', () => {
  const tabs = [
    { id: 'a', label: 'Tab A' },
    { id: 'b', label: 'Tab B' },
    { id: 'c', label: 'Tab C' },
  ];

  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('marks active tab', () => {
    render(<Tabs tabs={tabs} activeTab="b" onTabChange={() => {}} />);
    const tabB = screen.getByRole('tab', { name: 'Tab B' });
    expect(tabB).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onTabChange on click', () => {
    const handleChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={handleChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Tab C' }));
    expect(handleChange).toHaveBeenCalledWith('c');
  });

  it('has tablist role', () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});

// ── Input ──────────────────────────────────────────────────────────────

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Name" error="Required field" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('sets aria-invalid on error', () => {
    render(<Input label="Name" error="Required" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies disabled', () => {
    render(<Input label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('accepts input', () => {
    render(<Input label="Test" />);
    const input = screen.getByLabelText('Test');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });
});

// ── Select ─────────────────────────────────────────────────────────────

describe('Select', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  it('renders label', () => {
    render(<Select label="Provider" options={options} />);
    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
  });

  it('renders options', () => {
    render(<Select label="Provider" options={options} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('shows error', () => {
    render(<Select label="Provider" options={options} error="Required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });
});

// ── Table ──────────────────────────────────────────────────────────────

describe('Table', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value' },
  ];

  it('renders empty message when no data', () => {
    render(<Table columns={columns} data={[]} emptyMessage="No results" />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    const data = [{ id: 1, name: 'Alpha', value: '100' }];
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});

// ── Skeleton ───────────────────────────────────────────────────────────

describe('Skeleton', () => {
  it('renders with role=status', () => {
    render(<Skeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders multiple items when count > 1', () => {
    render(<Skeleton count={3} />);
    expect(screen.getAllByRole('status')).toHaveLength(3);
  });
});

// ── EmptyState ─────────────────────────────────────────────────────────

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<EmptyState title="Empty" description="Start by adding items" />);
    expect(screen.getByText('Start by adding items')).toBeInTheDocument();
  });

  it('renders action', () => {
    render(<EmptyState title="Empty" action={<button>Add</button>} />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
});

// ── ErrorState ─────────────────────────────────────────────────────────

describe('ErrorState', () => {
  it('renders title and message', () => {
    render(<ErrorState title="Oops" message="Something broke" />);
    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('has role=alert', () => {
    render(<ErrorState />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders retry button when onRetry provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorState onRetry={handleRetry} />);
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button without onRetry', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });
});

// ── LoadingState ───────────────────────────────────────────────────────

describe('LoadingState', () => {
  it('renders message', () => {
    render(<LoadingState message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('has role=status', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ── MetricCard ─────────────────────────────────────────────────────────

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Total" value="42" />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders dash when value is null', () => {
    render(<MetricCard label="Empty" value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

// ── SectionHeader ──────────────────────────────────────────────────────

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Overview" />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<SectionHeader title="Overview" subtitle="Summary of results" />);
    expect(screen.getByText('Summary of results')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(<SectionHeader title="Test" actions={<button>Action</button>} />);
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
