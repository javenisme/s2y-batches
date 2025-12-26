/**
 * Home page - Landing page with batch code lookup
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { batchService } from '../services/batchService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [batchCode, setBatchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!batchCode.trim()) {
      setError('Please enter a batch code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify batch exists
      await batchService.getBatchDetails(batchCode.trim());
      // Navigate to risk assessment page
      navigate(`/risk-assessment/${batchCode.trim()}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`Batch code "${batchCode}" not found in our database`);
      } else {
        setError('Error checking batch code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Long COVID Risk Assessment
          </Typography>

          <Typography variant="h6" color="text.secondary" paragraph>
            Check the safety profile of your vaccine batch
          </Typography>

          <Box sx={{ mt: 4, mb: 2 }}>
            <TextField
              fullWidth
              label="Enter Batch Code"
              variant="outlined"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="e.g., EK5730, EN6201"
              disabled={loading}
              error={!!error}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              onClick={handleSearch}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Checking...' : 'Check Batch Safety'}
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Or{' '}
              <Button
                variant="text"
                onClick={() => navigate('/symptom-patterns')}
                sx={{ textTransform: 'none' }}
              >
                explore symptom patterns
              </Button>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Data source: VAERS (Vaccine Adverse Event Reporting System)
            <br />
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
