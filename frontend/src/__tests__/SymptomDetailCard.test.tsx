/**
 * Tests for SymptomDetailCard component
 * Run with: npm test -- --testPathPattern=SymptomDetailCard
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SymptomDetailCard from '../components/SymptomDetailCard';
import type { SymptomDetail, SymptomTimeDistribution } from '../types';

// Mock data
const mockSymptoms: SymptomDetail[] = [
  {
    symptom: '呼吸困难',
    frequency: 89,
    percentage: 7.2,
    severity: 'severe',
    avg_onset_days: 3.2,
    median_duration_days: 5,
    hospitalization_rate: 23.0,
    mortality_rate: 2.0,
  },
  {
    symptom: '胸痛',
    frequency: 67,
    percentage: 5.4,
    severity: 'severe',
    avg_onset_days: 2.5,
    median_duration_days: 4,
    hospitalization_rate: 18.0,
    mortality_rate: 1.0,
  },
  {
    symptom: '头痛',
    frequency: 342,
    percentage: 27.5,
    severity: 'common',
    avg_onset_days: 1.5,
    median_duration_days: 2,
  },
  {
    symptom: '疲劳',
    frequency: 298,
    percentage: 24.0,
    severity: 'common',
    avg_onset_days: 1.8,
    median_duration_days: 3,
  },
  {
    symptom: '发热',
    frequency: 267,
    percentage: 21.5,
    severity: 'common',
    avg_onset_days: 1.2,
    median_duration_days: 2,
  },
  {
    symptom: '肌肉酸痛',
    frequency: 234,
    percentage: 18.8,
    severity: 'common',
    avg_onset_days: 1.4,
    median_duration_days: 2,
  },
  {
    symptom: '皮疹',
    frequency: 45,
    percentage: 3.6,
    severity: 'mild',
    avg_onset_days: 5.0,
    median_duration_days: 7,
  },
];

const mockTimeDistribution: SymptomTimeDistribution[] = [
  { range: '0-7 天', common_count: 342, severe_count: 23 },
  { range: '8-14 天', common_count: 156, severe_count: 12 },
  { range: '15-21 天', common_count: 89, severe_count: 8 },
  { range: '22-30 天', common_count: 67, severe_count: 5 },
];

describe('SymptomDetailCard', () => {
  const defaultProps = {
    symptoms: mockSymptoms,
    batchCode: 'EK5730',
    totalReports: 1250,
  };

  describe('Rendering', () => {
    it('should render symptom statistics header', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('📋 症状统计')).toBeInTheDocument();
    });

    it('should display total symptom count', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('共 7 种症状')).toBeInTheDocument();
    });
  });

  describe('Severity Classification', () => {
    it('should show severe symptom count', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 severe symptoms
      expect(screen.getByText('严重症状')).toBeInTheDocument();
    });

    it('should show common symptom count', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('4')).toBeInTheDocument(); // 4 common symptoms
      expect(screen.getByText('常见症状')).toBeInTheDocument();
    });

    it('should show mild symptom count', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument(); // 1 mild symptom
      expect(screen.getByText('轻微症状')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by severe symptoms', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      const severitySelect = screen.getByLabelText('严重程度');
      fireEvent.change(severitySelect, { target: { value: 'severe' } });
      
      // Should only show severe symptoms
      expect(screen.getByText('呼吸困难')).toBeInTheDocument();
      expect(screen.getByText('胸痛')).toBeInTheDocument();
    });

    it('should filter by search term', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('搜索症状...');
      fireEvent.change(searchInput, { target: { value: '头痛' } });
      
      expect(screen.getByText('头痛')).toBeInTheDocument();
      expect(screen.queryByText('疲劳')).not.toBeInTheDocument();
    });
  });

  describe('Symptom Details', () => {
    it('should display symptom frequency', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('89')).toBeInTheDocument(); // 呼吸困难 frequency
    });

    it('should display symptom percentage', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      expect(screen.getByText('7.2%')).toBeInTheDocument();
    });
  });

  describe('Time Distribution', () => {
    it('should display time distribution when available', () => {
      render(<SymptomDetailCard {...defaultProps} timeDistribution={mockTimeDistribution} />);
      
      // Click to expand time distribution
      const expandButton = screen.getByText('📈 症状出现时间分布');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('0-7 天')).toBeInTheDocument();
      expect(screen.getByText('8-14 天')).toBeInTheDocument();
    });
  });

  describe('Symptom Dialog', () => {
    it('should open dialog on symptom click', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      // Click on a symptom row
      const symptomRow = screen.getByText('呼吸困难');
      fireEvent.click(symptomRow);
      
      // Dialog should open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('出现次数')).toBeInTheDocument();
    });

    it('should display hospitalization rate in dialog', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      // Click on severe symptom
      fireEvent.click(screen.getByText('呼吸困难'));
      
      expect(screen.getByText('23.0%')).toBeInTheDocument(); // hospitalization rate
    });

    it('should close dialog on close button', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      // Open dialog
      fireEvent.click(screen.getByText('呼吸困难'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Close dialog
      const closeButton = screen.getByRole('button', { name: /关闭/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no symptoms match filter', () => {
      render(<SymptomDetailCard {...defaultProps} />);
      
      // Search for non-existent symptom
      const searchInput = screen.getByPlaceholderText('搜索症状...');
      fireEvent.change(searchInput, { target: { value: '不存在的症状' } });
      
      expect(screen.getByText('未找到匹配的症状')).toBeInTheDocument();
    });
  });
});
