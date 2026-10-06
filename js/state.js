/**
 * SustiVision AI - Reactive Application State Manager
 */

class AppStateManager {
  constructor() {
    this.data = window.SUSTIVISION_DATA || {};
    this.listeners = new Set();

    // Load persisted state if present, or initialize defaults
    const savedTheme = localStorage.getItem("sustivision_theme") || "light";
    const savedAuth = localStorage.getItem("sustivision_auth");
    
    this.state = {
      // Navigation & Auth
      isAuthenticated: savedAuth !== null ? JSON.parse(savedAuth) : true,
      currentRoute: "dashboard", // landing, dashboard, assistant, predictions, analytics, reports, notifications, settings, profile
      authModalMode: null, // 'login', 'signup', 'forgot', 'confirm'
      
      // Environmental Context
      activeLocationId: "sf-bay",
      activeTimeRange: "24H", // 24H, 7D, 30D, 90D
      
      // Notifications
      notifications: JSON.parse(JSON.stringify(this.data.alerts || [])),
      notificationFilter: "all",
      
      // AI Assistant Chat
      conversations: [
        {
          id: "conv-01",
          title: "Daily Air Quality & Ozone Analysis",
          updatedAt: "Today, 10:20 AM",
          pinned: true,
          messages: [
            {
              id: "msg-0",
              sender: "ai",
              timestamp: "10:18 AM",
              analysis: "Welcome to SustiVision AI Assistant. I am monitoring 1,428 active environmental sensor nodes. Air quality across the primary sector is currently Good (AQI 42). How can I assist your sustainability intelligence workflow today?",
              recommendation: "You can ask for risk forecasts, carbon emission analyses, regulatory compliance checks, or click any suggested prompt below.",
              confidence: 98,
              relevantMetrics: [
                { label: "Active Nodes", value: "1,428", badge: "Online", color: "emerald" },
                { label: "System Health", value: "99.98%", badge: "Optimal", color: "emerald" }
              ]
            }
          ]
        },
        {
          id: "conv-02",
          title: "Q3 Watershed Flood Risk Assessment",
          updatedAt: "Yesterday",
          pinned: false,
          messages: []
        },
        {
          id: "conv-03",
          title: "Municipal Scope 1 & 2 GHG Audit",
          updatedAt: "Oct 02, 2026",
          pinned: false,
          messages: []
        }
      ],
      activeConversationId: "conv-01",
      isAiTyping: false,

      // Risk Predictions
      activeRiskTimeframe: "7D", // 7D, 14D, 30D, 90D
      selectedRiskItem: null,

      // Analytics
      analyticsMetric: "all",
      analyticsDateRange: "30D",
      analyticsLocation: "sf-bay",

      // Reports
      reports: JSON.parse(JSON.stringify(this.data.reports || [])),
      reportFilter: "all",
      reportSearchQuery: "",
      viewingReport: null,

      // Settings & Theme
      theme: savedTheme,
      activeSettingsTab: "profile",
      settings: JSON.parse(JSON.stringify(this.data.settings || {})),
      user: JSON.parse(JSON.stringify(this.data.user || {})),

      // UI Dropdowns & Drawers
      isMobileMenuOpen: false,
      isProfileDropdownOpen: false,
      isNotificationsDropdownOpen: false,
      isLocationSelectorOpen: false
    };

    // Apply theme on init
    this.applyTheme(this.state.theme);
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all subscribers
  notify(changedKeys = []) {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state, changedKeys);
      } catch (err) {
        console.error("State listener error:", err);
      }
    });
  }

  // Generic setState
  setState(updates) {
    const changedKeys = Object.keys(updates);
    this.state = { ...this.state, ...updates };

    if (updates.theme) {
      this.applyTheme(updates.theme);
      localStorage.setItem("sustivision_theme", updates.theme);
    }

    if (updates.isAuthenticated !== undefined) {
      localStorage.setItem("sustivision_auth", JSON.stringify(updates.isAuthenticated));
    }

    this.notify(changedKeys);
  }

  // Navigation
  navigateTo(route) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.setState({
      currentRoute: route,
      isMobileMenuOpen: false,
      isProfileDropdownOpen: false,
      isNotificationsDropdownOpen: false
    });
  }

  // Theme application
  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else {
      root.classList.remove("dark");
    }
  }

  // Location Switcher
  switchLocation(locationId) {
    const location = this.data.locations.find((l) => l.id === locationId);
    if (!location) return;

    this.setState({
      activeLocationId: locationId,
      isLocationSelectorOpen: false
    });
    this.showToast(`Switched active monitoring zone to ${location.name}`, "info");
  }

  // Time Range Switcher
  setTimeRange(range) {
    this.setState({ activeTimeRange: range });
  }

  // Notification methods
  getUnreadNotificationsCount() {
    return this.state.notifications.filter((n) => !n.read).length;
  }

  markNotificationAsRead(id) {
    const updated = this.state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.setState({ notifications: updated });
  }

  markAllNotificationsAsRead() {
    const updated = this.state.notifications.map((n) => ({ ...n, read: true }));
    this.setState({ notifications: updated });
    this.showToast("All notifications marked as read", "success");
  }

  deleteNotification(id) {
    const updated = this.state.notifications.filter((n) => n.id !== id);
    this.setState({ notifications: updated });
    this.showToast("Notification dismissed", "info");
  }

  // AI Assistant Interaction
  sendAiMessage(promptText) {
    if (!promptText || !promptText.trim()) return;
    const cleanPrompt = promptText.trim();

    const activeConv = this.state.conversations.find(
      (c) => c.id === this.state.activeConversationId
    ) || this.state.conversations[0];

    const userMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: cleanPrompt
    };

    const updatedMessages = [...activeConv.messages, userMessage];
    const updatedConversations = this.state.conversations.map((c) =>
      c.id === activeConv.id ? { ...c, messages: updatedMessages, updatedAt: "Just now" } : c
    );

    this.setState({
      conversations: updatedConversations,
      isAiTyping: true
    });

    // Simulate AI reasoning & response with realistic timing
    setTimeout(() => {
      const responseData = this.generateAiResponse(cleanPrompt);
      const aiMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ...responseData
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalConversations = this.state.conversations.map((c) =>
        c.id === activeConv.id ? { ...c, messages: finalMessages } : c
      );

      this.setState({
        conversations: finalConversations,
        isAiTyping: false
      });
    }, 900);
  }

  generateAiResponse(query) {
    const qLower = query.toLowerCase();
    const kb = this.data.aiKnowledgeBase.responses;

    // Check pre-configured exact/fuzzy matches
    for (const key of Object.keys(kb)) {
      if (qLower.includes(key.replace(/[.?]/g, "").trim())) {
        return kb[key];
      }
    }

    if (qLower.includes("air") || qLower.includes("aqi") || qLower.includes("pollution") || qLower.includes("smog")) {
      return kb["what is today's air quality?"];
    }
    if (qLower.includes("flood") || qLower.includes("water") || qLower.includes("rain") || qLower.includes("river")) {
      return kb["predict flood risk."];
    }
    if (qLower.includes("carbon") || qLower.includes("emission") || qLower.includes("co2") || qLower.includes("ghg")) {
      return kb["explain carbon emissions."];
    }
    if (qLower.includes("trend") || qLower.includes("monitor") || qLower.includes("temperature") || qLower.includes("heat")) {
      return kb["what environmental trends should I monitor?"];
    }
    if (qLower.includes("risk") || qLower.includes("prepare") || qLower.includes("hazard") || qLower.includes("alert")) {
      return kb["what risks should I prepare for?"];
    }

    // Dynamic contextual response for other queries
    return {
      analysis: `Cross-referencing sensor array for "${query}": Telemetry across the active regional cluster indicates consistent stability. Real-time air quality index is 42 (Good), ambient surface temperature is 28°C, and relative humidity is 64%. Historical variance analysis shows no statistically significant deviation from environmental baseline models.`,
      recommendation: "Maintain proactive sensor surveillance. You can export an automated environmental brief or adjust localized threshold alerts in the Settings panel.",
      confidence: 87,
      relevantMetrics: [
        { label: "Telemetry Status", value: "Verified", badge: "Normal", color: "emerald" },
        { label: "Confidence", value: "87%", badge: "High", color: "emerald" },
        { label: "Sector Compliance", value: "100%", badge: "Compliant", color: "teal" }
      ]
    };
  }

  // Toast feedback system
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-emerald-800 text-white border-emerald-700",
      info: "bg-slate-900 text-white border-slate-800",
      warning: "bg-amber-600 text-white border-amber-500",
      error: "bg-rose-700 text-white border-rose-600"
    };

    const icons = {
      success: "✓",
      info: "ℹ",
      warning: "⚠",
      error: "✕"
    };

    toast.className = `flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">${icons[type]}</span>
      <span class="flex-1">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    // Auto dismiss after 3.2s
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate globally
if (typeof window !== "undefined") {
  window.appState = new AppStateManager();
}
