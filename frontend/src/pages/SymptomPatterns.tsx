/**
 * Symptom Patterns page - Explore symptom patterns across batches
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { batchService } from '../services/batchService';
import BatchTable from '../components/BatchTable';
import SymptomChart from '../components/SymptomChart';
import type { BatchSummary } from '../types';

const SymptomPatterns: React.FC = () => {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [manufacturer, setManufacturer] = useState<string>('');
  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [maxRiskScore, setMaxRiskScore] = useState<number>(10);

  useEffect(() => {
    loadBatches();
  }, [manufacturer, minRiskScore, maxRiskScore]);

  const loadBatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await batchService.searchBatches({
        manufacturer: manufacturer || undefined,
        risk_score_min: minRiskScore,
        risk_score_max: maxRiskScore,
        limit: 100,
      });
      setBatches(data.batches);
    } catch (err: any) {
      setError('Error loading batch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Symptom Patterns Explorer
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Compare adverse event patterns across vaccine batches
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
              >
                <MenuItem value="">All Manufacturers</MenuItem>
                <MenuItem value="Pfizer">Pfizer</MenuItem>
                <MenuItem value="Moderna">Moderna</MenuItem>
                <MenuItem value="Janssen">Janssen</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="number"
                fullWidth
                label="Min Risk Score"
                value={minRiskScore}
                onChange={(e) => setMinRiskScore(Number(e.target.value))}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                type="number"
                fullWidth
                label="Max Risk Score"
                value={maxRiskScore}
                onChange={(e) => setMaxRiskScore(Number(e.target.value))}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Risk Distribution Chart */}
        {!loading && batches.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Risk Score Distribution
            </Typography>
            <SymptomChart batches={batches} />
          </Paper>
        )}

        {/* Batch Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Batch Details
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <BatchTable batches={batches} />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default SymptomPatterns;
