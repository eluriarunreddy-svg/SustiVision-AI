/**
 * SustiVision AI - Chart Manager & Environmental Data Visualizations
 * Powered by Chart.js with responsive theme adaptation
 */

class EnvironmentalChartManager {
  constructor() {
    this.instances = {};
    this.currentRange = "24H";
  }

  // Get current color scheme based on dark/light mode
  getThemeColors() {
    const isDark = document.documentElement.classList.contains("dark");
    return {
      textColor: isDark ? "#94a3b8" : "#64748b",
      gridColor: isDark ? "rgba(51, 65, 85, 0.4)" : "rgba(226, 232, 240, 0.8)",
      tooltipBg: isDark ? "#0f172a" : "#1e293b",
      tooltipText: "#ffffff",
      emerald: "#10b981",
      emeraldFill: isDark ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.08)",
      forest: "#0d3823",
      sky: "#0284c7",
      skyFill: isDark ? "rgba(2, 132, 199, 0.12)" : "rgba(2, 132, 199, 0.08)",
      amber: "#f59e0b",
      rose: "#ef4444"
    };
  }

  // Destroy existing chart instance safely
  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  }

  // Initialize or update Dashboard Air Quality Trend Chart
  renderAirQualityChart(canvasId, timeRange = "24H") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);
    const colors = this.getThemeColors();
    const data = window.SUSTIVISION_DATA.timeSeries[timeRange] || window.SUSTIVISION_DATA.timeSeries["24H"];

    const ctx = canvas.getContext("2d");
    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Air Quality Index (AQI)",
            data: data.aqi,
            borderColor: colors.emerald,
            backgroundColor: colors.emeraldFill,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: colors.emerald,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 1.5,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "PM2.5 (µg/m³)",
            data: data.pm25,
            borderColor: colors.sky,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [4, 4],
            fill: false,
            tension: 0.35,
            pointBackgroundColor: colors.sky,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              pointStyle: "circle",
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "500" }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 12,
            cornerRadius: 8,
            boxPadding: 4,
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            min: 0,
            max: Math.max(...data.aqi) + 20,
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (val) => val + " AQI"
            }
          }
        }
      }
    });
  }

  // Initialize or update Dashboard Temperature & Humidity Trend Chart
  renderTempHumidityChart(canvasId, timeRange = "24H") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);
    const colors = this.getThemeColors();
    const data = window.SUSTIVISION_DATA.timeSeries[timeRange] || window.SUSTIVISION_DATA.timeSeries["24H"];

    const ctx = canvas.getContext("2d");
    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: data.temp,
            borderColor: colors.amber,
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            yAxisID: "yTemp",
            pointBackgroundColor: colors.amber,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Humidity (%)",
            data: data.humidity,
            borderColor: colors.sky,
            backgroundColor: "transparent",
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            yAxisID: "yHumidity",
            pointBackgroundColor: colors.sky,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              pointStyle: "circle",
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "500" }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const val = context.parsed.y;
                return label.includes("Temp") ? `${label}: ${val}°C` : `${label}: ${val}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          yTemp: {
            type: "linear",
            position: "left",
            min: 15,
            max: 38,
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (v) => v + "°C"
            }
          },
          yHumidity: {
            type: "linear",
            position: "right",
            min: 30,
            max: 100,
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (v) => v + "%"
            }
          }
        }
      }
    });
  }

  // Initialize or update Environmental Composite Health Chart
  renderCompositeHealthChart(canvasId, timeRange = "24H") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);
    const colors = this.getThemeColors();
    const data = window.SUSTIVISION_DATA.timeSeries[timeRange] || window.SUSTIVISION_DATA.timeSeries["24H"];

    const ctx = canvas.getContext("2d");
    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Environmental Health Index (%)",
            data: data.compositeHealth,
            borderColor: colors.emerald,
            backgroundColor: colors.emeraldFill,
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: colors.emerald,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `Overall Health: ${ctx.parsed.y}% (Optimal)`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            min: 70,
            max: 100,
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (v) => v + "%"
            }
          }
        }
      }
    });
  }

  // Analytics View: Pollutant Breakdown Bar Chart
  renderPollutantBreakdownChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);
    const colors = this.getThemeColors();

    const ctx = canvas.getContext("2d");
    this.instances[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["PM2.5", "PM10", "NO₂", "SO₂", "O₃", "CO (x10)"],
        datasets: [
          {
            label: "Current Measured Level",
            data: [9.8, 18.0, 14.2, 3.1, 28.0, 4.0],
            backgroundColor: [
              "#10b981", // PM2.5 (emerald)
              "#059669", // PM10
              "#0284c7", // NO2 (sky)
              "#0d9488", // SO2 (teal)
              "#f59e0b", // O3 (amber)
              "#6366f1"  // CO
            ],
            borderRadius: 6,
            barThickness: 28
          },
          {
            label: "Regulatory Safety Threshold",
            data: [15.0, 45.0, 40.0, 20.0, 70.0, 35.0],
            backgroundColor: "rgba(148, 163, 184, 0.25)",
            borderRadius: 6,
            barThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          }
        }
      }
    });
  }

  // Analytics View: Climate Multi-Year Comparison Line Chart
  renderClimateTrendsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.destroyChart(canvasId);
    const colors = this.getThemeColors();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const historicAvg = [12.1, 13.4, 15.0, 17.2, 19.8, 22.5, 25.1, 25.6, 23.8, 19.9, 15.2, 12.5];
    const currentYear = [12.8, 14.1, 15.9, 18.1, 20.9, 23.8, 26.7, 27.2, 25.0, 22.6, null, null];

    const ctx = canvas.getContext("2d");
    this.instances[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "2026 Observed Ambient Temp (°C)",
            data: currentYear,
            borderColor: colors.emerald,
            backgroundColor: colors.emeraldFill,
            borderWidth: 2.5,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: colors.emerald,
            pointRadius: 4
          },
          {
            label: "10-Year Historical Baseline (°C)",
            data: historicAvg,
            borderColor: "#94a3b8",
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
            }
          },
          y: {
            min: 10,
            max: 32,
            grid: { color: colors.gridColor },
            ticks: {
              color: colors.textColor,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: (v) => v + "°C"
            }
          }
        }
      }
    });
  }

  // Update all active charts when theme changes
  refreshAll(timeRange) {
    if (timeRange) this.currentRange = timeRange;
    if (document.getElementById("airQualityChart")) {
      this.renderAirQualityChart("airQualityChart", this.currentRange);
    }
    if (document.getElementById("tempHumidityChart")) {
      this.renderTempHumidityChart("tempHumidityChart", this.currentRange);
    }
    if (document.getElementById("compositeHealthChart")) {
      this.renderCompositeHealthChart("compositeHealthChart", this.currentRange);
    }
    if (document.getElementById("pollutantBreakdownChart")) {
      this.renderPollutantBreakdownChart("pollutantBreakdownChart");
    }
    if (document.getElementById("climateTrendsChart")) {
      this.renderClimateTrendsChart("climateTrendsChart");
    }
  }
}

if (typeof window !== "undefined") {
  window.chartManager = new EnvironmentalChartManager();
}
