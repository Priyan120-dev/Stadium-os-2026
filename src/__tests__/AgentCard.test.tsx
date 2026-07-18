import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgentCard } from '../components/AgentCard';
import { AgentMetric } from '../mockData';

const mockMetric: AgentMetric = {
  name: 'Navigation Agent',
  status: 'online',
  health: 100,
  currentTask: 'Calculating exit routes',
  confidenceScore: 0.98,
  processingTimeMs: 18,
  lastActiveAt: Date.now() - 5000,
  capabilities: ['wheelchair-routing', 'neurodivergent-quiet-zones', 'wcag-alerting'],
  recentEventIds: [],
  performance: {
    avgResponseMs: 19,
    successRate: 0.99,
    totalEventsProcessed: 423,
    eventsLast5Min: 1
  },
  color: '#00b0ff'
};

describe('AgentCard Component', () => {
  it('renders agent name, status badge, and capabilities', () => {
    render(<AgentCard metric={mockMetric} />);
    expect(screen.getByText('Navigation Agent')).toBeInTheDocument();
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText('Calculating exit routes')).toBeInTheDocument();
    expect(screen.getByText('wheelchair-routing')).toBeInTheDocument();
  });
});
