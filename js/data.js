/**
 * SustiVision AI - Core Environmental Data Repository & Knowledge Base
 * Primary Source of Truth for Product Data, Mock Telemetry & AI Model Responses
 */

const SUSTIVISION_DATA = {
  // Application Information
  app: {
    name: "SustiVision AI",
    tagline: "We plan to see a greener tomorrow.",
    version: "2.4.0-mvp",
    lastSensorSync: "2 minutes ago",
    activeSensorsCount: 1428,
    systemHealth: 99.98
  },

  // Supported Locations / Sensor Hubs
  locations: [
    {
      id: "sf-bay",
      name: "San Francisco Bay Area",
      subtext: "Regional Monitoring Hub #04",
      coordinates: "37.7749° N, 122.4194° W",
      status: "GOOD",
      activeSensors: 312,
      aqi: 42,
      temp: 28,
      humidity: 64
    },
    {
      id: "copenhagen-green",
      name: "Copenhagen Green District",
      subtext: "Nordic EcoZone Station #01",
      coordinates: "55.6761° N, 12.5683° E",
      status: "GOOD",
      activeSensors: 284,
      aqi: 24,
      temp: 19,
      humidity: 58
    },
    {
      id: "hudson-basin",
      name: "Hudson River Basin",
      subtext: "Watershed Sentinel Array",
      coordinates: "41.2587° N, 73.9855° W",
      status: "MODERATE",
      activeSensors: 196,
      aqi: 58,
      temp: 24,
      humidity: 71
    },
    {
      id: "tokyo-minato",
      name: "Tokyo Minato Eco-Grid",
      subtext: "Metropolitan Sensor Cluster",
      coordinates: "35.6586° N, 139.7514° E",
      status: "GOOD",
      activeSensors: 410,
      aqi: 36,
      temp: 26,
      humidity: 62
    },
    {
      id: "rhine-valley",
      name: "Rhine Industrial Valley",
      subtext: "Emissions Monitoring Corridor",
      coordinates: "50.9375° N, 6.9603° E",
      status: "MODERATE",
      activeSensors: 226,
      aqi: 68,
      temp: 25,
      humidity: 60
    }
  ],

  // Real-time Environmental Telemetry (Default active node)
  currentTelemetry: {
    aqi: {
      value: 42,
      unit: "AQI",
      status: "Good",
      statusType: "good", // good | moderate | critical
      trend: "down",
      trendPercent: 8,
      comparison: "↓ 8% from yesterday",
      detail: "PM2.5: 9.8 µg/m³ · PM10: 18 µg/m³ · O3: 28 ppb",
      whoCompliant: true
    },
    temperature: {
      value: 28,
      unit: "°C",
      status: "Normal",
      statusType: "good",
      trend: "up",
      trendDiff: 1.2,
      comparison: "↑ 1.2°C from 24h avg",
      detail: "High: 31°C · Low: 21°C · Heat Index: Normal",
      dewPoint: "14°C"
    },
    humidity: {
      value: 64,
      unit: "%",
      status: "Optimal",
      statusType: "good",
      trend: "down",
      trendPercent: 3,
      comparison: "↓ 3% from yesterday",
      detail: "Vapor Pressure: 2.1 kPa · Soil Saturation: 34%",
      comfortIndex: "Comfortable"
    },
    environmentalStatus: {
      value: "GOOD",
      statusType: "good",
      subtitle: "Current environmental conditions are stable.",
      summary: "Air filtration and ecological balance across all 12 monitored sectors remain within target safety thresholds. Zero hazardous thresholds breached in the past 48 hours.",
      trend: "stable",
      metricsBreakdown: [
        { label: "Air Purity", score: 92, target: 85, unit: "%" },
        { label: "Thermal Comfort", score: 88, target: 80, unit: "%" },
        { label: "Watershed Stability", score: 95, target: 90, unit: "%" },
        { label: "Noise / Acoustic Hygiene", score: 38, target: 55, unit: "dB" }
      ]
    },
    secondaryMetrics: {
      co2: { value: 412, unit: "ppm", label: "Atmospheric CO₂", status: "Baseline", trend: "+0.4%" },
      no2: { value: 14.2, unit: "ppb", label: "Nitrogen Dioxide", status: "Low", trend: "-5.1%" },
      uvIndex: { value: 4.2, unit: "UVI", label: "Solar UV Index", status: "Moderate", advisory: "Sun protection recommended" },
      pressure: { value: 1014.5, unit: "hPa", label: "Barometric Pressure", status: "Steady", trend: "+0.2 hPa" },
      wind: { value: 12.4, unit: "km/h", direction: "WNW", label: "Surface Wind", status: "Gentle Breeze" }
    }
  },

  // Historical Datasets for Time Filter Toggles (24H, 7D, 30D, 90D)
  timeSeries: {
    "24H": {
      labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
      aqi: [38, 35, 41, 56, 48, 45, 42, 39],
      pm25: [8.2, 7.5, 9.4, 14.2, 11.0, 10.2, 9.8, 8.9],
      temp: [21, 20, 22, 26, 29, 31, 28, 24],
      humidity: [76, 79, 74, 62, 55, 52, 64, 70],
      compositeHealth: [95, 96, 92, 88, 90, 89, 93, 94]
    },
    "7D": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      aqi: [48, 46, 52, 49, 44, 40, 42],
      pm25: [12.4, 11.8, 13.9, 12.0, 10.5, 9.2, 9.8],
      temp: [26, 27, 29, 28, 27, 28, 28],
      humidity: [68, 65, 60, 62, 67, 66, 64],
      compositeHealth: [91, 92, 89, 90, 93, 95, 94]
    },
    "30D": {
      labels: ["Sep 06", "Sep 11", "Sep 16", "Sep 21", "Sep 26", "Oct 01", "Oct 05"],
      aqi: [55, 49, 42, 39, 47, 44, 42],
      pm25: [14.1, 12.3, 10.0, 9.1, 11.5, 10.2, 9.8],
      temp: [29, 28, 27, 26, 28, 27, 28],
      humidity: [61, 63, 68, 70, 65, 66, 64],
      compositeHealth: [88, 90, 93, 94, 91, 93, 94]
    },
    "90D": {
      labels: ["Jul W1", "Jul W3", "Aug W1", "Aug W3", "Sep W1", "Sep W3", "Oct W1"],
      aqi: [62, 58, 54, 49, 45, 43, 42],
      pm25: [16.5, 15.2, 13.8, 12.1, 10.8, 10.1, 9.8],
      temp: [32, 33, 31, 29, 28, 27, 28],
      humidity: [54, 52, 58, 62, 65, 63, 64],
      compositeHealth: [84, 85, 88, 91, 92, 93, 94]
    }
  },

  // Environmental Alerts Center
  alerts: [
    {
      id: "alt-01",
      title: "Elevated Ground-Level Ozone Advisory",
      category: "Air Quality Warning",
      severity: "warning", // warning | critical | advisory | info
      location: "San Francisco Bay Area - South Corridor",
      timestamp: "24 mins ago",
      timestampIso: "2026-10-05T10:23:00Z",
      description: "Sensor cluster #14 reports O3 concentration reaching 68 ppb due to persistent solar irradiance and thermal inversion.",
      recommendedAction: "Advise sensitive groups to reduce strenuous outdoor activities between 12:00 and 16:00.",
      read: false
    },
    {
      id: "alt-02",
      title: "Thermal Ridge Heat Warning",
      category: "Heat Warning",
      severity: "warning",
      location: "Inland Valley EcoHub",
      timestamp: "2 hours ago",
      timestampIso: "2026-10-05T08:45:00Z",
      description: "Ambient temperatures expected to peak at 32°C at 14:00 with heat index reaching 34°C.",
      recommendedAction: "Activate municipal cooling stations and automated canopy misting sequences.",
      read: false
    },
    {
      id: "alt-03",
      title: "Watershed Runoff Inflow Stable",
      category: "Flood Warning",
      severity: "advisory",
      location: "Hudson River Basin - Station B",
      timestamp: "5 hours ago",
      timestampIso: "2026-10-05T05:30:00Z",
      description: "Reservoir capacity at 71%. Inflow velocity decelerated by 14% post-precipitation wave.",
      recommendedAction: "Maintain standard culvert gate aperture; no sluice discharge required.",
      read: true
    },
    {
      id: "alt-04",
      title: "PM10 Particulate Spike Cleared",
      category: "Poor Air Quality",
      severity: "info",
      location: "Rhine Industrial Corridor",
      timestamp: "18 hours ago",
      timestampIso: "2026-10-04T16:15:00Z",
      description: "Industrial particulate levels returned to baseline (16 µg/m³) following wind shift.",
      recommendedAction: "Routine automated monitoring resumed.",
      read: true
    },
    {
      id: "alt-05",
      title: "Flash Surface Runoff Alert (Archived)",
      category: "Flood Warning",
      severity: "critical",
      location: "Coastal Marsh Basin #07",
      timestamp: "1 day ago",
      timestampIso: "2026-10-04T09:12:00Z",
      description: "Tidal surge aligned with 28mm sudden localized rainfall. Drainage pumps operated at 92% capacity.",
      recommendedAction: "Drainage inspected; zero structural damage verified by inspection drone.",
      read: true
    }
  ],

  // Risk Predictions Module
  riskPredictions: [
    {
      id: "risk-flood",
      title: "Flood Risk",
      level: "LOW",
      levelClass: "low",
      probability: 18,
      timeframe: "Next 7 days",
      trend: "Decreasing (-4% / 48h)",
      trendDirection: "improving",
      description: "Watershed hydrological models project low inundation vulnerability across regional catchments.",
      factors: [
        { name: "Precipitation Forecast", value: "12 mm / 7d", impact: "Low", weight: "25%" },
        { name: "Soil Moisture Saturation", value: "34% (Optimal)", impact: "Low", weight: "35%" },
        { name: "Riverbed Flow Capacity", value: "48% threshold", impact: "Safe", weight: "25%" },
        { name: "Historical Hydrology Baseline", value: "-15% vs 10yr avg", impact: "Safe", weight: "15%" }
      ],
      recommendation: "Continue standard monitoring of rainfall levels and culvert drainage sensors. No preventive barrier deployment required."
    },
    {
      id: "risk-climate",
      title: "Climate Risk",
      level: "MODERATE",
      levelClass: "moderate",
      probability: 44,
      timeframe: "Next 30 days",
      trend: "Stable (±1% variance)",
      trendDirection: "neutral",
      description: "Microclimate thermal imaging indicates elevated urban heat island retention across high-density pavement zones.",
      factors: [
        { name: "Urban Heat Island Index", value: "+2.4°C over rural base", impact: "Moderate", weight: "40%" },
        { name: "Canopy Shade Deficit", value: "18% below city target", impact: "Moderate", weight: "30%" },
        { name: "Persistent Dry Window", value: "19 consecutive days", impact: "Elevated", weight: "20%" },
        { name: "Evapotranspiration Rate", value: "4.8 mm/day", impact: "Moderate", weight: "10%" }
      ],
      recommendation: "Activate urban canopy misting systems during peak afternoon hours and prepare cool-roof rebate alerts for commercial facility operators."
    },
    {
      id: "risk-weather",
      title: "Weather Risk",
      level: "LOW",
      levelClass: "low",
      probability: 12,
      timeframe: "Next 48 hours",
      trend: "Improving (-6% / 24h)",
      trendDirection: "improving",
      description: "Synoptic barometric pressure remains steady with low convective storm development probability.",
      factors: [
        { name: "Barometric Gradient", value: "1014.5 hPa (Stable)", impact: "Safe", weight: "35%" },
        { name: "Wind Shear & Gusts", value: "14 km/h (Low hazard)", impact: "Safe", weight: "30%" },
        { name: "Atmospheric Instability (CAPE)", value: "240 J/kg", impact: "Low", weight: "20%" },
        { name: "Visibility Rating", value: "10+ km (Clear)", impact: "Safe", weight: "15%" }
      ],
      recommendation: "Standard operational protocols apply across municipal and research facilities. Routine telemetry logging."
    },
    {
      id: "risk-air-quality",
      title: "Air Quality Degradation Risk",
      level: "MODERATE",
      levelClass: "moderate",
      probability: 38,
      timeframe: "Next 5 days",
      trend: "Slight Increase (+3%)",
      trendDirection: "worsening",
      description: "Atmospheric thermal inversion model indicates stagnant boundary layer between 07:00 and 10:00 on weekdays.",
      factors: [
        { name: "Boundary Layer Height", value: "420m (Compressed)", impact: "Elevated", weight: "35%" },
        { name: "Commuter Traffic Flux", value: "+8% volume peak", impact: "Moderate", weight: "30%" },
        { name: "Wind Dispersion Index", value: "3.2 / 10 (Poor)", impact: "Elevated", weight: "25%" },
        { name: "Regional Wildfire Smoke", value: "Negligible (<1 µg/m³)", impact: "Safe", weight: "10%" }
      ],
      recommendation: "Issue advisory to regional logistics operators to schedule heavy freight outside morning commuter peak window."
    },
    {
      id: "risk-wildfire",
      title: "Wildfire Vulnerability",
      level: "LOW",
      levelClass: "low",
      probability: 9,
      timeframe: "Next 14 days",
      trend: "Low Baseline",
      trendDirection: "improving",
      description: "Perimeter fuel moisture indices and regional humidity levels remain above critical ignition thresholds.",
      factors: [
        { name: "Fine Fuel Moisture", value: "16.4% (Adequate)", impact: "Safe", weight: "40%" },
        { name: "Relative Humidity Minimum", value: "48%", impact: "Safe", weight: "30%" },
        { name: "Lightning Activity Level", value: "LAL 1 (None)", impact: "Safe", weight: "20%" },
        { name: "Keetch-Byram Drought Index", value: "142 / 800", impact: "Low", weight: "10%" }
      ],
      recommendation: "Maintain automated satellite thermal scanning cadence; no alert escalation required."
    }
  ],

  // Pre-compiled Environmental Reports
  reports: [
    {
      id: "rep-01",
      title: "Weekly Environmental Intelligence Briefing - W40",
      type: "Weekly",
      category: "weekly",
      date: "Oct 05, 2026",
      author: "SustiVision Autonomous AI Auditor",
      status: "Published",
      envStatus: "GOOD",
      riskScore: "14 / 100",
      summary: "Comprehensive weekly synthesis of regional atmospheric air quality, hydrological catchment stability, and municipal carbon intensity benchmarks.",
      keyFindings: [
        "AQI maintained an average of 43.4, representing an 8.2% quality improvement week-over-week.",
        "Zero environmental compliance breaches registered across 14 municipal regulatory zones.",
        "Soil moisture retention improved by 4% following controlled weekend watershed recharge.",
        "Solar irradiance provided 38.6% of municipal daytime energy grid displacement."
      ],
      riskOverview: "Composite environmental risk rating remains in LOW territory. Urban heat island containment showed significant progress in green corridors.",
      downloads: { pdfSize: "2.4 MB", csvRows: 10080, format: "ISO 14001 Compliant" }
    },
    {
      id: "rep-02",
      title: "September 2026 Municipal Sustainability Review",
      type: "Monthly",
      category: "monthly",
      date: "Oct 01, 2026",
      author: "Regional Ecology Review Board & SustiVision AI",
      status: "Published",
      envStatus: "GOOD",
      riskScore: "19 / 100",
      summary: "Full-spectrum monthly analysis auditing GHG emissions, water conservation targets, micro-particulate mitigation, and renewable grid integration.",
      keyFindings: [
        "Gross greenhouse gas emissions decreased by 6.4% compared to September 2025 baseline.",
        "Average municipal AQI was 46.1 with 27 out of 30 days classified as 'Good' status.",
        "Water conservation mandates yielded 14.8 million gallons saved in municipal cooling towers.",
        "Canopy expansion added 1,420 geo-tagged urban trees across high-density census tracts."
      ],
      riskOverview: "Overall monthly risk profile was Moderate during early heat wave (Sep 4-7) before returning to Low for remainder of month.",
      downloads: { pdfSize: "5.8 MB", csvRows: 43200, format: "ESG / CSRD Compatible" }
    },
    {
      id: "rep-03",
      title: "Daily Eco-Watch Alert Summary - Oct 05, 2026",
      type: "Daily",
      category: "daily",
      date: "Oct 05, 2026",
      author: "Real-time Telemetry Service",
      status: "Published",
      envStatus: "GOOD",
      riskScore: "12 / 100",
      summary: "24-hour diurnal cycle digest summarizing ambient temperature peaks, localized ozone formation, and particulate matter concentration.",
      keyFindings: [
        "Peak temperature of 31°C logged at 15:10, falling within modeled envelope.",
        "Ozone advisory issued at 10:23 for South Corridor; dissipation expected by 18:00.",
        "Hydrological runoff velocity in culvert B-4 decreased by 14%.",
        "Sensors logged 100% data transmission reliability across 312 active nodes."
      ],
      riskOverview: "Low risk across all operational zones with minor transient ozone advisory during midday solar peak.",
      downloads: { pdfSize: "1.1 MB", csvRows: 1440, format: "EPA Standard Format" }
    },
    {
      id: "rep-04",
      title: "Watershed Hydrology & Flood Assessment - Q3",
      type: "Monthly",
      category: "monthly",
      date: "Sep 28, 2026",
      author: "HydroGeo Analytics Lab & SustiVision",
      status: "Published",
      envStatus: "GOOD",
      riskScore: "22 / 100",
      summary: "Detailed diagnostic evaluation of river basin recharge, reservoir capacity reserves, and floodplain topography vulnerability.",
      keyFindings: [
        "Regional reservoir storage sits at 78% capacity, +12% vs the 5-year seasonal norm.",
        "Silt accumulation across intake barriers lowered by 28% after robotic dredging.",
        "Predictive 60-day runoff models show negligible flash-flood hazard under current precipitation projections.",
        "Groundwater aquifer recharge index rated 'Healthy' across 9 monitoring wells."
      ],
      riskOverview: "Hydrological hazard remains strictly Low. Drainage network capacity accommodates up to 65mm/24h continuous downpour.",
      downloads: { pdfSize: "4.2 MB", csvRows: 28800, format: "USGS Hydrology XML/PDF" }
    },
    {
      id: "rep-05",
      title: "Daily Emissions & Clean Air Log - Oct 04, 2026",
      type: "Daily",
      category: "daily",
      date: "Oct 04, 2026",
      author: "SustiVision Continuous Audit Agent",
      status: "Published",
      envStatus: "GOOD",
      riskScore: "15 / 100",
      summary: "Daily compliance verification for industrial point-source discharges, highway emission plumes, and urban air quality compliance.",
      keyFindings: [
        "Zero point-source industrial emission exceedances detected.",
        "PM10 temporary spike in industrial sector cleared within 2 hours.",
        "Fleet electric bus deployment achieved 88% transit route electrification for the day."
      ],
      riskOverview: "Low overall risk with high environmental stability index.",
      downloads: { pdfSize: "1.3 MB", csvRows: 1440, format: "JSON & PDF" }
    }
  ],

  // AI Assistant Suggested Prompts & Structured Responses
  aiKnowledgeBase: {
    suggestedPrompts: [
      "What is today’s air quality?",
      "Predict flood risk.",
      "Explain carbon emissions.",
      "What environmental trends should I monitor?",
      "What risks should I prepare for?"
    ],
    responses: {
      "what is today's air quality?": {
        analysis: "Current Air Quality Index (AQI) is measured at 42, which falls well within the 'Good' (0-50) regulatory bracket. Fine particulate matter (PM2.5) is at 9.8 µg/m³, which complies with both WHO guidelines (<15 µg/m³ 24h avg) and EPA national ambient air standards. Coarse particulate matter (PM10) is 18 µg/m³ and ambient Nitrogen Dioxide (NO2) remains low at 14.2 ppb. A slight, localized increase in ground-level Ozone (O3) has been observed around the South Corridor due to peak midday solar irradiance.",
        recommendation: "Continue standard monitoring protocols. For municipal teams, maintain normal ventilation settings in civic facilities. For school districts and outdoor facilities, all physical outdoor activities can proceed without restriction, with mild awareness advised in the South Corridor between 12:00 and 15:30.",
        confidence: 94,
        relevantMetrics: [
          { label: "AQI", value: "42", badge: "Good", color: "emerald" },
          { label: "PM2.5", value: "9.8 µg/m³", badge: "Safe", color: "emerald" },
          { label: "PM10", value: "18.0 µg/m³", badge: "Safe", color: "emerald" },
          { label: "Ozone (O3)", value: "28 ppb", badge: "Normal", color: "emerald" },
          { label: "WHO Compliant", value: "Yes", badge: "Passed", color: "teal" }
        ]
      },
      "predict flood risk.": {
        analysis: "Multi-layered hydrological modeling calculates a low regional flood risk probability of 18% over the upcoming 7-day projection window. Current soil moisture saturation is measured at 34%, providing substantial subterranean absorption capacity. Weather radar and atmospheric moisture flux models project total cumulative rainfall of approximately 12 mm across the catchment basin, which is well below the 45 mm saturation threshold required to trigger surface ponding.",
        recommendation: "Continue routine automated telemetry from river basin pressure sensors and culvert drainage monitors. No emergency floodgates or preventive sandbag barriers are necessary at this juncture. Next automated hydrological simulation scheduled in 6 hours.",
        confidence: 88,
        relevantMetrics: [
          { label: "Flood Probability", value: "18%", badge: "Low Risk", color: "emerald" },
          { label: "Soil Saturation", value: "34%", badge: "Optimal", color: "emerald" },
          { label: "7-Day Precip", value: "12 mm", badge: "Normal", color: "emerald" },
          { label: "Reservoir Reserve", value: "29% Headroom", badge: "Safe", color: "teal" },
          { label: "Runoff Velocity", value: "1.2 m/s", badge: "Stable", color: "teal" }
        ]
      },
      "explain carbon emissions.": {
        analysis: "Atmospheric CO₂ background concentration at our monitoring node stands at 412 ppm, aligned with seasonal northern hemisphere baselines. Daily regional carbon intensity across the monitored municipal grid is currently estimated at 184 gCO₂/kWh, marking an 8.4% reduction compared to last quarter, driven by strong solar photovoltaic output (accounting for 38.6% of daytime supply) and optimized building HVAC scheduling.",
        recommendation: "To maintain this trajectory toward your 2030 municipal net-zero target: (1) Keep commercial chiller pre-cooling protocols enabled during low-carbon grid hours (09:00 - 13:00); (2) Ensure EV fleet charging depots maintain dynamic peak-shaving throttle; (3) Review upcoming Q3 Scope 1 & 2 carbon accounting reports in the Reports tab.",
        confidence: 91,
        relevantMetrics: [
          { label: "Ambient CO₂", value: "412 ppm", badge: "Baseline", color: "emerald" },
          { label: "Grid Carbon Intensity", value: "184 gCO₂/kWh", badge: "Low", color: "emerald" },
          { label: "Renewable Share", value: "46.2%", badge: "+4.1%", color: "teal" },
          { label: "Scope 1 Trajectory", value: "-6.4% YoY", badge: "On Target", color: "teal" }
        ]
      },
      "what environmental trends should I monitor?": {
        analysis: "Three key environmental trends currently warrant proactive tracking: (1) Urban Heat Island Divergence: Central commercial districts are registering a +2.4°C thermal anomaly compared to surrounding green spaces during late afternoon; (2) Morning Thermal Inversion: Expected between 07:00 and 10:00 on weekdays, causing mild particulate trapping along the I-880 transit corridor; (3) Soil Moisture Depletion: Soil moisture is steady at 34% today but trending downward by 1.2% every 3 days in the eastern agricultural buffer.",
        recommendation: "Prioritize automated cooling mist triggers in identified thermal hotspot zones. For traffic corridors, coordinate with regional transit authorities to optimize signal timing for reduced idling during inversion windows.",
        confidence: 89,
        relevantMetrics: [
          { label: "Heat Island Delta", value: "+2.4°C", badge: "Watch", color: "amber" },
          { label: "Inversion Duration", value: "3.0 hrs/day", badge: "Moderate", color: "amber" },
          { label: "Soil Desiccation Rate", value: "-0.4%/day", badge: "Low", color: "emerald" },
          { label: "Canopy Index", value: "32%", badge: "Stable", color: "teal" }
        ]
      },
      "what risks should I prepare for?": {
        analysis: "Based on predictive intelligence across meteorological, hydrological, and environmental sensor arrays, the two primary items to prepare for are: (1) Midday Ground-Level Ozone Peaks: Anticipated to reach 68-72 ppb on warm, sunny days this week; (2) Urban Thermal Stress: Peak temperatures approaching 31-32°C over the next 48 hours, creating potential comfort index strain in unshaded transit shelters. Flood, wildfire, and industrial pollutant risks remain at low baseline.",
        recommendation: "Implement proactive mitigations: (1) Dispatch automated alerts to public transit apps reminding riders of hydration and shaded stops; (2) Schedule heavy city maintenance equipment outside the 12:00 - 15:00 high-solar window to limit secondary VOC/NOx catalysts; (3) Verify automated misting functionality at high-traffic plazas.",
        confidence: 86,
        relevantMetrics: [
          { label: "Peak Heat Risk", value: "Moderate (44%)", badge: "Watch", color: "amber" },
          { label: "Peak Ozone Risk", value: "Moderate (38%)", badge: "Watch", color: "amber" },
          { label: "Flood Hazard", value: "Low (18%)", badge: "Safe", color: "emerald" },
          { label: "Wildfire Hazard", value: "Low (9%)", badge: "Safe", color: "emerald" }
        ]
      }
    }
  },

  // User Profile Data
  user: {
    name: "Dr. Elena Vance",
    initials: "EV",
    role: "Chief Sustainability Officer",
    title: "Director of Environmental Intelligence",
    organization: "Global Environmental Observatory & Municipal Council",
    email: "elena.vance@sustivision.ai",
    phone: "+1 (415) 890-4210",
    avatar: "assets/avatar.png",
    location: "San Francisco, California, USA",
    joinedDate: "January 2024",
    lastLogin: "Today, 08:30 AM (Secured via 2FA)",
    securityLevel: "Enterprise Tier-1 Admin",
    activeNodesManaged: 14,
    auditLogCount: 184
  },

  // User Settings Default State
  settings: {
    theme: "light", // light | dark | system
    language: "en",
    notifications: {
      environmentalAlerts: true,
      pollutionAlerts: true,
      floodWarnings: true,
      heatWarnings: true,
      emailDigest: true,
      pushCriticalAlerts: true,
      weeklySummary: true
    },
    privacy: {
      shareTelemetry: true,
      anonymizedBenchmarking: true,
      dataRetentionDays: 90
    },
    security: {
      twoFactorEnabled: true,
      sessionTimeoutMinutes: 60
    }
  }
};

if (typeof window !== "undefined") {
  window.SUSTIVISION_DATA = SUSTIVISION_DATA;
}
