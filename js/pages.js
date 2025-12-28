// ========================================
// PAGES - Main page components
// ========================================

// ========================================
// WELCOME SCREEN
// ========================================

function renderWelcomeScreen() {
    const cats = appState.cats || [];
    
    return `
        <div class="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 flex items-center justify-center p-4">
            <div class="w-full max-w-4xl text-center">
                <img src="${DEFAULT_AVATAR}" 
                     alt="Pringles Trucking" 
                     class="w-40 h-40 mx-auto rounded-full object-cover border-8 border-white shadow-2xl mb-6" />
                <h1 class="text-4xl font-bold text-amber-900 mb-2">${getText('welcome.title')}</h1>
                <p class="text-amber-700 text-lg mb-4">${getText('welcome.subtitle')}</p>

                <div class="mb-8">
                    <a href="${createPageUrl('Guide')}" 
                       class="inline-flex items-center justify-center px-4 py-2 bg-white/50 hover:bg-white/80 text-amber-800 border border-amber-200 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow">
                        <span class="mr-2">📘</span>
                        ${getText('welcome.guideLink')}
                    </a>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    ${cats.map(cat => `
                        <div onclick="handleSelectCat('${cat.cat_trucker_id}', ${cat.passcode_enabled})" class="cursor-pointer group">
                            <div class="p-4 bg-white/70 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-amber-100 flex flex-col items-center">
                                <img src="${cat.avatar_url || DEFAULT_AVATAR}" 
                                     alt="${escapeHtml(cat.nickname)}" 
                                     class="w-24 h-24 rounded-full object-cover border-4 border-amber-200 group-hover:border-amber-400 transition-colors" />
                                <h3 class="mt-4 text-lg font-semibold text-amber-900">${escapeHtml(cat.nickname)}</h3>
                                <p class="text-sm text-amber-600">${(cat.specialty || '').replace(/_/g, ' ')}</p>
                                ${cat.passcode_enabled ? '<span class="mt-2 text-xs text-amber-500">🔒 Protected</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Add New Cat Button -->
                    <div onclick="showNewCatDialog()" class="cursor-pointer group">
                        <div class="p-4 bg-transparent rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-dashed border-amber-300 hover:border-amber-500 flex flex-col items-center justify-center h-full min-h-[200px]">
                            <div class="w-24 h-24 rounded-full border-2 border-dashed border-amber-300 group-hover:border-amber-500 flex items-center justify-center">
                                <span class="text-5xl text-amber-400 group-hover:text-amber-600">+</span>
                            </div>
                            <h3 class="mt-4 text-lg font-semibold text-amber-600">${getText('welcome.addTrucker')}</h3>
                        </div>
                    </div>
                </div>
                
                <div class="max-w-xl mx-auto text-xs text-amber-600 mb-8">
                    ${getText('welcome.consent.intro')} 
                    <a href="${createPageUrl('PrivacyPolicy')}" class="underline hover:text-amber-800">${getText('welcome.consent.privacy')}</a>
                    &amp;
                    <a href="${createPageUrl('Imprint')}" class="underline hover:text-amber-800">${getText('welcome.consent.imprint')}</a>.
                </div>
            </div>
        </div>
    `;
}

// ========================================
// LAYOUT
// ========================================

function renderLayout(content, currentPage) {
    const currentCat = appState.currentCat;
    const backupDue = isBackupDue();
    const napsLine = `${getText('dashboard.napsTaken')} - ${getText('dashboard.tooFew')}`;

    const navigation = currentCat ? [
        { name: getText('navigation.dashboard'), icon: icons.snowflake, pageName: 'Dashboard' },
        { name: getText('navigation.timer'), icon: icons.clock, pageName: 'Timer' },
        { name: getText('navigation.projects'), icon: icons.folder, pageName: 'Projects' },
        { name: getText('navigation.reports'), icon: icons.chart, pageName: 'Reports' },
        { name: getText('navigation.backup'), icon: icons.download, pageName: 'BackupRestore', showBadge: backupDue },
        { name: getText('navigation.guide'), icon: icons.book, pageName: 'Guide' }
    ] : [
        { name: getText('navigation.guide') || 'Guide', icon: icons.book, pageName: 'Guide' },
        { name: getText('legal.imprint') || 'Imprint', icon: icons.info, pageName: 'Imprint' },
        { name: getText('legal.privacy') || 'Privacy', icon: icons.lock, pageName: 'PrivacyPolicy' }
    ];
    
    return `
        <div class="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 flex flex-col">
            <div class="flex flex-1">
                <!-- Mobile sidebar overlay -->
                ${appState.sidebarOpen ? `
                    <div class="fixed inset-0 bg-black/50 z-30 md:hidden" onclick="appState.sidebarOpen = false; render();"></div>
                ` : ''}
                
                <!-- Sidebar -->
                <div class="fixed top-0 left-0 h-full bg-gradient-to-b from-amber-800 to-amber-900 text-white w-64 p-4 z-40 transform sidebar-transition ${appState.sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0">
                    <div class="flex justify-between items-center mb-4">
                        <h1 class="text-lg font-bold text-amber-200">${getText('app.shortName')}</h1>
                        <div class="flex items-center gap-2">
                            ${renderLanguageSelector()}
                            <button class="md:hidden text-amber-300 hover:text-white" onclick="appState.sidebarOpen = false; render();">
                                ${icons.x}
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col h-[calc(100%-4rem)]">
                        <!-- Cat Info -->
                        <div class="px-4 pt-4 pb-2 text-center">
                            <div class="relative w-24 h-24 mx-auto mb-3">
                                <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                                     alt="Current Cat Trucker"
                                     class="w-full h-full object-cover rounded-full border-4 border-amber-400 shadow-lg" />
                            </div>
                            <p class="text-xs text-amber-300 italic bg-black/20 rounded-md px-2 py-1">
                                "${getText('quote')}"
                            </p>
                            <p class="text-xs text-amber-400 mt-1">- ${getText('quoteAuthor')}</p>
                        </div>

                        <!-- Navigation -->
                        <nav class="flex-1 px-4 mt-4 space-y-1">
                            ${navigation.map(item => renderNavItem(item, currentPage)).join('')}
                        </nav>

                        <!-- User Switcher -->
                        <div class="mt-auto px-2 pb-2">
                            ${renderCatUserSwitcher(currentCat)}
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="md:pl-64 flex flex-col flex-1">
                    <!-- Mobile Header -->
                    <div class="sticky top-0 z-10 flex items-center justify-between p-1.5 bg-white/50 backdrop-blur-sm border-b border-gray-200 md:hidden">
                        <button class="p-2 text-gray-500 rounded-md" onclick="appState.sidebarOpen = true; render();">
                            ${icons.menu}
                        </button>
                    </div>

                    <!-- Page Content -->
                    <main class="relative z-10 py-6 px-4 sm:px-6 md:px-8 flex-1 overflow-x-hidden">
                        <div class="max-w-7xl mx-auto min-w-0 w-full">
                            <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 sm:p-6 border border-amber-100 overflow-x-hidden">
                                ${content}
                            </div>
                        </div>
                    </main>

                    <!-- Footer -->
                    <footer class="relative z-10 p-4 text-center text-xs text-amber-700">
                        <div class="max-w-7xl mx-auto flex flex-col items-center gap-2">
                            <div class="flex justify-center items-center gap-4">
                                <a href="${createPageUrl('Imprint')}" class="hover:underline">${getText('legal.imprint')}</a>
                                <span class="text-amber-300">•</span>
                                <a href="${createPageUrl('PrivacyPolicy')}" class="hover:underline">${getText('legal.privacy')}</a>
                                <span class="text-amber-300">•</span>
                                <span class="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-default" title="Meow!">
                                    ${icons.paw.replace('h-6 w-6', 'h-3 w-3 text-amber-500')}
                                    <span>Made with purrs</span>
                                </span>
                            </div>
                            <p class="opacity-70">© ${new Date().getFullYear()} ${getText('app.name')} ${getText('legal.rights')}</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// DASHBOARD PAGE
// ========================================

function renderDashboard() {
    const currentCat = appState.currentCat;
    const projects = appState.projects || [];
    const stats = appState.dashboardStats || { todayTotal: 0, weekTotal: 0, monthTotal: 0 };
    const projectStats = appState.projectStats || {};
    const backupDue = isBackupDue();
    const napsLine = `${getText('dashboard.napsTaken')} - ${getText('dashboard.tooFew')}`;
    
    return `
        <div class="space-y-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-amber-900">${getText('dashboard.title')}</h1>
                    <p class="text-amber-700 mt-1">${getText('dashboard.subtitle')}</p>
                </div>
                <a href="${createPageUrl('Timer')}" 
                   class="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium">
                    ${icons.clock}
                    <span class="ml-2">${getText('dashboard.startTimer')}</span>
                </a>
            </div>

            <!-- Backup Reminder -->
            ${backupDue ? `
                <div class="border border-amber-300 bg-amber-50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-2 text-amber-800">
                        ${icons.alertCircle}
                        <span>📦 ${getText('backup.dueReminder')}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="handleQuickBackup()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm">
                            ${getText('backup.createBackup')}
                        </button>
                        <a href="${createPageUrl('BackupRestore')}" class="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-sm">
                            Settings
                        </a>
                    </div>
                </div>
            ` : ''}

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${renderStatsCard(
                    getText('dashboard.todayMetric'), 
                    formatDuration(stats.todayTotal), 
                    `${stats.todayCount || 0} ${getText('dashboard.deliveries')}`, 
                    napsLine,
                    icons.truck.replace('class="h-5 w-5"', 'class="h-5 w-5 text-amber-500 opacity-80"')
                )}
                ${renderStatsCard(
                    getText('dashboard.weekMetric'), 
                    formatDuration(stats.weekTotal), 
                    `${stats.weekCount || 0} ${getText('dashboard.deliveries')}`, 
                    napsLine,
                    icons.calendar.replace('class="h-5 w-5"', 'class="h-5 w-5 text-amber-600 opacity-80"')
                )}
                ${renderStatsCard(
                    getText('dashboard.monthMetric'), 
                    formatDuration(stats.monthTotal), 
                    `${stats.monthCount || 0} ${getText('dashboard.deliveries')}`, 
                    napsLine,
                    icons.archive.replace('class="h-4 w-4"', 'class="h-5 w-5 text-amber-700 opacity-80"')
                )}
            </div>

            <!-- Projects Section -->
            <div class="mt-8">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-amber-900">${getText('dashboard.projectsTitle')}</h2>
                    <a href="${createPageUrl('Projects')}" class="text-amber-700 hover:text-amber-800 flex items-center">
                        ${icons.plusCircle}
                        <span class="ml-2">${getText('dashboard.addProject')}</span>
                    </a>
                </div>

                ${projects.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${projects.filter(p => !p.is_archived).map(project => 
                            renderDashboardProjectCard(project, projectStats[project.project_id] || {})
                        ).join('')}
                    </div>
                ` : `
                    <div class="text-center py-12 border rounded-lg">
                        ${icons.clock}
                        <h3 class="text-lg font-medium text-gray-800 mb-2">${getText('dashboard.noProjects')}</h3>
                        <p class="text-gray-500 mb-6">${getText('dashboard.noProjectsDesc')}</p>
                        <a href="${createPageUrl('Projects')}" class="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                            ${icons.plusCircle}
                            <span class="ml-2">${getText('dashboard.createProject')}</span>
                        </a>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ========================================
// TIMER PAGE
// ========================================

function renderTimer() {
    const currentCat = appState.currentCat;
    const projects = appState.projects || [];
    const timeEntries = appState.timeEntries || [];
    const selectedProjectId = appState.selectedProjectId;
    const selectedProject = projects.find(p => p.project_id === selectedProjectId);
    const isRunning = appState.timerRunning;
    const elapsedTime = appState.elapsedTime || 0;
    const catName = currentCat?.nickname || 'Trucker';
    
    // Group entries by date (most recent 15)
    const recentEntries = timeEntries.slice(0, 15);
    const entriesByDate = {};
    recentEntries.forEach(entry => {
        const date = entry.date;
        if (!entriesByDate[date]) {
            entriesByDate[date] = { total: 0, entries: [] };
        }
        entriesByDate[date].entries.push(entry);
        entriesByDate[date].total += entry.duration_minutes;
    });
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));
    
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-amber-900">${getText('timer.title')}</h1>
                    <p class="text-amber-700 mt-1">${getText('timer.subtitle', { CAT: catName })}</p>
                </div>
            </div>

            <!-- Project Selector + New Route Button -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                ${renderProjectSelector(projects, selectedProjectId)}
                
                ${!selectedProject ? `
                    <a href="${createPageUrl('Projects')}" 
                       class="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm">
                        ${icons.plusCircle}
                        <span class="ml-2">${getText('timer.newRoute')}</span>
                    </a>
                ` : ''}
            </div>

            <!-- Timer Controls or Placeholder -->
            ${selectedProject ? 
                renderTimerControls(isRunning, elapsedTime, selectedProject, currentCat) : `
                <div class="flex flex-col items-center justify-center p-6 sm:p-10 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-center">
                    <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                         alt="${escapeHtml(catName)}"
                         class="w-28 h-28 rounded-full object-cover border-4 border-amber-200 mb-4" />
                    <p class="text-amber-700 mb-4">${getText('timer.selectRouteToStart')}</p>
                    <a href="${createPageUrl('Projects')}" 
                       class="inline-flex items-center px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${icons.plusCircle}
                        <span class="ml-2">${getText('timer.createNewRoute')}</span>
                    </a>
                </div>
            `}

            <!-- Recent Entries -->
            <div class="mt-8">
                <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                    <div class="p-4 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <h2 class="text-xl font-semibold text-amber-900 flex items-center">
                            ${icons.truck}
                            <span class="ml-2">${getText('timer.recentTitle')}</span>
                        </h2>
                        <button onclick="showAddTimeEntryDialog()" 
                                class="text-amber-700 hover:text-amber-800 flex items-center text-sm">
                            ${icons.plusCircle}
                            <span class="ml-2">${getText('timer.addManual')}</span>
                        </button>
                    </div>
                    
                    <div class="p-4 sm:p-6">
                        ${timeEntries.length > 0 ? `
                            <div class="space-y-6">
                                ${sortedDates.map(date => `
                                    <div class="space-y-3">
                                        <div class="flex justify-between items-baseline border-b border-amber-200 pb-2">
                                            <h3 class="text-sm font-medium text-amber-800">${formatDate(date)}</h3>
                                            <div class="text-xs font-semibold text-amber-900">
                                                <span class="font-normal text-amber-700">${getText('reports.logTable.total')}: </span>
                                                ${formatDuration(entriesByDate[date].total)}
                                            </div>
                                        </div>
                                        
                                        <div class="overflow-x-auto">
                                            <table class="w-full">
                                                <thead class="bg-amber-100/80">
                                                    <tr>
                                                        <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('timer.table.route')}</th>
                                                        <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('timer.table.time')}</th>
                                                        <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('timer.table.duration')}</th>
                                                        <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('timer.table.description')}</th>
                                                        <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('timer.table.actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${entriesByDate[date].entries.map(entry => renderTimeEntryRow(entry)).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="flex flex-col items-center justify-center py-8 text-center">
                                <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                                     alt="${escapeHtml(catName)}"
                                     class="w-24 h-24 rounded-full object-cover border-4 border-amber-200 mb-4" />
                                <p class="text-amber-700 italic">${getText('timer.noEntries')}</p>
                                <p class="text-amber-600 text-sm mt-2">"${getText('timer.noEntriesQuote')}"</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// PROJECTS PAGE
// ========================================

function renderProjects() {
    const projects = appState.projects || [];
    const activeProjects = projects.filter(p => !p.is_archived);
    const archivedProjects = projects.filter(p => p.is_archived);
    const showArchived = appState.showArchivedProjects;
    
    return `
        <div class="space-y-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-amber-900">${getText('projects.title')}</h1>
                    <p class="text-amber-700 mt-1">${getText('projects.subtitle')}</p>
                </div>
                <button onclick="showNewProjectDialog()" 
                        class="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium">
                    ${icons.folder}
                    <span class="ml-2">${getText('projects.new')}</span>
                </button>
            </div>

            <!-- Show Archived Toggle -->
            <div class="flex items-center justify-end gap-2">
                <label for="show-archived" class="text-sm font-medium text-amber-800">${getText('projects.showArchived')}</label>
                <button id="show-archived" 
                        onclick="appState.showArchivedProjects = !appState.showArchivedProjects; render();"
                        class="relative inline-flex h-6 w-11 items-center rounded-full ${showArchived ? 'bg-amber-600' : 'bg-gray-300'}">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition ${showArchived ? 'translate-x-6' : 'translate-x-1'}"></span>
                </button>
            </div>

            <!-- Active Projects -->
            <div class="space-y-6">
                <h2 class="text-xl font-semibold text-amber-900">${getText('projects.active')}</h2>
                ${activeProjects.length > 0 ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${activeProjects.map(p => renderProjectCard(p)).join('')}
                    </div>
                ` : `
                    <p class="text-center py-8 text-amber-600 italic">${getText('projects.noActive')}</p>
                `}
            </div>

            <!-- Archived Projects -->
            ${showArchived ? `
                <div class="space-y-6">
                    <h2 class="text-xl font-semibold text-amber-900">${getText('projects.archived')}</h2>
                    ${archivedProjects.length > 0 ? `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${archivedProjects.map(p => renderProjectCard(p)).join('')}
                        </div>
                    ` : `
                        <p class="text-center py-8 text-amber-600 italic">${getText('projects.noArchivedQuote')}</p>
                    `}
                </div>
            ` : ''}
        </div>
    `;
}

// ========================================
// REPORTS PAGE
// ========================================

function renderReports() {
    const currentCat = appState.currentCat;
    const catName = currentCat?.nickname || 'Trucker';
    const projects = appState.projects || [];
    const timeEntries = appState.timeEntries || [];
    const selectedProject = appState.reportSelectedProject || 'all';
    const selectedPeriod = appState.reportSelectedPeriod || 'all';
    
    // Filter entries
    let filteredEntries = [...timeEntries];
    
    if (selectedProject !== 'all') {
        filteredEntries = filteredEntries.filter(e => e.project_id === selectedProject);
    }
    
    if (selectedPeriod !== 'all') {
        const now = new Date();
        filteredEntries = filteredEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            
            if (selectedPeriod === 'thisWeek') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                return entryDate >= startOfWeek;
            } else if (selectedPeriod === 'lastWeek') {
                const startOfLastWeek = new Date(now);
                startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
                startOfLastWeek.setHours(0, 0, 0, 0);
                const endOfLastWeek = new Date(startOfLastWeek);
                endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
                return entryDate >= startOfLastWeek && entryDate < endOfLastWeek;
            } else if (selectedPeriod === 'thisMonth') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return entryDate >= startOfMonth;
            } else if (selectedPeriod === 'lastMonth') {
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return entryDate >= startOfLastMonth && entryDate < startOfThisMonth;
            }
            return true;
        });
    }
    
    // Calculate stats
    const totalMinutes = filteredEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const projectSummary = {};
    filteredEntries.forEach(entry => {
        if (!projectSummary[entry.project_id]) {
            projectSummary[entry.project_id] = { 
                name: entry.project?.name || 'Unknown', 
                color: entry.project?.color || '#f59e0b',
                totalMinutes: 0, 
                count: 0 
            };
        }
        projectSummary[entry.project_id].totalMinutes += entry.duration_minutes || 0;
        projectSummary[entry.project_id].count += 1;
    });
    
    const sortedProjects = Object.values(projectSummary).sort((a, b) => b.totalMinutes - a.totalMinutes);
    
    // Group entries by date
    const entriesByDate = {};
    filteredEntries.forEach(entry => {
        const date = entry.date;
        if (!entriesByDate[date]) {
            entriesByDate[date] = { total: 0, entries: [] };
        }
        entriesByDate[date].entries.push(entry);
        entriesByDate[date].total += entry.duration_minutes;
    });
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => new Date(b) - new Date(a));
    
    return `
        <div class="space-y-8">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-amber-900">${getText('reports.title')}</h1>
                    <p class="text-amber-700 mt-1 flex items-center gap-2">
                        <span>📋</span>
                        ${getText('reports.subtitle', { CAT: catName })}
                    </p>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-2">
                    <button onclick="exportStatsCSV()" 
                            ${filteredEntries.length === 0 ? 'disabled' : ''}
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg flex items-center disabled:opacity-50">
                        ${icons.download}
                        <span class="ml-2">${getText('reports.exportStats')}</span>
                    </button>
                    <button onclick="exportLogCSV()" 
                            ${filteredEntries.length === 0 ? 'disabled' : ''}
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg flex items-center disabled:opacity-50">
                        ${icons.download}
                        <span class="ml-2">${getText('reports.exportLog')}</span>
                    </button>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Route Selection -->
                    <div>
                        <div class="flex items-center gap-3 mb-3">
                            <span class="text-2xl">🗺️</span>
                            <label class="block text-lg font-medium text-amber-800">${getText('reports.routeSelection')}</label>
                        </div>
                        <select onchange="appState.reportSelectedProject = this.value; render();" 
                                class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white text-amber-900">
                            <option value="all" ${selectedProject === 'all' ? 'selected' : ''}>🌟 ${getText('reports.allRoutes')}</option>
                            ${projects.map(p => `
                                <option value="${p.project_id}" ${selectedProject === p.project_id ? 'selected' : ''}>
                                    ${escapeHtml(p.name)}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Time Period -->
                    <div>
                        <div class="flex items-center gap-3 mb-3">
                            <span class="text-2xl">📅</span>
                            <label class="block text-lg font-medium text-amber-800">${getText('reports.timeSelection')}</label>
                        </div>
                        <select onchange="appState.reportSelectedPeriod = this.value; render();" 
                                class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white text-amber-900">
                            <option value="all" ${selectedPeriod === 'all' ? 'selected' : ''}>🌍 ${getText('reports.allTime')}</option>
                            <option value="thisWeek" ${selectedPeriod === 'thisWeek' ? 'selected' : ''}>📆 ${getText('reports.thisWeek')}</option>
                            <option value="lastWeek" ${selectedPeriod === 'lastWeek' ? 'selected' : ''}>📅 ${getText('reports.lastWeek')}</option>
                            <option value="thisMonth" ${selectedPeriod === 'thisMonth' ? 'selected' : ''}>🗓️ ${getText('reports.thisMonth')}</option>
                            <option value="lastMonth" ${selectedPeriod === 'lastMonth' ? 'selected' : ''}>📖 ${getText('reports.lastMonth')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Logbook (2/3) -->
                <div class="lg:col-span-2">
                    <div class="flex items-center mb-4">
                        <span class="text-2xl mr-2">📖</span>
                        <h2 class="text-xl font-semibold text-amber-900">${getText('reports.logbookTitle')}</h2>
                        <div class="ml-3 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                            ${getText('reports.adventureCount', { COUNT: filteredEntries.length })}
                        </div>
                    </div>
                    
                    ${filteredEntries.length > 0 ? `
                        <div class="space-y-6">
                            ${sortedDates.map(date => `
                                <div class="border border-amber-200 rounded-lg overflow-hidden">
                                    <div class="bg-amber-100 px-4 py-2 flex justify-between items-center">
                                        <span class="font-medium text-amber-900">${formatDate(date)}</span>
                                        <span class="text-sm text-amber-700">${getText('reports.logTable.total')}: ${formatDuration(entriesByDate[date].total)}</span>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="w-full">
                                            <thead class="bg-amber-50">
                                                <tr>
                                                    <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('reports.logTable.route')}</th>
                                                    <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('reports.logTable.time')}</th>
                                                    <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('reports.logTable.duration')}</th>
                                                    <th class="px-4 py-2 text-left text-amber-900 text-sm">${getText('reports.logTable.cargo')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${entriesByDate[date].entries.map(entry => renderTimeEntryRow(entry, false)).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-12 border rounded-lg border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                            <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                                 alt="${getText('reports.noAdventures')}"
                                 class="w-24 h-24 mx-auto mb-4 rounded-full object-cover border-2 border-amber-200" />
                            <p class="text-amber-700 mb-2">${getText('reports.noAdventures')}</p>
                            <p class="text-amber-600 text-sm italic">${getText('reports.noAdventuresQuote')}</p>
                        </div>
                    `}
                </div>
                
                <!-- Stats (1/3) -->
                <div>
                    <div class="flex items-center mb-4">
                        <span class="text-2xl mr-2">📊</span>
                        <h2 class="text-xl font-semibold text-amber-900">${getText('reports.statsTitle')}</h2>
                    </div>
                    
                    ${sortedProjects.length > 0 ? `
                        <div class="space-y-4">
                            <div class="p-4 bg-amber-100 rounded-lg">
                                <div class="text-sm text-amber-700">${getText('reports.totalHours')}</div>
                                <div class="text-3xl font-bold text-amber-900">${formatDuration(totalMinutes)}</div>
                            </div>
                            
                            <div class="space-y-3">
                                ${sortedProjects.map(proj => {
                                    const percentage = totalMinutes > 0 ? Math.round((proj.totalMinutes / totalMinutes) * 100) : 0;
                                    return `
                                        <div class="p-3 bg-white/80 rounded-lg border border-amber-200">
                                            <div class="flex items-center justify-between mb-2">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${proj.color}"></div>
                                                    <span class="font-medium text-amber-900">${escapeHtml(proj.name)}</span>
                                                </div>
                                                <span class="text-amber-700">${formatDuration(proj.totalMinutes)}</span>
                                            </div>
                                            <div class="w-full bg-amber-200 rounded-full h-2">
                                                <div class="h-2 rounded-full" style="width: ${percentage}%; background-color: ${proj.color}"></div>
                                            </div>
                                            <div class="text-xs text-amber-600 mt-1">${percentage}% of total • ${proj.count} deliveries</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="p-4 bg-amber-50 rounded-lg text-center">
                            <p class="text-amber-700">${getText('reports.noData')}</p>
                            <p class="text-amber-600 text-sm mt-2">${getText('reports.noDataQuote')}</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// ========================================
// BACKUP/RESTORE PAGE
// ========================================

function renderBackupRestore() {
    const currentCat = appState.currentCat;
    const settings = getBackupSettings();
    const backupDue = isBackupDue();
    
    return `
        <div class="space-y-8">
            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold text-amber-900">${getText('backup.title')}</h1>
                <p class="text-amber-700 mt-1">${getText('backup.subtitle')}</p>
            </div>

            <!-- Status Card -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <div class="flex items-center gap-3">
                    <div class="p-3 rounded-full ${backupDue ? 'bg-amber-200' : 'bg-green-100'}">
                        ${backupDue ? icons.alertCircle : icons.checkCircle}
                    </div>
                    <div>
                        <h2 class="font-semibold text-amber-900">${getText('backup.statusTitle')}</h2>
                        <p class="text-sm text-amber-700">
                            ${settings.lastBackupDate 
                                ? `${getText('backup.lastBackup')}: ${formatDateShort(settings.lastBackupDate)}` 
                                : getText('backup.noBackupYet')}
                        </p>
                    </div>
                </div>
                ${backupDue && settings.schedule !== 'off' ? `
                    <div class="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-300 flex items-center gap-2 text-amber-800">
                        ${icons.alertCircle}
                        <span>${getText('backup.dueReminder')}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Schedule Settings -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <div class="flex items-center gap-2 mb-4">
                    ${icons.calendar}
                    <h2 class="font-semibold text-amber-900">${getText('backup.scheduleTitle')}</h2>
                </div>
                <p class="text-sm text-amber-700 mb-4">${getText('backup.scheduleDesc')}</p>
                
                <select onchange="handleScheduleChange(this.value)" 
                        class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white text-amber-900">
                    <option value="off" ${settings.schedule === 'off' ? 'selected' : ''}>${getText('backup.scheduleOff')}</option>
                    <option value="daily" ${settings.schedule === 'daily' ? 'selected' : ''}>${getText('backup.scheduleDaily')}</option>
                    <option value="weekly" ${settings.schedule === 'weekly' ? 'selected' : ''}>${getText('backup.scheduleWeekly')}</option>
                    <option value="monthly" ${settings.schedule === 'monthly' ? 'selected' : ''}>${getText('backup.scheduleMonthly')}</option>
                </select>
                
                ${settings.schedule !== 'off' ? `
                    <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2 text-blue-800 text-sm">
                        ${icons.info}
                        <span>${getText('backup.reminderExplanation')}</span>
                    </div>
                ` : ''}
            </div>

            <!-- Manual Backup -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <h2 class="font-semibold text-amber-900 mb-2">${getText('backup.manualTitle')}</h2>
                <p class="text-sm text-amber-700 mb-4">${getText('backup.manualDesc')}</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onclick="handleCreateBackup()" 
                            class="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center">
                        ${icons.download}
                        <div class="ml-3 text-left">
                            <div class="font-semibold">${getText('backup.createBackup')}</div>
                            <div class="text-xs opacity-90">${getText('backup.downloadJson')}</div>
                        </div>
                    </button>
                    
                    <button onclick="document.getElementById('backup-file-input').click()" 
                            class="p-4 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg flex items-center">
                        ${icons.upload}
                        <div class="ml-3 text-left">
                            <div class="font-semibold">${getText('backup.restoreBackup')}</div>
                            <div class="text-xs opacity-90">${getText('backup.uploadJson')}</div>
                        </div>
                    </button>
                    <input type="file" id="backup-file-input" accept=".json" style="display: none" onchange="handleFileImport(event)" />
                </div>
                
                <div class="mt-4 p-3 bg-amber-100 rounded-lg border border-amber-300 flex items-start gap-2 text-amber-800 text-sm">
                    ${icons.info}
                    <span>${getText('backup.localNote')}</span>
                </div>
            </div>

            <!-- Cat Wisdom -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div class="flex items-start gap-4">
                    <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                         alt="Pringles"
                         class="w-16 h-16 rounded-full object-cover border-4 border-blue-200" />
                    <div class="flex-1">
                        <p class="text-blue-900 italic">"${getText('backup.catWisdom')}"</p>
                        <p class="text-blue-700 text-sm mt-2">- ${currentCat?.nickname || "Pringles"}, ${getText('backup.wisdomAuthor')}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// GUIDE PAGE
// ========================================

function renderGuide() {
    const activeTab = appState.guideTab || 'story';
    const tabs = [
        { id: 'story', icon: '📖', label: getText('guide.tabs.story') },
        { id: 'getting-started', icon: '🚀', label: getText('guide.tabs.gettingStarted') },
        { id: 'features', icon: '⚙️', label: getText('guide.tabs.features') },
        { id: 'tips', icon: '💡', label: getText('guide.tabs.tips') }
    ];
    const tabButtons = tabs.map(({ id, icon, label }) => {
        const isActive = activeTab === id;
        const baseClasses = 'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border';
        const activeClasses = isActive ? 'bg-amber-600 text-white border-amber-600 shadow-lg scale-[1.01]' : 'bg-white/80 text-amber-800 border-amber-200 hover:bg-amber-100';
        return `<button type="button" class="${baseClasses} ${activeClasses}" onclick="setGuideTab('${id}')">${icon}<span>${label}</span></button>`;
    }).join('');
    
    return `
        <div class="space-y-10" id="guide-page">
            <div class="space-y-4 text-center md:text-left mx-auto max-w-3xl">
                <div class="flex items-center justify-center md:justify-start gap-3 text-amber-700 font-semibold tracking-wide">
                    <span class="text-2xl">🐱</span>
                    <span>${getText('app.shortName')}</span>
                    <span class="text-2xl">🚛</span>
                </div>
                <h1 class="text-4xl font-bold text-amber-900">${getText('guide.title')}</h1>
                <p class="text-amber-700 text-lg">${getText('guide.subtitle')}</p>
                <div class="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <span class="px-3 py-1 bg-white/70 rounded-full text-amber-800 text-xs border border-amber-200">${getText('navigation.dashboard')}</span>
                    <span class="px-3 py-1 bg-white/70 rounded-full text-amber-800 text-xs border border-amber-200">${getText('navigation.timer')}</span>
                    <span class="px-3 py-1 bg-white/70 rounded-full text-amber-800 text-xs border border-amber-200">${getText('navigation.projects')}</span>
                    <span class="px-3 py-1 bg-white/70 rounded-full text-amber-800 text-xs border border-amber-200">${getText('navigation.reports')}</span>
                </div>
            </div>

            <div class="bg-white/70 border border-amber-200 rounded-2xl p-3 shadow-lg">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    ${tabButtons}
                </div>
            </div>

            <div class="relative space-y-0">
                ${renderGuideStorySection(activeTab)}
                ${renderGuideGettingStartedSection(activeTab)}
                ${renderGuideFeaturesSection(activeTab)}
                ${renderGuideTipsSection(activeTab)}
            </div>

            <div class="text-center py-8 border-t border-amber-200">
                ${activeTab === 'story' ? `
                <div class="max-w-3xl mx-auto mb-6">
                    <img
                        src="assets/cat_truck_stop.jpg"
                        alt="${getText('guide.partyCaption')}"
                        class="rounded-xl shadow-lg border-4 border-amber-200 w-full object-cover"
                    />
                    <p class="text-center text-sm italic text-amber-700 mt-2 bg-amber-100/70 px-3 py-2 rounded-b-lg">
                        ${getText('guide.partyCaption')}
                    </p>
                </div>` : ''}
                <div class="flex items-center justify-center gap-4 mb-4">
                    <span class="text-2xl">🐾</span>
                    <p class="text-amber-700 italic">${getText('guide.footer.quote')}</p>
                    <span class="text-2xl">🐾</span>
                </div>
                <p class="text-amber-600 text-sm">${getText('guide.footer.team')}</p>
            </div>
        </div>
    `;
}

function renderGuidePanel(id, activeTab, content) {
    const isActive = activeTab === id;
    const visibility = isActive ? 'block' : 'hidden';
    return `
        <section class="${visibility} space-y-8" data-guide-panel="${id}">
            ${content}
        </section>
    `;
}

function renderGuideStorySection(activeTab) {
    return renderGuidePanel('story', activeTab, `
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-lg space-y-8">
            <div>
                <h2 class="text-2xl font-bold text-amber-900 flex items-center gap-2">📜 ${getText('guide.story.cardTitle')}</h2>
                <h3 class="text-lg font-semibold text-amber-800 mt-4">${getText('guide.story.beginTitle')}</h3>
            </div>
            <div class="grid md:grid-cols-2 gap-8 items-center">
                <div class="space-y-4 text-amber-700">
                    <p>${getText('guide.story.p1')}</p>
                    <p>${getText('guide.story.p2')}</p>
                    <p>${getText('guide.story.p3')}</p>
                </div>
                <div class="space-y-4 text-amber-700">
                    <h3 class="text-lg font-semibold text-amber-900 flex items-center gap-2">🌌 ${getText('guide.story.auroraTitle')}</h3>
                    <p class="text-amber-700 mt-2">${getText('guide.story.auroraP')}</p>
                </div>
                <div class="relative">
                    <img
                        src="assets/arctic_diner.jpg"
                        alt="${getText('guide.story.dinerCaption')}"
                        class="rounded-2xl shadow-xl border-4 border-amber-100 w-full object-cover"
                    />
                    <p class="text-center text-xs italic text-amber-700 mt-2 bg-amber-100/70 px-3 py-2 rounded-lg">
                        ${getText('guide.story.dinerCaption')}
                    </p>
                </div>
            </div>
            <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow">
                <div class="flex flex-col sm:flex-row gap-4 items-center">
                    <img src="assets/pringles.jpg"
                         alt="Pringles"
                         class="w-20 h-20 rounded-full object-cover border-4 border-amber-200" />
                    <div>
                        <p class="text-amber-800 italic">${getText('guide.story.founderQuote')}</p>
                        <p class="text-amber-600 text-sm mt-2">${getText('guide.story.founderByline')}</p>
                    </div>
                </div>


                <!-- Trucker Anthem -->
                <div class="mt-6 pt-6 border-t border-amber-100">
                    <div class="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col gap-3">
                        <div class="flex items-center gap-3">
                            <div class="bg-amber-200 p-2 rounded-full">🎵</div>
                            <div>
                                <h4 class="font-bold text-amber-900 text-sm">${getText('guide.anthem.title')}</h4>
                                <p class="text-xs text-amber-600 italic">${getText('guide.anthem.artist')}</p>
                            </div>
                        </div>
                        <audio controls class="w-full h-10 rounded-lg">
                            <source src="assets/The%20Pringlettes%20-%20Pringles%20the%20Arctic%20Cat.mp3" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                        <p class="text-[10px] text-center text-amber-400 uppercase tracking-widest font-bold">${getText('guide.anthem.caption')}</p>
                    </div>
                </div>
            </div>
        </div>
    `);
}

function renderGuideGettingStartedSection(activeTab) {
    const humanSpeak = getText('guide.gettingStarted.humanSpeakPrefix');
    const steps = [
        {
            title: getText('guide.gettingStarted.step1Title'),
            text: getText('guide.gettingStarted.step1Text'),
            human: getText('guide.gettingStarted.step1Human'),
            badge: getText('guide.gettingStarted.proTipBadge')
        },
        {
            title: getText('guide.gettingStarted.step2Title'),
            text: getText('guide.gettingStarted.step2Text'),
            human: getText('guide.gettingStarted.step2Human')
        },
        {
            title: getText('guide.gettingStarted.step3Title'),
            text: getText('guide.gettingStarted.step3Text'),
            human: getText('guide.gettingStarted.step3Human')
        },
        {
            title: getText('guide.gettingStarted.step4Title'),
            text: getText('guide.gettingStarted.step4Text'),
            human: getText('guide.gettingStarted.step4Human')
        }
    ].map((step, index) => `
        <div class="flex gap-4 bg-white/80 border border-amber-200 rounded-xl p-4 shadow-sm">
            <div class="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold flex-shrink-0">${index + 1}</div>
            <div>
                <h3 class="font-semibold text-amber-900">${step.title}</h3>
                <p class="text-amber-700 text-sm mt-1">${step.text}</p>
                <p class="text-xs text-gray-600 mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span class="font-semibold">${humanSpeak}</span>${step.human}
                </p>
                ${step.badge ? `<span class="inline-flex mt-2 px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-xs font-semibold">${step.badge}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    return renderGuidePanel('getting-started', activeTab, `
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 shadow-lg">
            <h2 class="text-2xl font-bold text-amber-900 flex items-center gap-2">🚀 ${getText('guide.gettingStarted.welcomeTitle')}</h2>
            <div class="mt-6 space-y-5">
                ${steps}
            </div>
        </div>
    `);
}

function renderGuideFeaturesSection(activeTab) {
    return renderGuidePanel('features', activeTab, `
        <div class="grid gap-6">
            <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center gap-3 text-amber-900 text-xl font-semibold">
                    ${icons.snowflake}
                    <span>${getText('guide.features.dashboardTitle')}</span>
                </div>
                <p class="text-amber-700 mt-4">${getText('guide.features.dashboardDesc')}</p>
                <p class="text-sm text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                    <span class="font-semibold">${getText('guide.features.professionalAnalogyPrefix')}</span>${getText('guide.features.dashboardAnalogy')}
                </p>
                <div class="flex flex-wrap gap-2 mt-4">
                    <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">${getText('guide.features.dailyStats')}</span>
                    <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">${getText('guide.features.weeklyOverview')}</span>
                    <span class="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">${getText('guide.features.monthlyProgress')}</span>
                </div>
            </div>

            <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center gap-3 text-amber-900 text-xl font-semibold">
                    ${icons.clock}
                    <span>${getText('guide.features.timerTitle')}</span>
                </div>
                <p class="text-amber-700 mt-4">${getText('guide.features.timerDesc')}</p>
                <p class="text-sm text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                    <span class="font-semibold">${getText('guide.features.professionalAnalogyPrefix')}</span>${getText('guide.features.timerAnalogy')}
                </p>
                <div class="grid md:grid-cols-3 gap-4 mt-4">
                    <div class="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                        ${icons.play}
                        <span class="text-green-800 font-medium">${getText('timer.start')}</span>
                    </div>
                    <div class="flex items-center gap-2 p-3 bg-amber-100 rounded-lg">
                        ${icons.pause}
                        <span class="text-amber-800 font-medium">${getText('timer.pause')}</span>
                    </div>
                    <div class="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                        ${icons.save}
                        <span class="text-blue-800 font-medium">${getText('timer.save')}</span>
                    </div>
                </div>
                <span class="inline-block mt-4 px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-xs font-semibold">${getText('guide.features.timerAdjustTip')}</span>
            </div>

            <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center gap-3 text-amber-900 text-xl font-semibold">
                    ${icons.folder}
                    <span>${getText('guide.features.projectsTitle')}</span>
                </div>
                <p class="text-amber-700 mt-4">${getText('guide.features.projectsDesc')}</p>
                <p class="text-sm text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                    <span class="font-semibold">${getText('guide.features.professionalAnalogyPrefix')}</span>${getText('guide.features.projectsAnalogy')}
                </p>
                <div class="space-y-2 mt-4">
                    <div class="flex items-center gap-2 text-amber-800">
                        <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span>${getText('projects.new')}</span>
                    </div>
                    <div class="flex items-center gap-2 text-amber-800">
                        <span class="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span>${getText('projects.edit')}</span>
                    </div>
                    <div class="flex items-center gap-2 text-amber-800">
                        <span class="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span>${getText('projects.archive')}</span>
                    </div>
                </div>
            </div>

            <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center gap-3 text-amber-900 text-xl font-semibold">
                    ${icons.chart}
                    <span>${getText('guide.features.reportsTitle')}</span>
                </div>
                <p class="text-amber-700 mt-4">${getText('guide.features.reportsDesc')}</p>
                <p class="text-sm text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-lg mt-4">
                    <span class="font-semibold">${getText('guide.features.professionalAnalogyPrefix')}</span>${getText('guide.features.reportsAnalogy')}
                </p>
                <span class="inline-block mt-4 px-3 py-1 rounded-full bg-green-200 text-green-800 text-xs font-semibold">${getText('guide.features.exportReady')}</span>
            </div>
        </div>
    `);
}

function renderGuideTipsSection(activeTab) {
    const timeTips = getGuideList('guide.tips.timeItems');
    const routeTips = getGuideList('guide.tips.routesItems');
    const securityTips = getGuideList('guide.tips.secItems');
    const listMarkup = (items) => items.map((tip) => `<li>• ${tip}</li>`).join('');
    
    return renderGuidePanel('tips', activeTab, `
        <div class="space-y-6">
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg space-y-4">
                <h2 class="text-2xl font-bold text-amber-900 flex items-center gap-2">🎓 ${getText('guide.tips.title')}</h2>
                <p class="text-sm text-amber-700 bg-white/70 border border-amber-200 rounded-xl p-4">
                    ${getText('guide.tips.checklistCaption')}
                </p>
                <div class="bg-white/80 border border-amber-100 rounded-2xl p-4 shadow-sm">
                    <div class="flex items-center gap-3">
                        <span class="text-3xl">😾</span>
                        <div>
                            <h3 class="font-semibold text-amber-900">${getText('guide.tips.pringlesTitle')}</h3>
                            <p class="text-xs text-amber-600">${getText('guide.story.founderByline')}</p>
                        </div>
                    </div>
                    <ul class="mt-4 space-y-2 text-amber-700 text-sm">
                        <li>• ${getText('guide.tips.pr1')}</li>
                        <li>• ${getText('guide.tips.pr2')}</li>
                        <li>• ${getText('guide.tips.pr3')}</li>
                        <li>• ${getText('guide.tips.pr4')}</li>
                    </ul>
                </div>
            </div>

            <div class="bg-purple-100 border border-purple-200 rounded-2xl p-6 shadow-lg">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">💜</span>
                    <div>
                        <h3 class="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                            ${getText('guide.tips.auroraTitle')} <span class="text-xs">🎵</span>
                        </h3>
                        <p class="text-xs text-purple-700">${getText('guide.story.auroraTitle')}</p>
                    </div>
                </div>
                <ul class="mt-4 space-y-2 text-purple-700 text-sm">
                    <li>• ${getText('guide.tips.au1')}</li>
                    <li>• ${getText('guide.tips.au2')}</li>
                    <li>• ${getText('guide.tips.au3')}</li>
                    <li>• ${getText('guide.tips.au4')}</li>
                </ul>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                    <h3 class="font-semibold text-amber-900 mb-2">${getText('guide.tips.timeTitle')}</h3>
                    <p class="text-xs text-gray-500 mb-2 italic">${getText('guide.tips.timeDesc')}</p>
                    <ul class="text-sm text-amber-700 space-y-1">
                        ${listMarkup(timeTips)}
                    </ul>
                </div>
                <div class="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-lg">
                    <h3 class="font-semibold text-amber-900 mb-2">${getText('guide.tips.routesTitle')}</h3>
                    <p class="text-xs text-gray-500 mb-2 italic">${getText('guide.tips.routesDesc')}</p>
                    <ul class="text-sm text-amber-700 space-y-1">
                        ${listMarkup(routeTips)}
                    </ul>
                </div>
            </div>

            <div class="bg-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
                <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">🔒 ${getText('guide.tips.securityTitle')}</h3>
                <p class="text-xs text-blue-700 mb-2 italic">${getText('guide.tips.secDesc')}</p>
                <ul class="space-y-2 text-blue-800 text-sm">
                    ${listMarkup(securityTips)}
                </ul>
            </div>
        </div>
    `);
}

function getGuideList(path) {
    const value = getText(path);
    return Array.isArray(value) ? value : [];
}

function setGuideTab(tab) {
    const validTabs = ['story', 'getting-started', 'features', 'tips'];
    if (!validTabs.includes(tab) || appState.guideTab === tab) {
        return;
    }
    appState.guideTab = tab;
    render();
}

// ========================================
// IMPRINT PAGE
// ========================================

function renderImprint() {
    return `
        <div class="space-y-8">
            <h1 class="text-3xl font-bold text-amber-900">${getText('imprint.title')}</h1>

            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h2 class="text-amber-900 text-2xl font-semibold leading-none tracking-tight">${getText('imprint.operatorTitle')}</h2>
                </div>
                <div class="p-6 pt-0 space-y-2 text-amber-800">
                    <p>Kickdrive Software Solutions e.K.</p>
                    <p>Robert-Bosch-Str. 5</p>
                    <p>88677 Markdorf</p>
                    <p>Germany</p>
                </div>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h2 class="text-amber-900 text-2xl font-semibold leading-none tracking-tight">${getText('imprint.contactTitle')}</h2>
                </div>
                <div class="p-6 pt-0 space-y-2 text-amber-800">
                    <p>
                        <span class="font-semibold">${getText('imprint.emailLabel')}:</span>
                        <span> </span>
                        <a href="mailto:pringles@arctictime.de" class="text-amber-600 underline hover:text-amber-800 transition-colors">
                            pringles@arctictime.de
                        </a>
                    </p>
                    <p class="text-sm italic text-amber-700 pt-2">${getText('imprint.contactNote')}</p>
                </div>
            </div>

            <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h2 class="text-amber-900 text-2xl font-semibold leading-none tracking-tight">${getText('imprint.disclaimerTitle')}</h2>
                </div>
                <div class="p-6 pt-0 space-y-4 text-sm text-amber-700">
                    <p>${getText('imprint.disclaimerText1')}</p>
                    <p>${getText('imprint.disclaimerText2')}</p>
                </div>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h2 class="text-blue-900 text-2xl font-semibold leading-none tracking-tight">${getText('imprint.funDisclaimerTitle')}</h2>
                </div>
                <div class="p-6 pt-0 text-blue-800 italic">
                    <p>${getText('imprint.funDisclaimerText')}</p>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// PRIVACY POLICY PAGE
// ========================================

function renderPrivacyPolicy() {
    return `
        <div class="space-y-8">
            <h1 class="text-3xl font-bold text-amber-900">${getText('privacy.title')}</h1>
            <p class="text-amber-700">${getText('privacy.intro')}</p>
            
            <div class="space-y-6">
                <div class="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <h2 class="text-xl font-semibold text-amber-900 mb-3">${getText('privacy.responsible.title')}</h2>
                    <p class="text-amber-700">${getText('privacy.responsible.text')}</p>
                    <a href="${createPageUrl('Imprint')}" class="text-amber-600 hover:underline">${getText('privacy.responsible.link')}</a>
                </div>
                
                <div class="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <h2 class="text-xl font-semibold text-amber-900 mb-3">${getText('privacy.data.title')}</h2>
                    <p class="text-amber-700 mb-4 font-medium">${getText('privacy.data.p1')}</p>
                    
                    <h3 class="font-medium text-amber-800 mt-4 mb-2">${getText('privacy.data.profile.title')}</h3>
                    <p class="text-amber-700">${getText('privacy.data.profile.text')}</p>
                    
                    <h3 class="font-medium text-amber-800 mt-4 mb-2">${getText('privacy.data.usage.title')}</h3>
                    <p class="text-amber-700">${getText('privacy.data.usage.text')}</p>
                    
                    <h3 class="font-medium text-amber-800 mt-4 mb-2">${getText('privacy.data.storage.title')}</h3>
                    <p class="text-amber-700">${getText('privacy.data.storage.text')}</p>
                </div>
                
                <div class="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h2 class="text-xl font-semibold text-red-900 mb-3">${getText('privacy.data.funDisclaimer.title')}</h2>
                    <p class="text-red-700">${getText('privacy.data.funDisclaimer.text')}</p>
                </div>
                
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h2 class="text-xl font-semibold text-green-900 mb-3">${getText('privacy.rights.title')}</h2>
                    <p class="text-green-700 mb-3">${getText('privacy.rights.intro')}</p>
                    <ul class="list-disc list-inside space-y-1 text-green-700">
                        <li>${getText('privacy.rights.access')}</li>
                        <li>${getText('privacy.rights.rectification')}</li>
                        <li>${getText('privacy.rights.erasure')}</li>
                        <li>${getText('privacy.rights.portability')}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Make page functions available globally
window.renderWelcomeScreen = renderWelcomeScreen;
window.renderLayout = renderLayout;
window.renderDashboard = renderDashboard;
window.renderTimer = renderTimer;
window.renderProjects = renderProjects;
window.renderReports = renderReports;
window.renderBackupRestore = renderBackupRestore;
window.renderGuide = renderGuide;
window.setGuideTab = setGuideTab;
window.renderImprint = renderImprint;
window.renderPrivacyPolicy = renderPrivacyPolicy;
