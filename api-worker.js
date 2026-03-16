// S2Y Batches Mock API Worker
// 这是一个简单的模拟 API,用于演示和测试

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    // 处理 OPTIONS 请求 (CORS 预检)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 检查 API Key (简单验证)
    const authHeader = request.headers.get('Authorization');
    const isPublicEndpoint = url.pathname === '/health' || url.pathname === '/' || url.pathname.startsWith('/api/v2/risk/regional');
    
    if (!isPublicEndpoint && !authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        status: 'error',
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid API key',
        },
        timestamp: new Date().toISOString()
      }), { 
        status: 401, 
        headers: corsHeaders 
      });
    }

    // 路由处理
    try {
      // 根路径
      if (url.pathname === '/') {
        return new Response(JSON.stringify({
          message: 'S2Y Batches API - Mock Version',
          version: '1.0.0',
          docs_url: '/docs',
          health_check: '/health',
          note: 'This is a mock API for demonstration purposes'
        }), { headers: corsHeaders });
      }

      // 健康检查
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          version: '1.0.0',
          project: 'LCRAS API'
        }), { headers: corsHeaders });
      }

      // 获取批次详情
      const batchMatch = url.pathname.match(/^\/api\/v1\/batch\/([A-Z0-9]+)$/);
      if (batchMatch && request.method === 'GET') {
        const batchCode = batchMatch[1];
        
        // 模拟数据
        const mockBatches = {
          'EN6201': {
            batch_code: 'EN6201',
            manufacturer: 'Pfizer',
            vaccine_type: 'COVID-19',
            total_reports: 1523,
            deaths: 45,
            disabilities: 23,
            life_threatening: 67,
            hospitalizations: 234,
            severe_reports_pct: 24.36,
            lethality_pct: 2.95,
            risk_score: 7.2,
            risk_level: 'High',
            first_report_date: '2021-01-15',
            last_report_date: '2023-06-30'
          },
          'FM0173': {
            batch_code: 'FM0173',
            manufacturer: 'Pfizer',
            vaccine_type: 'COVID-19',
            total_reports: 856,
            deaths: 23,
            disabilities: 12,
            life_threatening: 34,
            hospitalizations: 145,
            severe_reports_pct: 18.92,
            lethality_pct: 2.69,
            risk_score: 6.5,
            risk_level: 'Medium',
            first_report_date: '2021-02-10',
            last_report_date: '2023-05-20'
          }
        };

        const batch = mockBatches[batchCode] || {
          batch_code: batchCode,
          manufacturer: 'Unknown',
          vaccine_type: 'COVID-19',
          total_reports: Math.floor(Math.random() * 2000),
          deaths: Math.floor(Math.random() * 50),
          disabilities: Math.floor(Math.random() * 30),
          life_threatening: Math.floor(Math.random() * 80),
          hospitalizations: Math.floor(Math.random() * 300),
          severe_reports_pct: (Math.random() * 30).toFixed(2),
          lethality_pct: (Math.random() * 5).toFixed(2),
          risk_score: (Math.random() * 10).toFixed(1),
          risk_level: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
        };

        return new Response(JSON.stringify(batch), { headers: corsHeaders });
      }

      // 批次搜索
      if (url.pathname === '/api/v1/batch/search' && request.method === 'GET') {
        const manufacturer = url.searchParams.get('manufacturer');
        const riskScoreMin = parseFloat(url.searchParams.get('risk_score_min') || '0');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        const allBatches = [
          {
            batch_code: 'EN6201',
            manufacturer: 'Pfizer',
            risk_score: 7.2,
            risk_level: 'High',
            total_reports: 1523
          },
          {
            batch_code: 'FM0173',
            manufacturer: 'Pfizer',
            risk_score: 6.5,
            risk_level: 'Medium',
            total_reports: 856
          },
          {
            batch_code: 'EW0150',
            manufacturer: 'Moderna',
            risk_score: 5.8,
            risk_level: 'Medium',
            total_reports: 723
          }
        ];

        let filtered = allBatches;
        if (manufacturer) {
          filtered = filtered.filter(b => b.manufacturer === manufacturer);
        }
        if (riskScoreMin > 0) {
          filtered = filtered.filter(b => b.risk_score >= riskScoreMin);
        }

        const paginated = filtered.slice(offset, offset + limit);

        return new Response(JSON.stringify({
          batches: paginated,
          total_count: filtered.length,
          limit,
          offset
        }), { headers: corsHeaders });
      }

      // 获取批次热门症状
      const symptomsMatch = url.pathname.match(/^\/api\/v1\/batch\/([A-Z0-9]+)\/top-symptoms$/);
      if (symptomsMatch && request.method === 'GET') {
        const batchCode = symptomsMatch[1];
        const limit = parseInt(url.searchParams.get('limit') || '20');

        const symptoms = [
          { symptom_name: 'Headache', frequency: 456, percentage: 29.95 },
          { symptom_name: 'Fatigue', frequency: 389, percentage: 25.54 },
          { symptom_name: 'Fever', frequency: 267, percentage: 17.53 },
          { symptom_name: 'Muscle pain', frequency: 198, percentage: 13.00 },
          { symptom_name: 'Chills', frequency: 145, percentage: 9.52 },
          { symptom_name: 'Nausea', frequency: 89, percentage: 5.84 }
        ].slice(0, limit);

        return new Response(JSON.stringify({
          batch_code: batchCode,
          total_symptoms: symptoms.length,
          symptoms
        }), { headers: corsHeaders });
      }

      // 风险评估
      if (url.pathname === '/api/v1/risk/assess' && request.method === 'POST') {
        const body = await request.json();
        const { batch_code, user_profile } = body;

        // 计算风险分数 (简化逻辑)
        let baseScore = 5.0;
        let adjustment = 0;

        if (user_profile.age >= 65) adjustment += 1.5;
        else if (user_profile.age >= 50) adjustment += 1.0;

        if (user_profile.pre_existing_conditions?.length > 0) {
          adjustment += user_profile.pre_existing_conditions.length * 0.8;
        }

        if (user_profile.previous_covid_infection) adjustment -= 0.3;

        const finalScore = Math.min(10, Math.max(0, baseScore + adjustment));
        const riskLevel = finalScore < 4 ? 'Low' : finalScore < 7 ? 'Medium' : 'High';

        const riskFactors = [];
        if (user_profile.age >= 65) {
          riskFactors.push({
            factor: `Age ${user_profile.age} (65+)`,
            impact: '+1.5',
            description: 'Older age groups have higher risk of severe adverse events'
          });
        } else if (user_profile.age >= 50) {
          riskFactors.push({
            factor: `Age ${user_profile.age} (50-64)`,
            impact: '+1.0',
            description: 'Middle-aged individuals show moderately elevated risk'
          });
        }

        if (user_profile.pre_existing_conditions?.length > 0) {
          riskFactors.push({
            factor: 'Pre-existing conditions',
            impact: `+${(user_profile.pre_existing_conditions.length * 0.8).toFixed(1)}`,
            description: `Conditions (${user_profile.pre_existing_conditions.join(', ')}) may increase risk`
          });
        }

        return new Response(JSON.stringify({
          batch_code,
          manufacturer: 'Pfizer',
          risk_score: parseFloat(finalScore.toFixed(2)),
          risk_level: riskLevel,
          confidence: 0.75,
          risk_factors: riskFactors,
          comparative_stats: {
            batch_avg_severity: 6.5,
            global_avg_severity: 4.2,
            percentile: 75
          },
          timestamp: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      // 获取批次风险统计
      const riskStatsMatch = url.pathname.match(/^\/api\/v1\/risk\/batch\/([A-Z0-9]+)$/);
      if (riskStatsMatch && request.method === 'GET') {
        const batchCode = riskStatsMatch[1];

        return new Response(JSON.stringify({
          batch_code: batchCode,
          manufacturer: 'Pfizer',
          total_reports: 1523,
          deaths: 45,
          disabilities: 23,
          life_threatening: 67,
          hospitalizations: 234,
          severe_reports_pct: 24.36,
          lethality_pct: 2.95,
          risk_score: 7.2
        }), { headers: corsHeaders });
      }

      // ======== V2 API Endpoints ========
      
      // 获取地区风险信息 (v2)
      const regionZipMatch = url.pathname.match(/^\/api\/v2\/risk\/regional\/zipcode\/(\d+)$/);
      if (regionZipMatch && request.method === 'GET') {
        const zipcode = regionZipMatch[1];
        
        // Mock data based on zipcode
        const mockCities = {
          '10001': {city: 'New York', state: 'NY'},
          '90001': {city: 'Los Angeles', state: 'CA'},
          '60601': {city: 'Chicago', state: 'IL'},
          '77001': {city: 'Houston', state: 'TX'},
          '85001': {city: 'Phoenix', state: 'AZ'},
          '19101': {city: 'Philadelphia', state: 'PA'},
        };
        
        const cityInfo = mockCities[zipcode] || {city: 'Unknown City', state: 'XX'};
        const baseScore = 4 + (parseInt(zipcode.slice(-2)) % 6);
        
        return new Response(JSON.stringify({
          zipcode: zipcode,
          city: cityInfo.city,
          state: cityInfo.state,
          region_risk_score: baseScore + Math.random() * 2,
          risk_level: baseScore > 6 ? 'High' : baseScore > 4 ? 'Medium' : 'Low',
          total_doses: Math.floor(50000 + Math.random() * 200000),
          total_adverse_events: Math.floor(100 + Math.random() * 500),
          adverse_events_per_100k: 150 + Math.random() * 200,
          num_batches: Math.floor(50 + Math.random() * 150),
          num_providers: Math.floor(10 + Math.random() * 30),
          top_batches: [
            {code: 'EN6201', risk_score: 7.2, reports: 45},
            {code: 'EW0182', risk_score: 6.8, reports: 38},
            {code: 'EZ5012', risk_score: 5.9, reports: 25}
          ],
          healthcare_access_score: 6 + Math.random() * 4,
          population_health_index: 6 + Math.random() * 3
        }), { headers: corsHeaders });
      }

      // 404 Not Found
      return new Response(JSON.stringify({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Endpoint ${url.pathname} not found`,
        },
        timestamp: new Date().toISOString()
      }), { 
        status: 404, 
        headers: corsHeaders 
      });

    } catch (error) {
      return new Response(JSON.stringify({
        status: 'error',
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
        timestamp: new Date().toISOString()
      }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};
