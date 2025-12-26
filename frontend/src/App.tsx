/**
 * App - Main application component with routing
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Pages
import Home from './pages/Home';
import RiskAssessment from './pages/RiskAssessment';
import SymptomPatterns from './pages/SymptomPatterns';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create MUI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header */}
            <AppBar position="static">
              <Toolbar>
                <LocalHospitalIcon sx={{ mr: 2 }} />
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{
                    flexGrow: 1,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  LCRAS - Long COVID Risk Assessment
                </Typography>
                <Button
                  color="inherit"
                  component={Link}
                  to="/"
                  sx={{ textTransform: 'none' }}
                >
                  Home
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/symptom-patterns"
                  sx={{ textTransform: 'none' }}
                >
                  Symptom Patterns
                </Button>
              </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/risk-assessment/:batchCode" element={<RiskAssessment />} />
                <Route path="/symptom-patterns" element={<SymptomPatterns />} />
              </Routes>
            </Box>

            {/* Footer */}
            <Box
              component="footer"
              sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[800],
              }}
            >
              <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                  Long COVID Risk Assessment System (LCRAS) &copy; {new Date().getFullYear()}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  Data source: VAERS (Vaccine Adverse Event Reporting System)
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  This tool is for informational purposes only and does not constitute medical advice.
                </Typography>
              </Container>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
