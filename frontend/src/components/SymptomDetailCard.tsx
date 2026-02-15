/**
 * SymptomDetailCard - Detailed symptom information with filtering
 * User Story 3: Symptom detail transparency
 */

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CloseIcon from '@mui/icons-material/Close';
import type { SymptomDetail, SymptomFilter, SymptomTimeDistribution } from '../types';

interface SymptomDetailCardProps {
  symptoms: SymptomDetail[];
  timeDistribution?: SymptomTimeDistribution[];
  batchCode: string;
  totalReports: number;
}

// Severity classification helper
const classifySeverity = (symptom: string): 'severe' | 'common' | 'mild' => {
  const severeSymptoms = [
    'death', 'died', 'respiratory failure', 'cardiac arrest', 'thrombosis',
    'pulmonary embolism', 'stroke', 'anaphylaxis', ' Guillain-Barré',
    'myocarditis', 'pericarditis', 'blood clot', 'heart attack'
  ];
  
  const commonSymptoms = [
    'headache', 'fatigue', 'fever', 'chills', 'muscle pain', 'joint pain',
    'nausea', 'injection site pain', 'swelling', 'rash', 'dizziness'
  ];
  
  const symptomLower = symptom.toLowerCase();
  
  if (severeSymptoms.some(s => symptomLower.includes(s))) {
    return 'severe';
  } else if (commonSymptoms.some(s => symptomLower.includes(s))) {
    return 'common';
  }
  return 'mild';
};

const SymptomDetailCard: React.FC<SymptomDetailCardProps> = ({
  symptoms,
  timeDistribution,
  batchCode,
  totalReports
}) => {
  const [filter, setFilter] = useState<SymptomFilter>({
    severity: 'all',
    dose_number: undefined,
    date_range: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Enrich symptoms with severity if not provided
  const enrichedSymptoms = useMemo(() => {
    return symptoms.map(s => ({
      ...s,
      severity: s.severity || classifySeverity(s.symptom)
    }));
  }, [symptoms]);

  // Filter symptoms
  const filteredSymptoms = useMemo(() => {
    return enrichedSymptoms.filter(symptom => {
      // Search filter
      if (searchTerm && !symptom.symptom.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Severity filter
      if (filter.severity && filter.severity !== 'all' && symptom.severity !== filter.severity) {
        return false;
      }
      return true;
    });
  }, [enrichedSymptoms, filter, searchTerm]);

  // Group symptoms by severity
  const severeSymptoms = filteredSymptoms.filter(s => s.severity === 'severe');
  const commonSymptoms = filteredSymptoms.filter(s => s.severity === 'common');
  const mildSymptoms = filteredSymptoms.filter(s => s.severity === 'mild');

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'error';
      case 'common':
        return 'warning';
      default:
        return 'success';
    }
  };

  // Get severity label
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'severe':
        return '严重症状';
      case 'common':
        return '常见症状';
      default:
        return '轻微症状';
    }
  };

  // Handle symptom click
  const handleSymptomClick = (symptom: SymptomDetail) => {
    setSelectedSymptom(symptom);
    setDialogOpen(true);
  };

  // Render symptom row
  const renderSymptomRow = (symptom: SymptomDetail, showSeverity: boolean = true) => (
    <TableRow 
      key={symptom.symptom}
      hover
      onClick={() => handleSymptomClick(symptom)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showSeverity && symptom.severity === 'severe' && (
            <WarningIcon color="error" fontSize="small" />
          )}
          <Typography variant="body2" fontWeight={symptom.severity === 'severe' ? 'bold' : 'normal'}>
            {symptom.symptom}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        {symptom.frequency.toLocaleString()}
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
          <LinearProgress
            variant="determinate"
            value={symptom.percentage}
            color={getSeverityColor(symptom.severity) as 'error' | 'warning' | 'success'}
            sx={{ width: 60, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ minWidth: 45 }}>
            {symptom.percentage.toFixed(1)}%
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          📋 症状统计
        </Typography>
        <Typography variant="body2" color="text.secondary">
          接种后 0-30 天内的症状报告
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="搜索症状..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>严重程度</InputLabel>
              <Select
                value={filter.severity || 'all'}
                label="严重程度"
                onChange={(e) => setFilter({ ...filter, severity: e.target.value as any })}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="severe">仅严重</MenuItem>
                <MenuItem value="common">仅常见</MenuItem>
                <MenuItem value="mild">仅轻微</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>时间范围</InputLabel>
              <Select
                value={filter.date_range || 'all'}
                label="时间范围"
                onChange={(e) => setFilter({ ...filter, date_range: e.target.value as any })}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="7d">最近7天</MenuItem>
                <MenuItem value="30d">最近30天</MenuItem>
                <MenuItem value="90d">最近90天</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body2" color="text.secondary" align="right">
              共 {filteredSymptoms.length} 种症状
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: 'error.main' }}>
            <WarningIcon color="error" />
            <Typography variant="h6" fontWeight="bold" color="error">
              {severeSymptoms.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              严重症状
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: 'warning.main' }}>
            <HealthAndSafetyIcon color="warning" />
            <Typography variant="h6" fontWeight="bold" color="warning.main">
              {commonSymptoms.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              常见症状
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: 'success.main' }}>
            <InfoOutlinedIcon color="success" />
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {mildSymptoms.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              轻微症状
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Symptoms Table */}
      {filteredSymptoms.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>症状</TableCell>
                <TableCell align="right">出现次数</TableCell>
                <TableCell align="right">占比</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Severe Symptoms Section */}
              {severeSymptoms.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} sx={{ bgcolor: 'error.light', py: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="error.contrastText">
                        ⚠️ 严重症状
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {severeSymptoms.map(symptom => renderSymptomRow(symptom, false))}
                </>
              )}

              {/* Common Symptoms Section */}
              {commonSymptoms.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} sx={{ bgcolor: 'warning.light', py: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="warning.contrastText">
                        常见症状
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {commonSymptoms.map(symptom => renderSymptomRow(symptom, false))}
                </>
              )}

              {/* Mild Symptoms (collapsed by default) */}
              {mildSymptoms.length > 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Accordion sx={{ boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">
                          其他轻微症状 ({mildSymptoms.length} 种)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Table size="small">
                          <TableBody>
                            {mildSymptoms.map(symptom => renderSymptomRow(symptom, false))}
                          </TableBody>
                        </Table>
                      </AccordionDetails>
                    </Accordion>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            未找到匹配的症状
          </Typography>
        </Box>
      )}

      {/* Time Distribution Chart (if available) */}
      {timeDistribution && timeDistribution.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="bold">
                📈 症状出现时间分布
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {timeDistribution.map((dist) => (
                  <Grid item xs={6} sm={3} key={dist.range}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {dist.range}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1 }}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="warning.main">
                            {dist.severe_count}
                          </Typography>
                          <Typography variant="caption">严重</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {dist.common_count}
                          </Typography>
                          <Typography variant="caption">常见</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Symptom Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSymptom && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedSymptom.severity === 'severe' && (
                <WarningIcon color="error" />
              )}
              {selectedSymptom.symptom}
              <Box sx={{ flexGrow: 1 }} />
              <IconButton onClick={() => setDialogOpen(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    出现次数
                  </Typography>
                  <Typography variant="h6">
                    {selectedSymptom.frequency.toLocaleString()} 次
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    占比
                  </Typography>
                  <Typography variant="h6">
                    {selectedSymptom.percentage.toFixed(1)}%
                  </Typography>
                </Grid>
                
                {selectedSymptom.avg_onset_days && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      平均出现时间
                    </Typography>
                    <Typography variant="body1">
                      接种后 {selectedSymptom.avg_onset_days} 天
                    </Typography>
                  </Grid>
                )}
                
                {selectedSymptom.median_duration_days && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      持续中位时间
                    </Typography>
                    <Typography variant="body1">
                      {selectedSymptom.median_duration_days} 天
                    </Typography>
                  </Grid>
                )}
                
                {selectedSymptom.hospitalization_rate && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      住院率
                    </Typography>
                    <Typography variant="body1" color="error.main">
                      {selectedSymptom.hospitalization_rate}%
                    </Typography>
                  </Grid>
                )}
                
                {selectedSymptom.mortality_rate && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      死亡率
                    </Typography>
                    <Typography variant="body1" color="error.main">
                      {selectedSymptom.mortality_rate}%
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Recommendation for severe symptoms */}
              {selectedSymptom.severity === 'severe' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <AlertTitle>建议</AlertTitle>
                  如出现此症状，请立即就医。这可能是严重反应的症状。
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                关闭
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default SymptomDetailCard;
