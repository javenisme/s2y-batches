/**
 * BatchInfoCard - Display batch details summary
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import type { BatchDetails } from '../types';

interface BatchInfoCardProps {
  batch: BatchDetails;
}

const BatchInfoCard: React.FC<BatchInfoCardProps> = ({ batch }) => {
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

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Batch Information</Typography>
      </Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {batch.batch_code}
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        {batch.manufacturer}
      </Typography>

      {batch.risk_level && (
        <Chip
          label={`${batch.risk_level} Risk`}
          color={getRiskColor(batch.risk_level)}
          size="small"
          sx={{ mb: 2 }}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="caption" color="text.secondary">
            Total Reports
          </Typography>
          <Typography variant="h6">
            {batch.total_reports.toLocaleString()}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Deaths
          </Typography>
          <Typography variant="h6" color="error">
            {batch.deaths}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Disabilities
          </Typography>
          <Typography variant="h6">
            {batch.disabilities}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Hospitalizations
          </Typography>
          <Typography variant="h6">
            {batch.hospitalizations}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">
            Life-Threatening
          </Typography>
          <Typography variant="h6">
            {batch.life_threatening}
          </Typography>
        </Grid>

        {batch.severe_reports_pct !== null && (
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Severe Reports
            </Typography>
            <Typography variant="h6">
              {batch.severe_reports_pct.toFixed(1)}%
            </Typography>
          </Grid>
        )}

        {batch.lethality_pct !== null && (
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Lethality Rate
            </Typography>
            <Typography variant="h6" color="error">
              {batch.lethality_pct.toFixed(2)}%
            </Typography>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary">
        Report Date Range
      </Typography>
      <Typography variant="body2">
        {batch.first_report_date || 'N/A'} to {batch.last_report_date || 'N/A'}
      </Typography>
    </Paper>
  );
};

export default BatchInfoCard;
