/**
 * SymptomChart - Chart.js visualization for symptom/risk distribution
 */

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { BatchSummary } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SymptomChartProps {
  batches: BatchSummary[];
}

const SymptomChart: React.FC<SymptomChartProps> = ({ batches }) => {
  const chartData = useMemo(() => {
    // Group by risk level
    const riskGroups = {
      Low: 0,
      Medium: 0,
      High: 0,
      Unknown: 0,
    };

    batches.forEach((batch) => {
      if (batch.risk_level) {
        riskGroups[batch.risk_level as keyof typeof riskGroups]++;
      } else {
        riskGroups.Unknown++;
      }
    });

    return {
      labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Unknown'],
      datasets: [
        {
          label: 'Number of Batches',
          data: [riskGroups.Low, riskGroups.Medium, riskGroups.High, riskGroups.Unknown],
          backgroundColor: [
            'rgba(76, 175, 80, 0.6)',  // Green for Low
            'rgba(255, 152, 0, 0.6)',   // Orange for Medium
            'rgba(244, 67, 54, 0.6)',   // Red for High
            'rgba(158, 158, 158, 0.6)', // Grey for Unknown
          ],
          borderColor: [
            'rgba(76, 175, 80, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(244, 67, 54, 1)',
            'rgba(158, 158, 158, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [batches]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = batches.length;
            const value = context.parsed.y;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${value} batches (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SymptomChart;
