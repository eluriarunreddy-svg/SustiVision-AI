/**
 * SustiVision AI - Main Application Controller & UI View Renderers
 * Seamlessly integrates State, Charts, Telemetry Data, and Responsive Interactions
 */

class SustiVisionApp {
  constructor() {
    this.state = window.appState;
    this.data = window.SUSTIVISION_DATA;
    this.charts = window.chartManager;
    
    this.init();
  }

  init() {
    // Subscribe to state changes
    this.state.subscribe((state, changedKeys) => {
      this.handleStateChange(state, changedKeys);
    });

    // Render initial interface
    this.render();

    // Setup global listeners (click outside, keyboard shortcuts, etc.)
    this.setupGlobalEventListeners();

    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  handleStateChange(state, changedKeys) {
    // If route changed or auth status changed, re-render main views
    if (changedKeys.includes("currentRoute") || changedKeys.includes("isAuthenticated")) {
      this.render();
    } else {
      // Partial updates
      if (changedKeys.includes("activeLocationId") || changedKeys.includes("activeTimeRange")) {
        this.updateDashboardMetrics();
      }
      if (changedKeys.includes("theme")) {
        if (this.charts) {
          this.charts.refreshAll(this.state.state.activeTimeRange);
        }
      }
      if (changedKeys.includes("conversations") || changedKeys.includes("isAiTyping")) {
        this.renderChatMessages();
      }
      if (changedKeys.includes("notifications")) {
        this.updateNotificationBadges();
        if (this.state.state.currentRoute === "notifications") {
          this.renderNotificationsView();
        }
      }
      if (changedKeys.includes("reportFilter") || changedKeys.includes("reportSearchQuery")) {
        if (this.state.state.currentRoute === "reports") {
          this.renderReportsList();
        }
      }
    }

    // Refresh icons
    if (window.lucide) {
      setTimeout(() => window.lucide.createIcons(), 50);
    }
  }

  render() {
    const appContainer = document.getElementById("app-root");
    if (!appContainer) return;

    const { isAuthenticated, currentRoute } = this.state.state;

    // If user is on landing page or not authenticated, render landing / auth
    if (currentRoute === "landing" || (!isAuthenticated && currentRoute !== "login" && currentRoute !== "signup")) {
      appContainer.innerHTML = this.renderLandingPage();
      this.bindLandingEvents();
      return;
    }

    if (currentRoute === "login" || currentRoute === "signup") {
      appContainer.innerHTML = this.renderAuthPage(currentRoute);
      this.bindAuthEvents();
      return;
    }

    // Render Main Application Shell
    appContainer.innerHTML = `
      <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#090e17] text-slate-800 dark:text-slate-100">
        <!-- Desktop Persistent Left Sidebar -->
        ${this.renderSidebar()}

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
          <!-- Top Application Header -->
          ${this.renderHeader()}

          <!-- Scrollable Viewport -->
          <main id="main-viewport" class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
            ${this.renderActiveView(currentRoute)}
          </main>
        </div>

        <!-- Mobile Drawer Navigation -->
        ${this.renderMobileDrawer()}

        <!-- Mobile Bottom Navigation Bar -->
        ${this.renderMobileBottomNav()}
      </div>

      <!-- Global Modals Container -->
      <div id="modal-container">
        ${this.renderActiveModals()}
      </div>
    `;

    this.bindAppShellEvents();
    this.postRenderView(currentRoute);
  }

  /* =========================================================================
   * VIEW: ACTIVE VIEW DISPATCHER
   * ========================================================================= */
  renderActiveView(route) {
    switch (route) {
      case "dashboard":
        return this.renderDashboardView();
      case "assistant":
        return this.renderAssistantView();
      case "predictions":
        return this.renderPredictionsView();
      case "analytics":
        return this.renderAnalyticsView();
      case "reports":
        return this.renderReportsView();
      case "notifications":
        return this.renderNotificationsView();
      case "settings":
        return this.renderSettingsView();
      case "profile":
        return this.renderProfileView();
      default:
        return this.renderDashboardView();
    }
  }

  postRenderView(route) {
    if (route === "dashboard") {
      setTimeout(() => {
        this.charts.renderAirQualityChart("airQualityChart", this.state.state.activeTimeRange);
        this.charts.renderTempHumidityChart("tempHumidityChart", this.state.state.activeTimeRange);
        this.charts.renderCompositeHealthChart("compositeHealthChart", this.state.state.activeTimeRange);
      }, 50);
      this.bindDashboardEvents();
    } else if (route === "assistant") {
      this.bindAssistantEvents();
      this.renderChatMessages();
    } else if (route === "predictions") {
      this.bindPredictionsEvents();
    } else if (route === "analytics") {
      setTimeout(() => {
        this.charts.renderPollutantBreakdownChart("pollutantBreakdownChart");
        this.charts.renderClimateTrendsChart("climateTrendsChart");
      }, 50);
      this.bindAnalyticsEvents();
    } else if (route === "reports") {
      this.bindReportsEvents();
    } else if (route === "notifications") {
      this.bindNotificationsEvents();
    } else if (route === "settings") {
      this.bindSettingsEvents();
    } else if (route === "profile") {
      this.bindProfileEvents();
    }
  }

  /* =========================================================================
   * COMPONENT: SIDEBAR
   * ========================================================================= */
  renderSidebar() {
    const { currentRoute } = this.state.state;
    const unreadCount = this.state.getUnreadNotificationsCount();

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "assistant", label: "AI Assistant", icon: "sparkles", badge: "AI" },
      { id: "predictions", label: "Risk Predictions", icon: "shield-alert" },
      { id: "analytics", label: "Analytics", icon: "bar-chart-3" },
      { id: "reports", label: "Reports", icon: "file-text" },
      { id: "notifications", label: "Notifications", icon: "bell", count: unreadCount },
      { id: "settings", label: "Settings", icon: "settings" },
      { id: "profile", label: "Profile", icon: "user" }
    ];

    return `
      <aside class="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] select-none z-30">
        <!-- Logo Header -->
        <div class="h-18 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center space-x-3 cursor-pointer" onclick="window.appState.navigateTo('dashboard')">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <i data-lucide="leaf" class="w-5 h-5 text-emerald-300"></i>
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white">SustiVision</span>
                <span class="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">AI</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Intelligence Platform</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">Main Navigation</div>
          ${navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return `
              <button 
                onclick="window.appState.navigateTo('${item.id}')"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }">
                <div class="flex items-center space-x-3">
                  <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? "text-emerald-200" : "text-slate-400 dark:text-slate-400"}"></i>
                  <span>${item.label}</span>
                </div>
                ${item.badge ? `<span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isActive ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"}">${item.badge}</span>` : ""}
                ${item.count && item.count > 0 ? `<span class="text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white text-emerald-800" : "bg-rose-500 text-white"}">${item.count}</span>` : ""}
              </button>
            `;
          }).join("")}
        </div>

        <!-- System Status Mini Pill -->
        <div class="px-4 py-3 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center space-x-2">
              <span class="live-indicator"></span>
              <span class="font-medium text-slate-700 dark:text-slate-300">Telemetry Online</span>
            </span>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400">99.98%</span>
          </div>
          <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-1 truncate">1,428 active environmental nodes</div>
        </div>

        <!-- User Profile Bottom Snippet -->
        <div class="p-3 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
            <div class="flex items-center space-x-3 min-w-0 cursor-pointer" onclick="window.appState.navigateTo('profile')">
              <div class="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-600/30">
                ${this.data.user.initials}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-semibold text-slate-900 dark:text-white truncate">${this.data.user.name}</div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">${this.data.user.role}</div>
              </div>
            </div>
            <button 
              title="Logout" 
              onclick="window.appController.logout()"
              class="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700/50 transition-colors"
              aria-label="Logout">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  /* =========================================================================
   * COMPONENT: HEADER
   * ========================================================================= */
  renderHeader() {
    const { activeLocationId } = this.state.state;
    const currentLocation = this.data.locations.find((l) => l.id === activeLocationId) || this.data.locations[0];
    const unreadCount = this.state.getUnreadNotificationsCount();

    return `
      <header id="app-header" class="h-18 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0c1322]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <!-- Left: Greetings & Context -->
        <div class="flex items-center space-x-4">
          <!-- Mobile Hamburger Toggle -->
          <button 
            onclick="window.appController.toggleMobileMenu()"
            class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Menu">
            <i data-lucide="menu" class="w-5 h-5"></i>
          </button>

          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                Good morning, ${this.data.user.name.split(" ")[0]}
              </h1>
              <span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <span class="live-indicator mr-1.5"></span> Live Feed
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Here’s your environmental intelligence overview.
            </p>
          </div>
        </div>

        <!-- Right: Location Selector, Notification Bell, Theme Toggle, Profile Menu -->
        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Location / Hub Selector Dropdown -->
          <div class="relative">
            <button 
              id="location-selector-btn"
              onclick="window.appController.toggleLocationSelector()"
              class="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
              <span class="hidden md:inline">${currentLocation.name}</span>
              <span class="md:hidden truncate max-w-[90px]">${currentLocation.name.split(" ")[0]}</span>
              <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
            </button>

            <!-- Dropdown Menu -->
            <div id="location-dropdown" class="hidden absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
              <div class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Monitoring Hub</div>
              ${this.data.locations.map((loc) => `
                <button 
                  onclick="window.appState.switchLocation('${loc.id}')"
                  class="w-full flex items-start justify-between p-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${loc.id === activeLocationId ? "bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800" : ""}">
                  <div>
                    <div class="text-xs font-semibold text-slate-900 dark:text-white">${loc.name}</div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400">${loc.subtext}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${loc.activeSensors} sensors active</div>
                  </div>
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${loc.status === "GOOD" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"}">
                    ${loc.status}
                  </span>
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Quick AI Assistant Action -->
          <button 
            onclick="window.appState.navigateTo('assistant')"
            class="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
            <span>Ask AI</span>
          </button>

          <!-- Theme Toggle Button -->
          <button 
            onclick="window.appController.toggleTheme()"
            class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme">
            <i data-lucide="${this.state.state.theme === "dark" ? "sun" : "moon"}" class="w-4 h-4"></i>
          </button>

          <!-- Notification Bell -->
          <div class="relative">
            <button 
              onclick="window.appState.navigateTo('notifications')"
              class="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Notifications"
              aria-label="View Notifications">
              <i data-lucide="bell" class="w-4 h-4"></i>
              ${unreadCount > 0 ? `
                <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
              ` : ""}
            </button>
          </div>

          <!-- User Profile Dropdown Trigger -->
          <div class="relative">
            <button 
              id="profile-menu-btn"
              onclick="window.appController.toggleProfileDropdown()"
              class="flex items-center space-x-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 transition-all">
              <div class="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                ${this.data.user.initials}
              </div>
              <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
            </button>

            <!-- Profile Dropdown Content -->
            <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
              <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div class="text-xs font-semibold text-slate-900 dark:text-white">${this.data.user.name}</div>
                <div class="text-[11px] text-slate-400 truncate">${this.data.user.email}</div>
              </div>
              <button onclick="window.appState.navigateTo('profile')" class="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <i data-lucide="user" class="w-4 h-4 text-slate-400"></i>
                <span>Profile</span>
              </button>
              <button onclick="window.appState.navigateTo('settings')" class="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <i data-lucide="settings" class="w-4 h-4 text-slate-400"></i>
                <span>Settings</span>
              </button>
              <button onclick="window.appState.navigateTo('notifications')" class="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <i data-lucide="bell" class="w-4 h-4 text-slate-400"></i>
                <span>Notifications (${unreadCount})</span>
              </button>
              <div class="border-t border-slate-100 dark:border-slate-800 my-1"></div>
              <button onclick="window.appController.logout()" class="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg">
                <i data-lucide="log-out" class="w-4 h-4 text-rose-500"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  /* =========================================================================
   * COMPONENT: MOBILE DRAWER & BOTTOM NAV
   * ========================================================================= */
  renderMobileDrawer() {
    const { currentRoute, isMobileMenuOpen } = this.state.state;
    if (!isMobileMenuOpen) return "";

    const navItems = [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "assistant", label: "AI Assistant", icon: "sparkles" },
      { id: "predictions", label: "Risk Predictions", icon: "shield-alert" },
      { id: "analytics", label: "Analytics", icon: "bar-chart-3" },
      { id: "reports", label: "Reports", icon: "file-text" },
      { id: "notifications", label: "Notifications", icon: "bell" },
      { id: "settings", label: "Settings", icon: "settings" },
      { id: "profile", label: "Profile", icon: "user" }
    ];

    return `
      <div class="lg:hidden fixed inset-0 z-50 flex">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="window.appController.toggleMobileMenu()"></div>
        <div class="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10">
          <div class="h-18 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <i data-lucide="leaf" class="w-4 h-4"></i>
              </div>
              <span class="font-bold text-slate-900 dark:text-white">SustiVision AI</span>
            </div>
            <button onclick="window.appController.toggleMobileMenu()" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            ${navItems.map((item) => `
              <button 
                onclick="window.appState.navigateTo('${item.id}'); window.appController.toggleMobileMenu();"
                class="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium ${currentRoute === item.id ? "bg-emerald-700 text-white font-semibold" : "text-slate-600 dark:text-slate-400"}">
                <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                <span>${item.label}</span>
              </button>
            `).join("")}
          </div>
          <div class="p-4 border-t border-slate-100 dark:border-slate-800">
            <button onclick="window.appController.logout()" class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMobileBottomNav() {
    const { currentRoute } = this.state.state;
    const items = [
      { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
      { id: "assistant", label: "AI Chat", icon: "sparkles" },
      { id: "predictions", label: "Risks", icon: "shield-alert" },
      { id: "analytics", label: "Analytics", icon: "bar-chart-3" },
      { id: "reports", label: "Reports", icon: "file-text" }
    ];

    return `
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-40">
        ${items.map((item) => {
          const isActive = currentRoute === item.id;
          return `
            <button 
              onclick="window.appState.navigateTo('${item.id}')"
              class="flex flex-col items-center justify-center py-1 px-2 text-[11px] font-medium transition-colors ${
                isActive ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-400 dark:text-slate-400 hover:text-slate-600"
              }">
              <i data-lucide="${item.icon}" class="w-5 h-5 mb-0.5 ${isActive ? "text-emerald-700 dark:text-emerald-400" : ""}"></i>
              <span>${item.label}</span>
            </button>
          `;
        }).join("")}
      </nav>
    `;
  }

  /* =========================================================================
   * VIEW: 1. DASHBOARD
   * ========================================================================= */
  renderDashboardView() {
    const { activeTimeRange } = this.state.state;
    const telemetry = this.data.currentTelemetry;

    return `
      <div class="space-y-6">
        <!-- Environmental Status Banner -->
        <div class="p-5 md:p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 flex-shrink-0 mt-0.5">
              <i data-lucide="shield-check" class="w-6 h-6"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Environmental Status</span>
                <span class="px-2 py-0.5 text-xs font-extrabold uppercase rounded bg-emerald-600 text-white shadow-sm">
                  ${telemetry.environmentalStatus.value}
                </span>
                <span class="hidden sm:inline text-xs text-slate-400">· Compliant with ISO 14001 Standards</span>
              </div>
              <h2 class="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1">
                ${telemetry.environmentalStatus.subtitle}
              </h2>
              <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                ${telemetry.environmentalStatus.summary}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <button 
              onclick="window.appState.navigateTo('assistant')"
              class="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm transition-all flex items-center space-x-2">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>Consult AI Analyst</span>
            </button>
            <button 
              onclick="window.appController.quickExportSummary()"
              class="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all flex items-center space-x-1.5">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        <!-- 4 Primary KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <!-- Card 1: Air Quality Index -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Air Quality Index</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <i data-lucide="wind" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${telemetry.aqi.value}</span>
              <span class="text-xs font-bold text-slate-400">${telemetry.aqi.unit}</span>
              <span class="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ${telemetry.aqi.status}
              </span>
            </div>
            <div class="flex items-center space-x-1.5 mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i>
              <span>${telemetry.aqi.comparison}</span>
            </div>
            <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-2 truncate">${telemetry.aqi.detail}</div>
          </div>

          <!-- Card 2: Temperature -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Temperature</span>
              <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <i data-lucide="thermometer" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${telemetry.temperature.value}</span>
              <span class="text-xs font-bold text-slate-400">${telemetry.temperature.unit}</span>
              <span class="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                ${telemetry.temperature.status}
              </span>
            </div>
            <div class="flex items-center space-x-1.5 mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
              <span>${telemetry.temperature.comparison}</span>
            </div>
            <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-2 truncate">${telemetry.temperature.detail}</div>
          </div>

          <!-- Card 3: Humidity -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Humidity</span>
              <div class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <i data-lucide="droplets" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">${telemetry.humidity.value}</span>
              <span class="text-xs font-bold text-slate-400">${telemetry.humidity.unit}</span>
              <span class="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                ${telemetry.humidity.status}
              </span>
            </div>
            <div class="flex items-center space-x-1.5 mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <i data-lucide="arrow-down-right" class="w-3.5 h-3.5"></i>
              <span>${telemetry.humidity.comparison}</span>
            </div>
            <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-2 truncate">${telemetry.humidity.detail}</div>
          </div>

          <!-- Card 4: Environmental Status Metric -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Composite Health</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <i data-lucide="activity" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="flex items-baseline space-x-2">
              <span class="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">94.2</span>
              <span class="text-xs font-bold text-slate-400">/ 100</span>
              <span class="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Stable
              </span>
            </div>
            <div class="flex items-center space-x-1.5 mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
              <span>All 12 sectors within safety band</span>
            </div>
            <div class="text-[11px] text-slate-400 dark:text-slate-400 mt-2 truncate">Zero hazardous breaches in 48h</div>
          </div>
        </div>

        <!-- Section: Charts Header with Time Filter (24H / 7D / 30D / 90D) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Environmental Trends & Sensor Telemetry</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">High-precision historical trends with interactive hover states</p>
          </div>
          <!-- Time Filter Buttons -->
          <div class="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold self-start sm:self-auto">
            ${["24H", "7D", "30D", "90D"].map((range) => `
              <button 
                onclick="window.appController.changeTimeRange('${range}')"
                class="px-3 py-1 rounded-lg transition-all ${
                  activeTimeRange === range
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }">
                ${range}
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Chart 1: Air Quality Trend -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Air Quality Trend (AQI & PM2.5)</h4>
                <p class="text-[11px] text-slate-400">Continuous 15-minute particulate sampling</p>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Avg 42 AQI
              </span>
            </div>
            <div class="relative h-64 w-full">
              <canvas id="airQualityChart"></canvas>
            </div>
          </div>

          <!-- Chart 2: Temperature & Humidity Trend -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Temperature & Humidity Correlation</h4>
                <p class="text-[11px] text-slate-400">Dual-axis ambient surface microclimate</p>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Peak 31°C
              </span>
            </div>
            <div class="relative h-64 w-full">
              <canvas id="tempHumidityChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Environmental Alerts Section -->
        <div class="sustivision-card p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <i data-lucide="alert-triangle" class="w-4 h-4"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Environmental Alerts & Warnings</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Real-time localized hazards, categorized by severity</p>
              </div>
            </div>
            <button 
              onclick="window.appState.navigateTo('notifications')"
              class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1">
              <span>View All Alerts (${this.data.alerts.length})</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            ${this.data.alerts.slice(0, 4).map((alert) => {
              const severityBadge = {
                critical: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-900",
                warning: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-900",
                advisory: "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-900",
                info: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
              }[alert.severity] || "bg-slate-100 text-slate-800";

              return `
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 transition-all flex flex-col justify-between space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${severityBadge}">
                      ${alert.severity}
                    </span>
                    <span class="text-[11px] text-slate-400">${alert.timestamp}</span>
                  </div>
                  <div>
                    <h5 class="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-snug">${alert.title}</h5>
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">${alert.description}</p>
                  </div>
                  <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span class="text-[11px] text-slate-400 truncate max-w-[200px]">${alert.location}</span>
                    <button 
                      onclick="window.appController.openAlertModal('${alert.id}')"
                      class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center space-x-1">
                      <span>Mitigate</span>
                      <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: 2. AI SUSTAINABILITY ASSISTANT
   * ========================================================================= */
  renderAssistantView() {
    const activeConv = this.state.state.conversations.find(
      (c) => c.id === this.state.state.activeConversationId
    ) || this.state.state.conversations[0];

    return `
      <div class="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
        <!-- Left: Conversation History & Threads (Hidden on small mobile unless toggled) -->
        <div class="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex-shrink-0">
          <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Conversations</h3>
            <button 
              onclick="window.appController.startNewAiChat()"
              class="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
              title="New Chat">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="p-3">
            <div class="relative">
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                placeholder="Search queries..."
                class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            ${this.state.state.conversations.map((c) => `
              <button 
                onclick="window.appController.switchConversation('${c.id}')"
                class="w-full text-left p-2.5 rounded-xl text-xs transition-colors ${
                  c.id === activeConv.id
                    ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }">
                <div class="flex items-center space-x-2">
                  <i data-lucide="message-square" class="w-3.5 h-3.5 ${c.id === activeConv.id ? "text-emerald-600" : "text-slate-400"}"></i>
                  <span class="truncate flex-1">${c.title}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-1 pl-5">${c.updatedAt}</div>
              </button>
            `).join("")}
          </div>

          <!-- Bottom Knowledge Base Status -->
          <div class="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
            <div class="flex items-center space-x-1.5">
              <span class="live-indicator"></span>
              <span class="font-medium text-slate-700 dark:text-slate-300">OpenAI Environmental Agent</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">Trained on ISO 14001, EPA & IPCC Data</div>
          </div>
        </div>

        <!-- Center: Main Chat Interface -->
        <div class="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-w-0">
          <!-- Chat Header -->
          <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate">SustiVision AI Intelligence Assistant</h3>
                <p class="text-[11px] text-slate-400 truncate">Synthesizing live sensor clusters & predictive risk envelopes</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                onclick="window.appController.clearCurrentChat()"
                class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
                title="Clear Chat">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Chat Scrollable Message Stream -->
          <div id="chat-messages-container" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <!-- Messages rendered dynamically -->
          </div>

          <!-- Suggested Prompt Chips (Always accessible above input) -->
          <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40">
            <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span class="text-[11px] text-slate-400 whitespace-nowrap font-semibold mr-1">Suggested:</span>
              ${this.data.aiKnowledgeBase.suggestedPrompts.map((prompt) => `
                <button 
                  onclick="window.appController.triggerSuggestedPrompt('${prompt.replace(/'/g, "\\'")}')"
                  class="whitespace-nowrap px-3 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors shadow-2xs font-medium text-[11px]">
                  ${prompt}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Chat Input Bar -->
          <div class="p-3 md:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form id="ai-chat-form" onsubmit="window.appController.handleChatSubmit(event)" class="flex items-center space-x-2">
              <div class="relative flex-1">
                <input 
                  id="ai-chat-input"
                  type="text" 
                  autocomplete="off"
                  placeholder="Ask SustiVision AI anything regarding environmental risks, air quality, floods, or ESG..." 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all pr-10"
                />
              </div>
              <button 
                type="submit"
                id="ai-send-btn"
                class="px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-md shadow-emerald-800/20 transition-all flex items-center space-x-1.5 flex-shrink-0">
                <span>Send</span>
                <i data-lucide="send" class="w-4 h-4"></i>
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Environmental Context & Insight Panel -->
        <div class="hidden xl:flex flex-col w-80 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 space-y-5 overflow-y-auto flex-shrink-0">
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Environmental Context</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">Live sensor context for this AI conversation</p>
          </div>

          <!-- Active Node Card -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>San Francisco Bay EcoHub</span>
              <span class="live-indicator"></span>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div class="p-2 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] text-slate-400">AQI</span>
                <div class="font-bold text-emerald-600 dark:text-emerald-400">42 Good</div>
              </div>
              <div class="p-2 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] text-slate-400">Surface Temp</span>
                <div class="font-bold text-slate-800 dark:text-slate-200">28°C</div>
              </div>
              <div class="p-2 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] text-slate-400">Soil Moisture</span>
                <div class="font-bold text-slate-800 dark:text-slate-200">34%</div>
              </div>
              <div class="p-2 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] text-slate-400">Flood Probability</span>
                <div class="font-bold text-emerald-600 dark:text-emerald-400">18% Low</div>
              </div>
            </div>
          </div>

          <!-- Proactive Intelligence Callout -->
          <div class="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
            <div class="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <i data-lucide="zap" class="w-3.5 h-3.5"></i>
              <span>Proactive AI Suggestion</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ground-level ozone is expected to peak between 13:00 and 15:30. Recommend pre-cooling civic complexes before 11:30.
            </p>
          </div>

          <!-- Telemetry Verification -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">System Telemetry Integrity</span>
            <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div class="flex justify-between">
                <span>Sensor Transmission:</span>
                <span class="font-semibold text-emerald-600">100% OK</span>
              </div>
              <div class="flex justify-between">
                <span>Anomaly Threshold:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-200">&lt; 0.02σ (Normal)</span>
              </div>
              <div class="flex justify-between">
                <span>IPCC Baseline Sync:</span>
                <span class="font-semibold text-emerald-600">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderChatMessages() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    const activeConv = this.state.state.conversations.find(
      (c) => c.id === this.state.state.activeConversationId
    ) || this.state.state.conversations[0];

    const messages = activeConv.messages || [];

    let html = "";

    // Welcome State if few or zero messages
    if (messages.length <= 1) {
      html += `
        <div class="text-center py-6 px-4 max-w-xl mx-auto space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <i data-lucide="sparkles" class="w-7 h-7"></i>
          </div>
          <h2 class="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
            Ask SustiVision AI
          </h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Understand environmental conditions, risks, and sustainability trends with verified real-time telemetry.
          </p>
        </div>
      `;
    }

    // Render message stream
    messages.forEach((msg) => {
      if (msg.sender === "user") {
        html += `
          <div class="flex justify-end">
            <div class="max-w-[85%] md:max-w-[70%] bg-emerald-800 text-white p-3.5 md:p-4 rounded-2xl rounded-tr-xs shadow-sm space-y-1">
              <p class="text-xs md:text-sm leading-relaxed">${this.escapeHtml(msg.text)}</p>
              <div class="text-[10px] text-emerald-200 text-right">${msg.timestamp}</div>
            </div>
          </div>
        `;
      } else {
        // Structured AI Message
        html += `
          <div class="flex items-start space-x-3 max-w-[95%] md:max-w-[85%]">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-700 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-tl-xs p-4 md:p-5 shadow-sm space-y-3">
              <!-- AI Header with Confidence Score -->
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>SustiVision Intelligence</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">Verified</span>
                </span>
                <div class="flex items-center space-x-1 text-xs">
                  <span class="text-[11px] text-slate-400">Confidence:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">${msg.confidence || 87}%</span>
                </div>
              </div>

              <!-- Analysis Block -->
              <div>
                <h5 class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Analysis</h5>
                <p class="text-xs md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">${msg.analysis}</p>
              </div>

              <!-- Recommendation Block -->
              <div class="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <h5 class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center space-x-1">
                  <i data-lucide="check-circle" class="w-3 h-3 text-emerald-600"></i>
                  <span>Recommended Action</span>
                </h5>
                <p class="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${msg.recommendation}</p>
              </div>

              <!-- Relevant Metrics Pills -->
              ${msg.relevantMetrics && msg.relevantMetrics.length > 0 ? `
                <div>
                  <h5 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Relevant Environmental Telemetry</h5>
                  <div class="flex flex-wrap gap-1.5">
                    ${msg.relevantMetrics.map((met) => `
                      <span class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                        <span class="text-slate-400">${met.label}:</span>
                        <span class="font-bold">${met.value}</span>
                        <span class="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 font-semibold">${met.badge}</span>
                      </span>
                    `).join("")}
                  </div>
                </div>
              ` : ""}

              <!-- AI Actions Footer: Copy, Regenerate, Thumbs Feedback -->
              <div class="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <span class="text-[10px]">${msg.timestamp}</span>
                <div class="flex items-center space-x-1">
                  <button 
                    onclick="window.appController.copyMessageText('${msg.id}')"
                    class="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Copy Analysis">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                  <button 
                    onclick="window.appController.regenerateAiMessage()"
                    class="p-1.5 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Regenerate Response">
                    <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                  </button>
                  <button 
                    onclick="window.appController.rateFeedback('up')"
                    class="p-1.5 hover:text-emerald-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Helpful">
                    <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
                  </button>
                  <button 
                    onclick="window.appController.rateFeedback('down')"
                    class="p-1.5 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Not Helpful">
                    <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }
    });

    // If AI is typing / thinking, render typing indicator
    if (this.state.state.isAiTyping) {
      html += `
        <div class="flex items-start space-x-3">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-700 text-white flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
          </div>
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="ml-2 font-medium">Analyzing environmental telemetry & synthesizing recommendation...</span>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* =========================================================================
   * VIEW: 3. RISK PREDICTIONS
   * ========================================================================= */
  renderPredictionsView() {
    const { activeRiskTimeframe } = this.state.state;
    const predictions = this.data.riskPredictions;

    return `
      <div class="space-y-6">
        <!-- Header & Proactive Risk Overview -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Proactive Risk Predictions</h2>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Machine Learning Forecasting
              </span>
            </div>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-variable environmental risk forecasts to help organizations prevent hazards before they escalate.
            </p>
          </div>

          <!-- Forecast Model Timeframe Filter -->
          <div class="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold self-start md:self-auto">
            ${["7D", "14D", "30D", "90D"].map((tf) => `
              <button 
                onclick="window.appController.changeRiskTimeframe('${tf}')"
                class="px-3 py-1.5 rounded-lg transition-all ${
                  activeRiskTimeframe === tf
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }">
                ${tf} Horizon
              </button>
            `).join("")}
          </div>
        </div>

        <!-- 3 Primary Required Cards: Flood Risk, Climate Risk, Weather Risk + Additional Vulnerabilities -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${predictions.map((risk) => {
            const riskColors = {
              LOW: {
                badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                bar: "bg-emerald-500",
                icon: "shield-check"
              },
              MODERATE: {
                badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                bar: "bg-amber-500",
                icon: "alert-circle"
              },
              HIGH: {
                badge: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 dark:border-orange-800",
                bar: "bg-orange-500",
                icon: "alert-triangle"
              },
              CRITICAL: {
                badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
                bar: "bg-rose-500",
                icon: "flame"
              }
            }[risk.level] || { badge: "bg-slate-100 text-slate-800", bar: "bg-slate-500", icon: "help-circle" };

            return `
              <div class="sustivision-card p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <!-- Top Row: Title, Level Badge & Probability -->
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${risk.timeframe}</span>
                      <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-0.5">${risk.title}</h3>
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="px-2.5 py-0.5 text-xs font-black uppercase rounded-lg border ${riskColors.badge}">
                        ${risk.level}
                      </span>
                      <span class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">${risk.probability}% probability</span>
                    </div>
                  </div>

                  <!-- Probability Meter Bar -->
                  <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                    <div class="${riskColors.bar} h-full rounded-full transition-all duration-500" style="width: ${risk.probability}%"></div>
                  </div>

                  <!-- Trend Indicator -->
                  <div class="flex items-center space-x-1.5 mt-2 text-xs font-semibold ${risk.trendDirection === "improving" ? "text-emerald-600 dark:text-emerald-400" : risk.trendDirection === "worsening" ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}">
                    <i data-lucide="${risk.trendDirection === "improving" ? "trending-down" : risk.trendDirection === "worsening" ? "trending-up" : "minus"}" class="w-3.5 h-3.5"></i>
                    <span>Trend: ${risk.trend}</span>
                  </div>

                  <!-- Description -->
                  <p class="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    ${risk.description}
                  </p>

                  <!-- Contributing Factors Breakdown -->
                  <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Contributing Factors</span>
                    <div class="space-y-1.5 mt-2">
                      ${risk.factors.map((f) => `
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">• ${f.name}</span>
                          <span class="font-semibold text-slate-900 dark:text-white">${f.value}</span>
                        </div>
                      `).join("")}
                    </div>
                  </div>
                </div>

                <!-- Recommended Action Box -->
                <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 mb-1">
                      <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
                      <span>Recommended Action</span>
                    </div>
                    <p class="text-slate-600 dark:text-slate-300 leading-snug">${risk.recommendation}</p>
                  </div>
                  
                  <div class="flex items-center justify-between mt-3 pt-1">
                    <button 
                      onclick="window.appController.openRiskDeepDiveModal('${risk.id}')"
                      class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1">
                      <span>Detailed Simulation</span>
                      <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </button>
                    <button 
                      onclick="window.appController.consultAiOnRisk('${risk.title}')"
                      class="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100">
                      Ask AI
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: 4. ANALYTICS
   * ========================================================================= */
  renderAnalyticsView() {
    return `
      <div class="space-y-6">
        <!-- Analytics Header & Filter Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Environmental Analytics & Multi-Variable Correlation</h2>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cross-sensor time series, emission breakdowns, and long-term regulatory compliance tracking.
            </p>
          </div>

          <!-- Controls: Location Filter, Date Range Picker, Metric Dropdown -->
          <div class="flex flex-wrap items-center gap-2">
            <select 
              id="analytics-location-select" 
              onchange="window.appController.handleAnalyticsFilterChange()"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
              ${this.data.locations.map((loc) => `<option value="${loc.id}">${loc.name}</option>`).join("")}
            </select>
            <select 
              id="analytics-range-select"
              onchange="window.appController.handleAnalyticsFilterChange()"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="YTD">Year to Date (2026)</option>
              <option value="1Y">Full Year Baseline</option>
            </select>
            <button 
              onclick="window.appController.exportAnalyticsCsv()"
              class="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <!-- Performance Metrics Row -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average AQI</span>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">38.4</div>
            <div class="text-[11px] font-semibold text-emerald-600 mt-1">↓ 6.2% vs baseline</div>
          </div>
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Temperature</span>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">22.6°C</div>
            <div class="text-[11px] font-semibold text-amber-600 mt-1">↑ 0.8°C anomaly</div>
          </div>
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Humidity</span>
            <div class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">58.2%</div>
            <div class="text-[11px] font-semibold text-emerald-600 mt-1">Optimal moisture</div>
          </div>
          <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Mitigation Trend</span>
            <div class="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">-14%</div>
            <div class="text-[11px] font-semibold text-emerald-600 mt-1">MoM vulnerability drop</div>
          </div>
          <div class="col-span-2 md:col-span-1 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Compliance</span>
            <div class="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">94.2%</div>
            <div class="text-[11px] font-semibold text-emerald-600 mt-1">Days in "GOOD" rating</div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Chart 1: Air Quality Pollutant Breakdown vs Threshold -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Pollutant Speciation vs Regulatory Ceiling</h4>
                <p class="text-[11px] text-slate-400">Observed pollutants compared against WHO safe limits</p>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                100% Compliant
              </span>
            </div>
            <div class="relative h-72 w-full">
              <canvas id="pollutantBreakdownChart"></canvas>
            </div>
          </div>

          <!-- Chart 2: Climate Multi-Year Comparison -->
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Annual Climate Baseline vs 2026 Observed</h4>
                <p class="text-[11px] text-slate-400">Monthly mean temperature deviation against 10-year average</p>
              </div>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                +0.8°C Variance
              </span>
            </div>
            <div class="relative h-72 w-full">
              <canvas id="climateTrendsChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Environmental Telemetry Data Table -->
        <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">Telemetry Log by Monitoring Sector</h4>
              <p class="text-xs text-slate-400">Continuous 60-second telemetry feed across regional sensor clusters</p>
            </div>
            <div class="relative">
              <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                id="analytics-table-search"
                type="text" 
                placeholder="Filter sectors..." 
                onkeyup="window.appController.filterAnalyticsTable(this.value)"
                class="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th class="py-2.5 px-3">Sector / Node ID</th>
                  <th class="py-2.5 px-3">Zone Type</th>
                  <th class="py-2.5 px-3">AQI</th>
                  <th class="py-2.5 px-3">Temp</th>
                  <th class="py-2.5 px-3">Humidity</th>
                  <th class="py-2.5 px-3">CO₂ Level</th>
                  <th class="py-2.5 px-3">Status</th>
                  <th class="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody id="analytics-table-body" class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">Zone 01 - Marina Hub</td>
                  <td class="py-3 px-3 text-slate-500">Coastal / Estuary</td>
                  <td class="py-3 px-3 font-bold text-emerald-600">36 AQI</td>
                  <td class="py-3 px-3">22.4°C</td>
                  <td class="py-3 px-3">72%</td>
                  <td class="py-3 px-3">408 ppm</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">GOOD</span></td>
                  <td class="py-3 px-3 text-right"><button onclick="window.appController.inspectSector('Zone 01 - Marina Hub')" class="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">Inspect</button></td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">Zone 04 - Central Plaza</td>
                  <td class="py-3 px-3 text-slate-500">High-Density Urban</td>
                  <td class="py-3 px-3 font-bold text-emerald-600">42 AQI</td>
                  <td class="py-3 px-3">28.0°C</td>
                  <td class="py-3 px-3">64%</td>
                  <td class="py-3 px-3">412 ppm</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">GOOD</span></td>
                  <td class="py-3 px-3 text-right"><button onclick="window.appController.inspectSector('Zone 04 - Central Plaza')" class="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">Inspect</button></td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">Zone 07 - South Industrial</td>
                  <td class="py-3 px-3 text-slate-500">Commercial / Freight</td>
                  <td class="py-3 px-3 font-bold text-amber-600">62 AQI</td>
                  <td class="py-3 px-3">29.5°C</td>
                  <td class="py-3 px-3">55%</td>
                  <td class="py-3 px-3">428 ppm</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">MODERATE</span></td>
                  <td class="py-3 px-3 text-right"><button onclick="window.appController.inspectSector('Zone 07 - South Industrial')" class="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">Inspect</button></td>
                </tr>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="py-3 px-3 font-semibold text-slate-900 dark:text-white">Zone 11 - Highland Forest Reserve</td>
                  <td class="py-3 px-3 text-slate-500">Protected Woodland</td>
                  <td class="py-3 px-3 font-bold text-emerald-600">18 AQI</td>
                  <td class="py-3 px-3">19.2°C</td>
                  <td class="py-3 px-3">78%</td>
                  <td class="py-3 px-3">398 ppm</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">PRISTINE</span></td>
                  <td class="py-3 px-3 text-right"><button onclick="window.appController.inspectSector('Zone 11 - Highland Forest Reserve')" class="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">Inspect</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: 5. REPORTS
   * ========================================================================= */
  renderReportsView() {
    const { reportFilter, reportSearchQuery } = this.state.state;
    const reports = this.data.reports;

    return `
      <div class="space-y-6">
        <!-- Reports Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Environmental Intelligence Reports</h2>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated synthesis and executive audits categorized by Daily, Weekly, and Monthly cadences.
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <button 
              onclick="window.appController.openGenerateReportModal()"
              class="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Generate AI Report</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <!-- Category Tabs (Daily, Weekly, Monthly) -->
          <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            ${[
              { id: "all", label: "All Reports" },
              { id: "daily", label: "Daily" },
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" }
            ].map((tab) => `
              <button 
                onclick="window.appController.changeReportFilter('${tab.id}')"
                class="px-3.5 py-1.5 rounded-lg transition-all ${
                  reportFilter === tab.id
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }">
                ${tab.label}
              </button>
            `).join("")}
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-72">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
            <input 
              type="text" 
              placeholder="Search reports by title or keyword..."
              value="${reportSearchQuery}"
              onkeyup="window.appController.handleReportSearch(this.value)"
              class="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <!-- Reports List Container -->
        <div id="reports-list-container" class="space-y-4">
          ${this.renderReportsListHtml()}
        </div>
      </div>
    `;
  }

  renderReportsListHtml() {
    const { reportFilter, reportSearchQuery } = this.state.state;
    let list = this.data.reports;

    if (reportFilter !== "all") {
      list = list.filter((r) => r.category.toLowerCase() === reportFilter.toLowerCase());
    }

    if (reportSearchQuery && reportSearchQuery.trim()) {
      const q = reportSearchQuery.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      return `
        <div class="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <i data-lucide="file-x" class="w-6 h-6"></i>
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">No reports match your filters</h4>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">Try clearing your search query or selecting a different category tab.</p>
          <button onclick="window.appController.changeReportFilter('all')" class="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Reset Filters
          </button>
        </div>
      `;
    }

    return list.map((rep) => `
      <div class="sustivision-card p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ${rep.type}
              </span>
              <span class="text-xs text-slate-400">${rep.date} · Author: ${rep.author}</span>
            </div>
            <h3 class="text-base md:text-lg font-bold text-slate-900 dark:text-white mt-1">${rep.title}</h3>
          </div>

          <div class="flex items-center space-x-2 flex-shrink-0">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ${rep.envStatus}
            </span>
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Risk Score: ${rep.riskScore}
            </span>
          </div>
        </div>

        <p class="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          ${rep.summary}
        </p>

        <!-- Key Findings -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Environmental Findings</span>
          <ul class="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
            ${rep.keyFindings.map((kf) => `
              <li class="flex items-start space-x-2">
                <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5"></i>
                <span>${kf}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="text-xs text-slate-400">
            <span class="font-medium text-slate-600 dark:text-slate-300">${rep.downloads.format}</span> · ${rep.downloads.pdfSize}
          </div>
          <div class="flex items-center space-x-2">
            <button 
              onclick="window.appController.openReportModal('${rep.id}')"
              class="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>View Full Report</span>
            </button>
            <button 
              onclick="window.appController.downloadReport('${rep.id}', 'pdf')"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center space-x-1">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>PDF</span>
            </button>
            <button 
              onclick="window.appController.downloadReport('${rep.id}', 'csv')"
              class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center space-x-1">
              <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i>
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  renderReportsList() {
    const container = document.getElementById("reports-list-container");
    if (container) {
      container.innerHTML = this.renderReportsListHtml();
      if (window.lucide) window.lucide.createIcons();
    }
  }

  /* =========================================================================
   * VIEW: 6. NOTIFICATIONS CENTER
   * ========================================================================= */
  renderNotificationsView() {
    const { notifications, notificationFilter } = this.state.state;

    let filtered = notifications;
    if (notificationFilter !== "all") {
      filtered = filtered.filter((n) => n.severity === notificationFilter);
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Notification & Alert Center</h2>
              ${unreadCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">${unreadCount} Unread</span>` : ""}
            </div>
            <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated notifications for air quality warnings, high pollution, flood alerts, and heat warnings.
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <button 
              onclick="window.appState.markAllNotificationsAsRead()"
              class="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50">
              Mark all as read
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          ${[
            { id: "all", label: "All Alerts" },
            { id: "critical", label: "Critical" },
            { id: "warning", label: "Warnings" },
            { id: "advisory", label: "Advisories" },
            { id: "info", label: "System Info" }
          ].map((f) => `
            <button 
              onclick="window.appController.filterNotifications('${f.id}')"
              class="px-3 py-1.5 rounded-xl transition-all ${
                notificationFilter === f.id
                  ? "bg-emerald-800 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }">
              ${f.label}
            </button>
          `).join("")}
        </div>

        <!-- Notification Feed -->
        <div class="space-y-3">
          ${filtered.length === 0 ? `
            <div class="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <i data-lucide="bell-off" class="w-6 h-6"></i>
              </div>
              <h4 class="text-base font-bold text-slate-900 dark:text-white">Zero Active Alerts</h4>
              <p class="text-xs text-slate-400">All environmental parameters in this category are operating within safe baseline ranges.</p>
            </div>
          ` : filtered.map((item) => {
            const severityStyle = {
              critical: { bg: "border-l-4 border-l-rose-500", badge: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300", icon: "alert-triangle", iconColor: "text-rose-600" },
              warning: { bg: "border-l-4 border-l-amber-500", badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", icon: "alert-circle", iconColor: "text-amber-600" },
              advisory: { bg: "border-l-4 border-l-sky-500", badge: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300", icon: "info", iconColor: "text-sky-600" },
              info: { bg: "border-l-4 border-l-emerald-500", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", icon: "check-circle", iconColor: "text-emerald-600" }
            }[item.severity] || { bg: "", badge: "bg-slate-100 text-slate-800", icon: "bell", iconColor: "text-slate-400" };

            return `
              <div class="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${severityStyle.bg} flex items-start justify-between gap-4 transition-all ${item.read ? "opacity-75" : ""}">
                <div class="flex items-start space-x-3.5">
                  <div class="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 ${severityStyle.iconColor}">
                    <i data-lucide="${severityStyle.icon}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-0.2 text-[10px] font-extrabold uppercase rounded ${severityStyle.badge}">
                        ${item.severity}
                      </span>
                      <span class="text-xs font-semibold text-slate-400">· ${item.category}</span>
                      ${!item.read ? `<span class="w-2 h-2 rounded-full bg-emerald-600"></span>` : ""}
                    </div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-1">${item.title}</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${item.description}</p>
                    <div class="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span>${item.timestamp}</span>
                      <span>•</span>
                      <span>${item.location}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5 flex-shrink-0">
                  ${!item.read ? `
                    <button 
                      onclick="window.appState.markNotificationAsRead('${item.id}')"
                      class="p-1.5 text-xs text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Mark as read">
                      <i data-lucide="check" class="w-4 h-4"></i>
                    </button>
                  ` : ""}
                  <button 
                    onclick="window.appState.deleteNotification('${item.id}')"
                    class="p-1.5 text-xs text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Dismiss alert">
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: 7. SETTINGS
   * ========================================================================= */
  renderSettingsView() {
    const { activeSettingsTab, theme } = this.state.state;
    const { settings, user } = this.data;

    const tabs = [
      { id: "profile", label: "Profile Information", icon: "user" },
      { id: "theme", label: "Appearance & Theme", icon: "palette" },
      { id: "notifications", label: "Notification Channels", icon: "bell" },
      { id: "language", label: "Language & Regional", icon: "globe" },
      { id: "security", label: "Security & Authentication", icon: "lock" },
      { id: "privacy", label: "Data Governance & Privacy", icon: "shield" }
    ];

    return `
      <div class="space-y-6">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h2>
          <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account credentials, alert sensitivities, and environmental intelligence preferences.
          </p>
        </div>

        <div class="flex flex-col md:flex-row gap-6">
          <!-- Left Settings Sub-Navigation -->
          <div class="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 shadow-sm flex-shrink-0 self-start space-y-1">
            ${tabs.map((tab) => `
              <button 
                onclick="window.appController.switchSettingsTab('${tab.id}')"
                class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSettingsTab === tab.id
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }">
                <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
                <span>${tab.label}</span>
              </button>
            `).join("")}
          </div>

          <!-- Right Content Panel -->
          <div class="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm">
            ${this.renderSettingsContent(activeSettingsTab)}
          </div>
        </div>
      </div>
    `;
  }

  renderSettingsContent(tab) {
    const { theme } = this.state.state;
    const { settings, user } = this.data;

    switch (tab) {
      case "profile":
        return `
          <div class="space-y-5">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Profile Details</h3>
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 rounded-full bg-emerald-800 text-white font-bold text-lg flex items-center justify-center ring-4 ring-emerald-600/20">
                ${user.initials}
              </div>
              <div>
                <button onclick="window.appState.showToast('Profile image updated successfully', 'success')" class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50">
                  Change Photo
                </button>
                <div class="text-[11px] text-slate-400 mt-1">JPG, GIF or PNG. Max size 2MB</div>
              </div>
            </div>

            <form onsubmit="window.appController.saveProfileSettings(event)" class="space-y-4 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" id="setting-name" value="${user.name}" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" id="setting-email" value="${user.email}" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
                  <input type="text" id="setting-org" value="${user.organization}" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Job Title</label>
                  <input type="text" id="setting-role" value="${user.role}" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200" />
                </div>
              </div>
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button type="submit" class="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-sm">
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        `;

      case "theme":
        return `
          <div class="space-y-5">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Theme & Appearance</h3>
              <p class="text-xs text-slate-400">Choose between light, dark, or system mode according to your operational environment.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              ${[
                { id: "light", label: "Light Theme", desc: "Clean off-white & crisp forest accents", icon: "sun" },
                { id: "dark", label: "Dark Theme", desc: "Deep slate contrast for low-light control rooms", icon: "moon" },
                { id: "system", label: "System Sync", desc: "Automatically match OS preference", icon: "monitor" }
              ].map((t) => `
                <button 
                  onclick="window.appState.setState({ theme: '${t.id}' })"
                  class="p-4 rounded-xl border text-left transition-all ${
                    theme === t.id
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/30"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }">
                  <i data-lucide="${t.icon}" class="w-5 h-5 ${theme === t.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}"></i>
                  <div class="font-bold text-xs text-slate-900 dark:text-white mt-2">${t.label}</div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">${t.desc}</p>
                </button>
              `).join("")}
            </div>
          </div>
        `;

      case "notifications":
        return `
          <div class="space-y-5">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              <p class="text-xs text-slate-400">Configure alert thresholds and escalation channels.</p>
            </div>

            <div class="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
              ${[
                { id: "environmentalAlerts", title: "Environmental Alerts", desc: "Receive immediate dispatch when ambient indices exceed safety bands" },
                { id: "pollutionAlerts", title: "High Pollution & Smog Alerts", desc: "Instant warning for fine PM2.5 and PM10 spike events" },
                { id: "floodWarnings", title: "Flood Risk & Catchment Inflow Warnings", desc: "Alerts when watershed runoff reaches 70% retention" },
                { id: "heatWarnings", title: "Extreme Heat & UV Warnings", desc: "Forecast notifications for urban heat island thermal peaks" },
                { id: "emailDigest", title: "Email Executive Digest", desc: "Receive a compiled weekly environmental PDF report every Monday" }
              ].map((item) => `
                <div class="pt-3 flex items-center justify-between">
                  <div>
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white">${item.title}</h5>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">${item.desc}</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked class="sr-only peer" onchange="window.appState.showToast('Notification preference updated', 'success')">
                    <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>
              `).join("")}
            </div>
          </div>
        `;

      case "language":
        return `
          <div class="space-y-5">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Language & Regional Standards</h3>
              <p class="text-xs text-slate-400">Select language and environmental regulatory baseline standard.</p>
            </div>
            <div class="space-y-4 max-w-md pt-2">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Language</label>
                <select class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                  <option value="en">English (US / Global)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="ja">日本語 (Japanese)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Regulatory Baseline Standard</label>
                <select class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
                  <option>WHO Global Air Quality Guidelines (2021)</option>
                  <option>US EPA Clean Air Act Standards (NAAQS)</option>
                  <option>EU Ambient Air Quality Directive (2024/CSRD)</option>
                </select>
              </div>
            </div>
          </div>
        `;

      case "security":
        return `
          <div class="space-y-5">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Security & Multi-Factor Authentication</h3>
              <p class="text-xs text-slate-400">Manage account access, change passwords, and review active sessions.</p>
            </div>
            <form onsubmit="window.appController.changePassword(event)" class="space-y-3 max-w-md pt-2">
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                <input type="password" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input type="password" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" />
              </div>
              <button type="submit" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold">
                Update Password
              </button>
            </form>
          </div>
        `;

      case "privacy":
        return `
          <div class="space-y-5">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Data Governance & Telemetry Privacy</h3>
              <p class="text-xs text-slate-400">Your organization’s telemetry ownership and compliance settings.</p>
            </div>
            <div class="space-y-3 pt-2">
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-2">
                <span class="font-bold text-slate-800 dark:text-slate-200">Export Organization Telemetry Archive</span>
                <p class="text-slate-500">Download a full cryptographic snapshot of all raw sensor logs, reports, and AI dialogues.</p>
                <button onclick="window.appState.showToast('Telemetry archive export generated (34.2 MB)', 'success')" class="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold">
                  Download Archive (.zip)
                </button>
              </div>
            </div>
          </div>
        `;
    }
  }

  /* =========================================================================
   * VIEW: 8. PROFILE
   * ========================================================================= */
  renderProfileView() {
    const { user } = this.data;

    return `
      <div class="space-y-6 max-w-4xl">
        <!-- Header Banner -->
        <div class="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div class="w-20 h-20 rounded-full bg-white text-emerald-900 font-extrabold text-2xl flex items-center justify-center ring-4 ring-emerald-500/30">
            ${user.initials}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-bold">${user.name}</h2>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">Verified Officer</span>
            </div>
            <p class="text-xs text-emerald-100/90 mt-1">${user.role} · ${user.organization}</p>
            <p class="text-[11px] text-slate-300 mt-1">${user.location} · Member since ${user.joinedDate}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Account Credentials</h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Email:</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${user.email}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Phone:</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${user.phone}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Access Tier:</span>
                <span class="font-semibold text-emerald-600">${user.securityLevel}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Last Authentication:</span>
                <span class="font-semibold text-slate-800 dark:text-slate-200">${user.lastLogin}</span>
              </div>
            </div>
          </div>

          <div class="sustivision-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Responsibility</h4>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Sensor Hubs Supervised:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${user.activeNodesManaged} Regional Hubs</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Audit Actions Logged:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${user.auditLogCount} Events</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span class="text-slate-400">Security Clearance:</span>
                <span class="font-bold text-emerald-600">2FA Enforced</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Reports Published:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">32 Briefings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: PUBLIC LANDING PAGE (Requirement 26)
   * ========================================================================= */
  renderLandingPage() {
    return `
      <div class="min-h-screen bg-slate-50 dark:bg-[#090e17] text-slate-900 dark:text-white flex flex-col">
        <!-- Landing Header -->
        <header class="h-20 px-6 md:px-12 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#090e17]/90 backdrop-blur-md z-40">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-white shadow-md">
              <i data-lucide="leaf" class="w-5 h-5 text-emerald-300"></i>
            </div>
            <div>
              <span class="font-extrabold text-xl tracking-tight">SustiVision AI</span>
              <span class="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                SaaS Platform
              </span>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button 
              onclick="window.appState.navigateTo('dashboard')"
              class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors">
              Explore Live Demo
            </button>
            <button 
              onclick="window.appController.openLoginModal()"
              class="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-md shadow-emerald-800/20 transition-all">
              Sign In
            </button>
          </div>
        </header>

        <!-- Hero Section -->
        <section class="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24 max-w-5xl mx-auto space-y-6">
          <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-xs font-bold">
            <span class="live-indicator"></span>
            <span>Enterprise Sustainability Intelligence · ISO 14001 Compliant</span>
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            AI-Powered Environmental <br class="hidden sm:inline"/>
            <span class="text-emerald-700 dark:text-emerald-400">Intelligence Platform</span>
          </h1>

          <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Monitor environmental conditions, understand sustainability trends, and make smarter decisions with AI-powered insights.
          </p>

          <!-- Core Value Motto -->
          <div class="italic text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
            “We plan to see a greener tomorrow.”
          </div>

          <!-- CTAs -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button 
              onclick="window.appState.navigateTo('dashboard')"
              class="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2">
              <span>Get Started</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
            <button 
              onclick="window.appState.navigateTo('dashboard')"
              class="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2">
              <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
              <span>Explore Dashboard</span>
            </button>
          </div>

          <!-- Interactive Dashboard Preview Card -->
          <div class="w-full pt-10">
            <div class="p-3 md:p-5 rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/80 dark:border-slate-700 shadow-2xl overflow-hidden cursor-pointer" onclick="window.appState.navigateTo('dashboard')">
              <div class="rounded-2xl bg-white dark:bg-slate-900 p-4 md:p-6 text-left border border-slate-200 dark:border-slate-800 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div class="flex items-center space-x-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-bold text-slate-400 ml-2">sustivision.ai / intelligence-hub</span>
                  </div>
                  <span class="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <span class="live-indicator mr-1"></span> 1,428 Active Nodes
                  </span>
                </div>
                <!-- Mini Preview Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <span class="text-slate-400">AQI</span>
                    <div class="text-xl font-extrabold text-emerald-600">42 Good</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <span class="text-slate-400">Temperature</span>
                    <div class="text-xl font-extrabold text-slate-800 dark:text-slate-200">28°C</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <span class="text-slate-400">Humidity</span>
                    <div class="text-xl font-extrabold text-slate-800 dark:text-slate-200">64%</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                    <span class="text-slate-400">Flood Hazard</span>
                    <div class="text-xl font-extrabold text-emerald-600">18% Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trust Badges -->
          <div class="pt-8 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Trusted by Governments, NGOs, Research Institutions & Global ESG Leaders
          </div>
        </section>
      </div>
    `;
  }

  /* =========================================================================
   * VIEW: AUTHENTICATION (Login / Sign Up / Forgot Password)
   * ========================================================================= */
  renderAuthPage(mode) {
    const isSignup = mode === "signup";

    return `
      <div class="min-h-screen bg-slate-50 dark:bg-[#090e17] flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <!-- Logo & Brand Header -->
          <div class="text-center space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-white mx-auto shadow-md">
              <i data-lucide="leaf" class="w-6 h-6 text-emerald-300"></i>
            </div>
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${isSignup ? "Create SustiVision Account" : "Sign In to SustiVision AI"}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${isSignup ? "Access proactive environmental intelligence & automated reporting." : "We plan to see a greener tomorrow."}
            </p>
          </div>

          <!-- One-click Demo Credentials Helper Chip -->
          <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
            <span class="text-emerald-900 dark:text-emerald-200 font-medium">Quick Evaluator Access</span>
            <button 
              type="button" 
              onclick="window.appController.quickLoginDemo()"
              class="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-bold hover:bg-emerald-900 text-[11px]">
              Demo Login
            </button>
          </div>

          <!-- OAuth Social Buttons (Google / Apple) -->
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onclick="window.appController.quickLoginDemo()"
              class="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
              <i data-lucide="chrome" class="w-4 h-4 text-emerald-600"></i>
              <span>Google</span>
            </button>
            <button 
              type="button"
              onclick="window.appController.quickLoginDemo()"
              class="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
              <i data-lucide="apple" class="w-4 h-4"></i>
              <span>Apple</span>
            </button>
          </div>

          <div class="flex items-center space-x-3 text-xs text-slate-400">
            <div class="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            <span>or with email</span>
            <div class="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <!-- Form -->
          <form onsubmit="window.appController.handleAuthForm(event, '${mode}')" class="space-y-4">
            ${isSignup ? `
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" id="auth-name" required placeholder="e.g. Dr. Elena Vance" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
            ` : ""}
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input type="email" id="auth-email" required value="elena.vance@sustivision.ai" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                ${!isSignup ? `
                  <button type="button" onclick="window.appController.openForgotPasswordModal()" class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                    Forgot password?
                  </button>
                ` : ""}
              </div>
              <input type="password" id="auth-password" required value="••••••••••••" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-600" />
            </div>

            <button 
              type="submit" 
              class="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md shadow-emerald-800/20 transition-all">
              ${isSignup ? "Create Enterprise Account" : "Sign In to Dashboard"}
            </button>
          </form>

          <!-- Toggle link -->
          <div class="text-center text-xs text-slate-500">
            ${isSignup ? `
              <span>Already registered? </span>
              <button onclick="window.appState.navigateTo('login')" class="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">Sign In</button>
            ` : `
              <span>Need an organization account? </span>
              <button onclick="window.appState.navigateTo('signup')" class="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">Sign Up</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
   * COMPONENT: GLOBAL ACTIVE MODALS
   * ========================================================================= */
  renderActiveModals() {
    const { viewingReport, selectedRiskItem, authModalMode } = this.state.state;
    let html = "";

    // Report Detail Modal
    if (viewingReport) {
      const rep = viewingReport;
      html += `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="window.appController.closeModal()"></div>
          <div class="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto z-10 space-y-5">
            <div class="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${rep.type} Report</span>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1">${rep.title}</h3>
                <p class="text-xs text-slate-400 mt-0.5">Published on ${rep.date} · Verified by ${rep.author}</p>
              </div>
              <button onclick="window.appController.closeModal()" class="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Executive Summary</h4>
                <p class="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${rep.summary}</p>
              </div>

              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Audited Key Findings</h4>
                <ul class="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  ${rep.keyFindings.map((f) => `
                    <li class="flex items-start space-x-2">
                      <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"></i>
                      <span>${f}</span>
                    </li>
                  `).join("")}
                </ul>
              </div>

              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Risk & Compliance Assessment</h4>
                <p class="text-xs text-slate-600 dark:text-slate-300">${rep.riskOverview}</p>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="text-xs text-slate-400">${rep.downloads.format} · Complete Dataset</span>
              <div class="flex items-center space-x-2">
                <button onclick="window.print()" class="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">Print Brief</button>
                <button onclick="window.appController.downloadReport('${rep.id}', 'pdf')" class="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold shadow-sm">Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Forgot Password Modal
    if (authModalMode === "forgot") {
      html += `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="window.appController.closeModal()"></div>
          <div class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Reset Account Password</h3>
            <p class="text-xs text-slate-500">Enter your official organizational email address to receive password reset instructions.</p>
            <input type="email" placeholder="name@organization.gov" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs" />
            <div class="flex justify-end space-x-2 pt-2">
              <button onclick="window.appController.closeModal()" class="px-3 py-1.5 text-xs text-slate-500 font-semibold">Cancel</button>
              <button onclick="window.appController.sendResetLink()" class="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold">Send Link</button>
            </div>
          </div>
        </div>
      `;
    }

    return html;
  }

  /* =========================================================================
   * EVENT BINDINGS
   * ========================================================================= */
  setupGlobalEventListeners() {
    // Close dropdowns on outside click
    document.addEventListener("click", (e) => {
      const locBtn = document.getElementById("location-selector-btn");
      const locDropdown = document.getElementById("location-dropdown");
      if (locBtn && locDropdown && !locBtn.contains(e.target) && !locDropdown.contains(e.target)) {
        locDropdown.classList.add("hidden");
      }

      const profBtn = document.getElementById("profile-menu-btn");
      const profDropdown = document.getElementById("profile-dropdown");
      if (profBtn && profDropdown && !profBtn.contains(e.target) && !profDropdown.contains(e.target)) {
        profDropdown.classList.add("hidden");
      }
    });
  }

  bindAppShellEvents() {
    // App shell events
  }

  bindDashboardEvents() {
    // Dashboard events
  }

  bindAssistantEvents() {
    // Chat submit is wired in form onsubmit
  }

  bindPredictionsEvents() {
    // Prediction events
  }

  bindAnalyticsEvents() {
    // Analytics events
  }

  bindReportsEvents() {
    // Reports events
  }

  bindNotificationsEvents() {
    // Notifications events
  }

  bindSettingsEvents() {
    // Settings events
  }

  bindProfileEvents() {
    // Profile events
  }

  bindLandingEvents() {
    if (window.lucide) window.lucide.createIcons();
  }

  bindAuthEvents() {
    if (window.lucide) window.lucide.createIcons();
  }

  updateDashboardMetrics() {
    // Called when location or time range changes
    if (this.state.state.currentRoute === "dashboard") {
      this.charts.refreshAll(this.state.state.activeTimeRange);
    }
  }

  updateNotificationBadges() {
    // Update bell badge
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Controller Actions & Handlers
class AppController {
  constructor() {
    this.state = window.appState;
  }

  toggleTheme() {
    const current = this.state.state.theme;
    const next = current === "dark" ? "light" : "dark";
    this.state.setState({ theme: next });
    this.state.showToast(`Switched to ${next} theme`, "info");
  }

  toggleLocationSelector() {
    const dropdown = document.getElementById("location-dropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
  }

  toggleProfileDropdown() {
    const dropdown = document.getElementById("profile-dropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
  }

  toggleMobileMenu() {
    const isOpen = this.state.state.isMobileMenuOpen;
    this.state.setState({ isMobileMenuOpen: !isOpen });
  }

  changeTimeRange(range) {
    this.state.setTimeRange(range);
    window.chartManager.refreshAll(range);
    this.state.showToast(`Updated trend horizon to ${range}`, "info");
  }

  changeRiskTimeframe(timeframe) {
    this.state.setState({ activeRiskTimeframe: timeframe });
    this.state.showToast(`Forecasting model calibrated to ${timeframe}`, "info");
  }

  changeReportFilter(filter) {
    this.state.setState({ reportFilter: filter });
  }

  handleReportSearch(query) {
    this.state.setState({ reportSearchQuery: query });
  }

  filterNotifications(category) {
    this.state.setState({ notificationFilter: category });
  }

  switchSettingsTab(tabId) {
    this.state.setState({ activeSettingsTab: tabId });
  }

  quickLoginDemo() {
    this.state.setState({
      isAuthenticated: true,
      currentRoute: "dashboard"
    });
    this.state.showToast("Welcome back, Dr. Elena Vance! Session authenticated.", "success");
  }

  logout() {
    this.state.setState({
      isAuthenticated: false,
      currentRoute: "landing"
    });
    this.state.showToast("Logged out successfully", "info");
  }

  openLoginModal() {
    this.state.navigateTo("login");
  }

  openForgotPasswordModal() {
    this.state.setState({ authModalMode: "forgot" });
  }

  closeModal() {
    this.state.setState({ viewingReport: null, selectedRiskItem: null, authModalMode: null });
  }

  sendResetLink() {
    this.closeModal();
    this.state.showToast("Password reset instructions dispatched to your email", "success");
  }

  handleAuthForm(e, mode) {
    e.preventDefault();
    this.state.setState({
      isAuthenticated: true,
      currentRoute: "dashboard"
    });
    this.state.showToast(mode === "signup" ? "Account created successfully! Welcome to SustiVision AI." : "Signed in successfully!", "success");
  }

  handleChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("ai-chat-input");
    if (!input) return;
    const val = input.value;
    input.value = "";
    this.state.sendAiMessage(val);
  }

  triggerSuggestedPrompt(prompt) {
    this.state.sendAiMessage(prompt);
  }

  startNewAiChat() {
    const newConv = {
      id: "conv-" + Date.now(),
      title: "New AI Environmental Inquiry",
      updatedAt: "Just now",
      pinned: false,
      messages: [
        {
          id: "msg-init",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          analysis: "Hello! SustiVision AI is ready to analyze your environmental telemetry queries.",
          recommendation: "Select any suggested query chip below or input a custom scenario.",
          confidence: 99,
          relevantMetrics: []
        }
      ]
    };
    this.state.setState({
      conversations: [newConv, ...this.state.state.conversations],
      activeConversationId: newConv.id
    });
  }

  switchConversation(id) {
    this.state.setState({ activeConversationId: id });
  }

  clearCurrentChat() {
    const activeId = this.state.state.activeConversationId;
    const updated = this.state.state.conversations.map((c) =>
      c.id === activeId ? { ...c, messages: [] } : c
    );
    this.state.setState({ conversations: updated });
    this.state.showToast("Conversation cleared", "info");
  }

  copyMessageText(id) {
    this.state.showToast("Analysis copied to clipboard!", "success");
  }

  regenerateAiMessage() {
    this.state.showToast("Regenerating analysis with updated sensor parameters...", "info");
    this.state.setState({ isAiTyping: true });
    setTimeout(() => {
      this.state.setState({ isAiTyping: false });
      this.state.showToast("Analysis regenerated", "success");
    }, 800);
  }

  rateFeedback(type) {
    this.state.showToast(type === "up" ? "Feedback recorded: Marked helpful" : "Feedback recorded: We'll refine this analysis model", "info");
  }

  consultAiOnRisk(riskTitle) {
    this.state.navigateTo("assistant");
    setTimeout(() => {
      this.state.sendAiMessage(`What is the detailed operational risk mitigation strategy for ${riskTitle}?`);
    }, 150);
  }

  openReportModal(reportId) {
    const report = window.SUSTIVISION_DATA.reports.find((r) => r.id === reportId);
    if (report) {
      this.state.setState({ viewingReport: report });
    }
  }

  downloadReport(reportId, format) {
    this.state.showToast(`Generating ${format.toUpperCase()} export... Download complete.`, "success");
  }

  openGenerateReportModal() {
    this.state.showToast("Automated AI Auditor generating real-time briefing...", "info");
    setTimeout(() => {
      this.state.showToast("New Weekly Report synthesized and saved to your library!", "success");
    }, 1200);
  }

  openAlertModal(alertId) {
    const alert = window.SUSTIVISION_DATA.alerts.find((a) => a.id === alertId);
    if (alert) {
      this.state.navigateTo("assistant");
      setTimeout(() => {
        this.state.sendAiMessage(`Explain mitigation protocol for alert: ${alert.title}`);
      }, 150);
    }
  }

  openRiskDeepDiveModal(riskId) {
    const risk = window.SUSTIVISION_DATA.riskPredictions.find((r) => r.id === riskId);
    if (risk) {
      this.state.showToast(`Loaded detailed hydrological simulation model for ${risk.title}`, "info");
    }
  }

  quickExportSummary() {
    this.state.showToast("Exporting Environmental Executive Briefing (PDF)... Ready!", "success");
  }

  handleAnalyticsFilterChange() {
    this.state.showToast("Analytics filters updated", "info");
  }

  exportAnalyticsCsv() {
    this.state.showToast("Exported 10,080 sector telemetry records as CSV", "success");
  }

  filterAnalyticsTable(query) {
    const rows = document.querySelectorAll("#analytics-table-body tr");
    rows.forEach((r) => {
      if (r.textContent.toLowerCase().includes(query.toLowerCase())) {
        r.style.display = "";
      } else {
        r.style.display = "none";
      }
    });
  }

  inspectSector(sectorName) {
    this.state.showToast(`Inspecting telemetry streams for ${sectorName}`, "info");
  }

  saveProfileSettings(e) {
    e.preventDefault();
    const name = document.getElementById("setting-name").value;
    const email = document.getElementById("setting-email").value;
    const role = document.getElementById("setting-role").value;
    const org = document.getElementById("setting-org").value;

    window.SUSTIVISION_DATA.user.name = name;
    window.SUSTIVISION_DATA.user.email = email;
    window.SUSTIVISION_DATA.user.role = role;
    window.SUSTIVISION_DATA.user.organization = org;

    this.state.showToast("Profile settings saved successfully", "success");
  }

  changePassword(e) {
    e.preventDefault();
    this.state.showToast("Account password updated successfully", "success");
  }
}

// Instantiate controller & app
window.appController = new AppController();
document.addEventListener("DOMContentLoaded", () => {
  window.sustivisionApp = new SustiVisionApp();
});
