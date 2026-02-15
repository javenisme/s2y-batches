/**
 * Tests for RiskExplanationCard component
 * Run with: npm test -- --testPathPattern=RiskExplanationCard
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RiskExplanationCard from '../components/RiskExplanationCard';
import type { BatchDetails } from '../types';

// Mock data
const mockBatchHighRisk: BatchDetails = {
  batch_code: 'EK5730',
  manufacturer: 'Pfizer',
  total_reports: 1250,
  deaths: 23,
  disabilities: 45,
  life_threatening: 67,
  hospitalizations: 156,
  severe_reports_pct: 12.5,
  lethality_pct: 1.8,
  risk_score: 7.8,
  risk_level: 'High',
  vaccine_type: 'COVID-19',
  first_report_date: '2021-01-15',
  last_report_date: '2023-06-30',
  country_distribution: { 'United States': 1000, 'Canada': 150, 'UK': 100 },
  state_distribution: { 'CA': 200, 'TX': 150, 'NY': 120 },
  created_at: '2023-01-01',
  updated_at: '2023-06-30',
};

const mockBatchLowRisk: BatchDetails = {
  batch_code: 'AB1234',
  manufacturer: 'Moderna',
  total_reports: 500,
  deaths: 2,
  disabilities: 5,
  life_threatening: 8,
  hospitalizations: 25,
  severe_reports_pct: 3.2,
  lethality_pct: 0.4,
  risk_score: 2.5,
  risk_level: 'Low',
  vaccine_type: 'COVID-19',
  first_report_date: '2021-06-01',
  last_report_date: '2023-06-30',
  country_distribution: null,
  state_distribution: null,
  created_at: '2023-01-01',
  updated_at: '2023-06-30',
};

describe('RiskExplanationCard', () => {
  describe('Rendering', () => {
    it('should render batch code and manufacturer', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('风险评估')).toBeInTheDocument();
    });

    it('should display risk score', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('7.8')).toBeInTheDocument();
    });

    it('should display risk level label', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('高风险')).toBeInTheDocument();
    });

    it('should display low risk correctly', () => {
      render(<RiskExplanationCard batch={mockBatchLowRisk} />);
      expect(screen.getByText('低风险')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display total reports', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    it('should display death count', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should display severe reports percentage', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('12.5%')).toBeInTheDocument();
    });

    it('should display lethality percentage', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText('1.80%')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should toggle calculation method accordion', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      
      // Initially expanded should be false
      expect(screen.queryByText(/基础分数 =/)).not.toBeVisible();
      
      // Click to expand
      const accordion = screen.getByText('📖 如何计算风险分数？');
      fireEvent.click(accordion);
      
      // Should now be visible
      expect(screen.getByText(/基础分数 =/)).toBeVisible();
    });
  });

  describe('Recommendations', () => {
    it('should show high risk recommendations', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText(/建议咨询医疗专业人员/)).toBeInTheDocument();
    });

    it('should show low risk recommendations', () => {
      render(<RiskExplanationCard batch={mockBatchLowRisk} />);
      expect(screen.getByText(/按常规注意事项观察/)).toBeInTheDocument();
    });
  });

  describe('National Comparison', () => {
    it('should show above average for high risk', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText(/高于全国平均/)).toBeInTheDocument();
    });

    it('should show below average for low risk', () => {
      render(<RiskExplanationCard batch={mockBatchLowRisk} />);
      expect(screen.getByText(/低于全国平均/)).toBeInTheDocument();
    });
  });

  describe('Disclaimer', () => {
    it('should display disclaimer', () => {
      render(<RiskExplanationCard batch={mockBatchHighRisk} />);
      expect(screen.getByText(/免责声明/)).toBeInTheDocument();
    });
  });
});
