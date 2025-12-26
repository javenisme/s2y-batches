/**
 * Risk Assessment page - Personalized risk assessment for a batch code
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { batchService } from '../services/batchService';
import { riskService } from '../services/riskService';
import RiskScoreCard from '../components/RiskScoreCard';
import BatchInfoCard from '../components/BatchInfoCard';
import UserProfileForm from '../components/UserProfileForm';
import type { BatchDetails, RiskAssessmentResponse, UserProfile } from '../types';

const RiskAssessment: React.FC = () => {
  const { batchCode } = useParams<{ batchCode: string }>();
  const navigate = useNavigate();

  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  useEffect(() => {
    if (batchCode) {
      loadBatchDetails();
    }
  }, [batchCode]);

  const loadBatchDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await batchService.getBatchDetails(batchCode!);
      setBatchDetails(data);
    } catch (err: any) {
      setError(err.response?.status === 404
        ? `Batch code "${batchCode}" not found`
        : 'Error loading batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfileSubmit = async (profile: UserProfile) => {
    if (!batchCode) return;

    setAssessmentLoading(true);
    setError(null);

    try {
      const assessment = await riskService.assessRisk({
        batch_code: batchCode,
        user_profile: profile,
      });
      setRiskAssessment(assessment);
    } catch (err: any) {
      setError('Error calculating risk assessment. Please try again.');
    } finally {
      setAssessmentLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !batchDetails) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Back to Search
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Search
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          Risk Assessment: {batchCode}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Batch Information */}
          <Grid item xs={12} md={4}>
            {batchDetails && <BatchInfoCard batch={batchDetails} />}
          </Grid>

          {/* Right Column - Risk Assessment */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personalized Risk Assessment
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide your profile information to get a personalized risk score
              </Typography>

              <Divider sx={{ my: 2 }} />

              <UserProfileForm
                onSubmit={handleUserProfileSubmit}
                loading={assessmentLoading}
              />
            </Paper>

            {riskAssessment && (
              <RiskScoreCard assessment={riskAssessment} />
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RiskAssessment;
