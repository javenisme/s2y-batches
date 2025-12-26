/**
 * RiskScoreCard - Display personalized risk assessment results
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  LinearProgress,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { RiskAssessmentResponse } from '../types';

interface RiskScoreCardProps {
  assessment: RiskAssessmentResponse;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment }) => {
  const getRiskColor = (riskLevel: string) => {
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

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return <CheckCircleIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'high':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const riskColor = getRiskColor(assessment.risk_level);
  const riskPercentage = (assessment.risk_score / 10) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Personalized Risk Assessment
      </Typography>

      {/* Risk Score Display */}
      <Box sx={{ my: 3, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Typography variant="h2" component="div" sx={{ fontWeight: 'bold' }}>
            {assessment.risk_score.toFixed(1)}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ ml: 1 }}>
            / 10
          </Typography>
        </Box>

        <Chip
          icon={getRiskIcon(assessment.risk_level)}
          label={`${assessment.risk_level} Risk`}
          color={riskColor}
          size="large"
          sx={{ mb: 2 }}
        />

        <LinearProgress
          variant="determinate"
          value={riskPercentage}
          color={riskColor}
          sx={{ height: 10, borderRadius: 5 }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Confidence: {(assessment.confidence * 100).toFixed(0)}%
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Risk Factors */}
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Key Risk Factors
      </Typography>

      <List dense>
        {assessment.risk_factors.map((factor, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={factor.factor}
              secondary={`Impact: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(1)} | ${factor.description}`}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Comparative Statistics */}
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Batch Statistics
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Total Reports
          </Typography>
          <Typography variant="h6">
            {assessment.comparative_stats.batch_total_reports.toLocaleString()}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Severe Reports
          </Typography>
          <Typography variant="h6">
            {assessment.comparative_stats.batch_severe_pct.toFixed(1)}%
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Deaths
          </Typography>
          <Typography variant="h6">
            {assessment.comparative_stats.batch_deaths}
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            National Average
          </Typography>
          <Typography variant="h6">
            {assessment.comparative_stats.national_avg_risk.toFixed(1)}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" color="info.dark">
          This assessment is based on VAERS data and your profile. It should not replace medical advice.
          Consult with your healthcare provider for personalized guidance.
        </Typography>
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
        Assessment generated: {new Date(assessment.timestamp).toLocaleString()}
      </Typography>
    </Paper>
  );
};

export default RiskScoreCard;
