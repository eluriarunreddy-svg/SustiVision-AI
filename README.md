# SustiVision AI - AI-Powered Environmental Intelligence Platform

> **“We plan to see a greener tomorrow.”**

**SustiVision AI** is a modern, enterprise-grade environmental intelligence and sustainability analytics platform designed for governments, NGOs, environmental researchers, universities, and corporate sustainability officers.

---

## 🌟 Product Features & Architecture

### 1. Environmental Intelligence Dashboard
- **Header & Telemetry Feed**: Real-time sensor synchronization, monitoring hub selector (San Francisco Bay, Copenhagen Green District, Hudson River Basin, Tokyo Minato, Rhine Valley), live status badge, and user context.
- **4 Primary KPI Cards**:
  - **Air Quality Index (AQI)**: 42 (Good) with 24-hour delta comparison and PM2.5 / PM10 / Ozone breakdowns.
  - **Ambient Temperature**: 28°C (Normal) with high/low bounds and thermal comfort indices.
  - **Relative Humidity**: 64% (Optimal) with vapor pressure and soil saturation telemetry.
  - **Composite Environmental Health**: 94.2/100 (Stable) compliant with ISO 14001 standards across all monitored sectors.
- **Prominent Environmental Status Component**: Immediate visual status (`GOOD` / `MODERATE` / `CRITICAL`) with sector metric breakdowns.
- **Interactive Multi-Variable Charts**: Air quality trends, temperature and humidity correlation, and composite environmental health index with time-horizon filters (`24H`, `7D`, `30D`, `90D`).
- **Environmental Alerts Section**: Localized real-time alerts categorized by severity (Critical, Warning, Advisory, Info) with mitigation shortcuts.

### 2. AI Sustainability Assistant
- **Dedicated 3-Column Experience**:
  - **Left**: Conversation history threads, search, and new chat creation.
  - **Center**: Rich chat interface with user queries, structured AI analysis, typing simulation, timestamps, copy response, regeneration, and helpfulness voting.
  - **Right**: Real-time environmental telemetry context panel and proactive advisory notes.
- **Structured Response Architecture**:
  - **Analysis**: Evidence-backed environmental findings.
  - **Recommended Action**: Actionable operational protocols.
  - **Confidence Level**: High-precision statistical confidence rating.
  - **Relevant Metrics**: Live interactive telemetry badges.
- **Pre-Configured Suggested Prompts**:
  - *“What is today’s air quality?”*
  - *“Predict flood risk.”*
  - *“Explain carbon emissions.”*
  - *“What environmental trends should I monitor?”*
  - *“What risks should I prepare for?”*

### 3. Proactive Risk Predictions
- **Dedicated Risk Forecasting Dashboard**:
  - **Flood Risk**: 18% Low probability, 7-day projection, rainfall and soil saturation factors.
  - **Climate Risk**: 44% Moderate probability, 30-day projection, urban heat island factor.
  - **Weather Risk**: 12% Low probability, 48-hour projection, barometric gradient stability.
  - **Air Quality Degradation Risk**: 38% Moderate probability, thermal inversion model.
  - **Wildfire Vulnerability**: 9% Low probability, fuel moisture rating.
- **Interactive Time Horizon Filters**: `7D`, `14D`, `30D`, `90D`.
- **Contributing Factors Breakdown**: Visual impact tags and weight metrics.

### 4. Advanced Analytics
- **Cross-Sensor Time Series**: Speciation vs WHO regulatory limits (PM2.5, PM10, NO₂, SO₂, O₃, CO).
- **Multi-Year Climate Baseline**: 10-year historical baseline comparison.
- **Performance KPIs**: Average AQI (38.4), Mean Temp (22.6°C), Humidity (58.2%), Risk reduction (-14%), Compliance rate (94.2%).
- **Interactive Sector Data Table**: Search, filter, inspect, and CSV export.

### 5. Automated Reports
- **Cadence Categorization**: Daily, Weekly, and Monthly executive briefings.
- **Full Report Modal**: Executive summary, audited key findings, risk scores, and print layouts.
- **Export Formats**: Standardized PDF, CSV, and JSON download simulations.
- **AI Report Generator**: On-demand synthesis of real-time environmental data.

### 6. Notifications Center
- Filterable notifications across Environmental Alerts, High Pollution, Flood Warnings, and Heat Advisories.
- Unread counters, mark as read, mark all, and dismiss actions.

### 7. Settings & Platform Customization
- **Theme**: Instant toggle between Light, Dark, and System modes.
- **Profile**: Account details, organization credentials, and role.
- **Notifications**: Granular toggles for alert categories and email digests.
- **Language & Standards**: Multi-language support and regulatory framework selection (WHO, US EPA, EU CSRD).
- **Security & Privacy**: Password update, 2FA enforcement, and telemetry export archives.

### 8. Authentication & Public Landing
- Clean, minimal public landing page showcasing the platform value proposition, hero headline, dashboard preview card, and partner trust badges.
- Dedicated Sign In & Sign Up interfaces with one-click **"Demo Login"** evaluator access.

---

## 🚀 How to Run

### Option 1: Live Local Server (Currently Active)
The application is currently served locally on port `3000`:
- Open your web browser and navigate to: **`http://localhost:3000/`**

### Option 2: Using the Included Windows Batch Launcher
Double-click **`start-server.bat`** or run:
```powershell
python -m http.server 3000
```
Then visit `http://localhost:3000/`.

### Option 3: Direct File Opening
You can also open `index.html` directly in modern browsers (Chrome, Edge, Firefox, Safari).

---

## 🎨 Design System & Palette

- **Brand Forest Green**: `#0D3823` / `#14532D`
- **Positive Environmental Status / Accent**: `#059669` / `#10B981`
- **Background**: Soft off-white `#F8FAFC` (Light) / Slate `#090E17` (Dark)
- **Primary Text**: Dark Charcoal `#0F172A` / `#F8FAFC`
- **Secondary Text**: Muted Slate `#64748B` / `#CBD5E1`
- **Warnings / Heat**: Amber `#F59E0B`
- **Critical Hazards**: Rose / Red `#EF4444` / `#DC2626`
- **Hydrological / Sky Accents**: `#0284C7` / `#0D9488`
- **Typography**: Plus Jakarta Sans & Inter
- **Icons**: Lucide Icons
- **Charts**: Chart.js
