import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KPICard } from '../components/KPICard';
import { Zap } from 'lucide-react';

describe('KPICard Component', () => {
  it('renders value and label correctly', () => {
    render(<KPICard icon={<Zap data-testid="zap-icon" />} label="Carbon Output" value="2,420" color="green" />);
    expect(screen.getByText('Carbon Output')).toBeInTheDocument();
    expect(screen.getByText('2,420')).toBeInTheDocument();
    expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
  });

  it('renders positive delta badge when provided', () => {
    render(<KPICard icon={<Zap />} label="Response Speed" value={2.4} delta={12} deltaLabel="%" color="blue" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders negative delta badge when provided', () => {
    render(<KPICard icon={<Zap />} label="Response Speed" value={2.4} delta={-5} deltaLabel="%" color="blue" />);
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });
});
