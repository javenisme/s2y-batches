/**
 * BatchTable - Table component for displaying batch data
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { BatchSummary } from '../types';

interface BatchTableProps {
  batches: BatchSummary[];
}

const BatchTable: React.FC<BatchTableProps> = ({ batches }) => {
  const navigate = useNavigate();

  const getRiskColor = (riskLevel: string | null) => {
    if (!riskLevel) return 'default';
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (batchCode: string) => {
    navigate(`/risk-assessment/${batchCode}`);
  };

  if (batches.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        No batches found matching your criteria
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Batch Code</TableCell>
            <TableCell>Manufacturer</TableCell>
            <TableCell align="right">Total Reports</TableCell>
            <TableCell align="right">Deaths</TableCell>
            <TableCell align="right">Severe %</TableCell>
            <TableCell align="right">Risk Score</TableCell>
            <TableCell align="center">Risk Level</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.batch_code} hover>
              <TableCell>
                <strong>{batch.batch_code}</strong>
              </TableCell>
              <TableCell>{batch.manufacturer}</TableCell>
              <TableCell align="right">
                {batch.total_reports.toLocaleString()}
              </TableCell>
              <TableCell align="right">
                <span style={{ color: batch.deaths > 0 ? '#d32f2f' : 'inherit' }}>
                  {batch.deaths}
                </span>
              </TableCell>
              <TableCell align="right">
                {batch.severe_reports_pct !== null
                  ? `${batch.severe_reports_pct.toFixed(1)}%`
                  : 'N/A'}
              </TableCell>
              <TableCell align="right">
                {batch.risk_score !== null ? batch.risk_score.toFixed(1) : 'N/A'}
              </TableCell>
              <TableCell align="center">
                {batch.risk_level && (
                  <Chip
                    label={batch.risk_level}
                    color={getRiskColor(batch.risk_level)}
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewDetails(batch.batch_code)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BatchTable;
