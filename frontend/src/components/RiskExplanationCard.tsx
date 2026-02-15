/**
 * RiskExplanationCard - Enhanced risk explanation with plain language
 * User Story 2: Clear risk interpretation for non-technical users
 */

import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
  AlertTitle,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import type { BatchDetails, RiskExplanation } from '../types';

interface RiskExplanationCardProps {
  batch: BatchDetails;
  explanation?: RiskExplanation;
}

const RiskExplanationCard: React.FC<RiskExplanationCardProps> = ({ 
  batch, 
  explanation 
}) => {
  const [expanded, setExpanded] = useState(false);

  // Determine risk level color
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get risk level label
  const getRiskLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '高风险';
      case 'medium':
        return '中等风险';
      case 'low':
        return '低风险';
      default:
        return '未知风险';
    }
  };

  // Get icon based on risk level
  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <WarningIcon color="error" />;
      case 'medium':
        return <HealthAndSafetyIcon color="warning" />;
      case 'low':
        return <HealthAndSafetyIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  const riskScore = batch.risk_score ?? 0;
  const riskLevel = batch.risk_level ?? 'Unknown';
  const riskPercentage = (riskScore / 10) * 100;

  // Generate explanation content
  const nationalAvg = 5.0; // Default national average
  const comparisonPercent = ((riskScore - nationalAvg) / nationalAvg) * 100;
  const isAboveAvg = riskScore > nationalAvg;

  // Generate plain language summary
  const generateSummary = () => {
    if (!batch.total_reports || batch.total_reports === 0) {
      return '该批次目前没有不良事件报告。';
    }

    const severePct = batch.severe_reports_pct ?? 0;
    const lethalityPct = batch.lethality_pct ?? 0;

    if (riskLevel?.toLowerCase() === 'high') {
      return `该批次收到的严重反应报告高于全国平均水平。在 ${batch.total_reports.toLocaleString()} 份报告中，约 ${severePct.toFixed(1)}% 为严重反应，${lethalityPct.toFixed(1)}% 导致死亡。`;
    } else if (riskLevel?.toLowerCase() === 'medium') {
      return `该批次的不良反应报告处于中等水平。在 ${batch.total_reports.toLocaleString()} 份报告中，约 ${severePct.toFixed(1)}% 为严重反应。`;
    } else {
      return `该批次的不良反应报告相对较低。在 ${batch.total_reports.toLocaleString()} 份报告中，约 ${severePct.toFixed(1)}% 为严重反应。`;
    }
  };

  // Generate recommendations based on risk level
  const generateRecommendations = () => {
    const recs = [];
    
    if (riskLevel?.toLowerCase() === 'high') {
      recs.push('⚠️ 建议咨询医疗专业人员');
      recs.push('📊 密切监控接种后 48 小时内症状');
      recs.push('🏥 如有不适请立即就医');
    } else if (riskLevel?.toLowerCase() === 'medium') {
      recs.push('💡 注意观察接种后身体状况');
      recs.push('📞 如有疑虑可咨询医生');
    } else {
      recs.push('✅ 按常规注意事项观察');
    }
    
    return recs;
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Header with Risk Score */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          风险评估
        </Typography>
        <Tooltip title="点击查看风险计算说明">
          <IconButton size="small">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Risk Display */}
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          {getRiskIcon(riskLevel)}
          <Typography variant="h5" fontWeight="bold" color={`${getRiskColor(riskLevel)}.main`}>
            {getRiskLabel(riskLevel)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 1 }}>
          <Typography variant="h2" fontWeight="bold">
            {riskScore.toFixed(1)}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            / 10
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={riskPercentage}
          color={getRiskColor(riskLevel) as 'success' | 'warning' | 'error' | 'default'}
          sx={{ height: 12, borderRadius: 6, mt: 2, mb: 1 }}
        />
      </Box>

      {/* Comparison to National Average */}
      <Alert 
        severity={isAboveAvg ? 'error' : 'success'}
        icon={isAboveAvg ? <TrendingUpIcon /> : <TrendingDownIcon />}
        sx={{ mb: 2 }}
      >
        <AlertTitle>
          {isAboveAvg ? '📈 高于全国平均' : '📉 低于全国平均'}
        </AlertTitle>
        该批次风险分数比全国平均 {nationalAvg.toFixed(1)} {isAboveAvg ? '高' : '低'} {Math.abs(comparisonPercent).toFixed(0)}%
      </Alert>

      {/* Plain Language Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <InfoIcon color="primary" />
          这意味着什么？
        </Typography>
        <Typography variant="body1" sx={{ pl: 4, lineHeight: 1.8 }}>
          {generateSummary()}
        </Typography>
      </Box>

      {/* Recommendations */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
          💡 建议
        </Typography>
        <Box sx={{ pl: 2 }}>
          {generateRecommendations().map((rec, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
              {rec}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Statistics Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              总报告数
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {batch.total_reports?.toLocaleString() ?? 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              死亡
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={batch.deaths > 0 ? 'error.main' : 'text.primary'}>
              {batch.deaths ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              严重反应
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="warning.main">
              {batch.severe_reports_pct?.toFixed(1) ?? 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              致命率
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={batch.lethality_pct && batch.lethality_pct > 0 ? 'error.main' : 'text.primary'}>
              {batch.lethality_pct?.toFixed(2) ?? 0}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Calculation Method Accordion */}
      <Accordion 
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{ bgcolor: 'grey.50' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">
            📖 如何计算风险分数？
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.8 }}>
            <Box component="span" fontWeight="bold">基础分数 =</Box>
            <br />
            死亡率 × 2.0 + 严重反应率 × 0.5
            <br /><br />
            <Box component="span" fontWeight="bold">用户调整 (+/-):</Box>
            <br />
            • 65岁以上: +1.5
            <br />
            • 50-64岁: +1.0
            <br />
            • 糖尿病: +0.8
            <br />
            • 心脏病: +0.8
            <br />
            • 免疫缺陷: +1.0
            <br />
            • 曾感染COVID: -0.3
            <br /><br />
            <Box component="span" fontWeight="bold">数据来源:</Box> VAERS (2020-2024)
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Disclaimer */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>免责声明</AlertTitle>
        <Typography variant="caption">
          此评估基于 VAERS 数据，仅供参考，不能替代医疗建议。
          如有健康疑虑，请咨询专业医疗人员。
        </Typography>
      </Alert>
    </Paper>
  );
};

export default RiskExplanationCard;
