// ========================================
// APP - Main application logic
// ========================================

// ========================================
// GLOBAL STATE
// ========================================

window.appState = {
    // Data
    cats: [],
    projects: [],
    timeEntries: [],
    currentCat: null,
    
    // UI State
    currentPage: 'Dashboard',
    routeParams: {},
    sidebarOpen: false,
    guideTab: 'story',
    loading: true,
    
    // Timer State
    timerRunning: false,
    timerStartTime: null,
    elapsedTime: 0,
    selectedProjectId: null,
    timerInterval: null,
    
    // Report Filters
    reportSelectedProject: 'all',
    reportSelectedPeriod: 'all',
    
    // Projects Page
    showArchivedProjects: false,
    
    // Dashboard Stats
    dashboardStats: { todayTotal: 0, weekTotal: 0, monthTotal: 0 },
    projectStats: {}
};

// ========================================
// INITIALIZATION
// ========================================

async function initApp() {
    try {
        appState.loading = true;
        
        // Check for existing session
        const session = CatSession.getCurrentSession();
        
        if (session) {
            // Load current cat data
            const cat = await CatTrucker.get(session.cat_trucker_id);
            if (cat) {
                appState.currentCat = cat;
                await loadUserData();
                
                // Restore timer state
                restoreTimerState();
            } else {
                // Invalid session
                CatSession.clearSession();
            }
        }
        
        // Load all cats for welcome screen
        appState.cats = await CatTrucker.list();
        
        // Parse initial route
        parseRoute();
        
        appState.loading = false;
        render();
        
        // Set up hash change listener
        window.addEventListener('hashchange', handleHashChange);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        appState.loading = false;
        render();
    }
}

async function loadUserData() {
    if (!appState.currentCat) return;
    
    const catId = appState.currentCat.cat_trucker_id;
    
    // Load projects
    const allProjects = await Project.list();
    appState.projects = allProjects.filter(p => p.cat_trucker_id === catId);
    const catProjectIds = new Set(appState.projects.map(project => project.project_id));
    
    // Load time entries (support legacy backups that lack cat_trucker_id)
    const allEntries = await TimeEntry.list();
    appState.timeEntries = allEntries
        .filter(entry => {
            if (entry.cat_trucker_id) {
                return entry.cat_trucker_id === catId;
            }
            return catProjectIds.has(entry.project_id);
        })
        .sort((a, b) => {
            // Sort by date desc, then by start_time desc
            if (a.date !== b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            return (b.start_time || '').localeCompare(a.start_time || '');
        });
    
    // Attach project info to time entries
    appState.timeEntries.forEach(entry => {
        entry.project = appState.projects.find(p => p.project_id === entry.project_id);
    });
    
    // Calculate dashboard stats
    calculateDashboardStats();
    
    // Set default selected project if none
    if (!appState.selectedProjectId && appState.projects.length > 0) {
        const activeProjects = appState.projects.filter(p => !p.is_archived);
        if (activeProjects.length > 0) {
            appState.selectedProjectId = activeProjects[0].project_id;
        }
    }
}

function calculateDashboardStats() {
    const entries = appState.timeEntries || [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Start of this week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let todayTotal = 0, todayCount = 0;
    let weekTotal = 0, weekCount = 0;
    let monthTotal = 0, monthCount = 0;
    
    entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const minutes = entry.duration_minutes || 0;
        
        if (entry.date === today) {
            todayTotal += minutes;
            todayCount++;
        }
        
        if (entryDate >= startOfWeek) {
            weekTotal += minutes;
            weekCount++;
        }
        
        if (entryDate >= startOfMonth) {
            monthTotal += minutes;
            monthCount++;
        }
    });
    
    appState.dashboardStats = {
        todayTotal, todayCount,
        weekTotal, weekCount,
        monthTotal, monthCount
    };
    
    // Calculate project stats with time periods
    appState.projectStats = {};
    entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const minutes = entry.duration_minutes || 0;
        
        if (!appState.projectStats[entry.project_id]) {
            appState.projectStats[entry.project_id] = { 
                totalMinutes: 0, 
                count: 0,
                today: 0,
                week: 0,
                month: 0
            };
        }
        
        appState.projectStats[entry.project_id].totalMinutes += minutes;
        appState.projectStats[entry.project_id].count++;
        
        if (entry.date === today) {
            appState.projectStats[entry.project_id].today += minutes;
        }
        if (entryDate >= startOfWeek) {
            appState.projectStats[entry.project_id].week += minutes;
        }
        if (entryDate >= startOfMonth) {
            appState.projectStats[entry.project_id].month += minutes;
        }
    });
}

// ========================================
// ROUTING
// ========================================

function parseRoute() {
    const hash = window.location.hash.slice(1) || '';
    const queryIndex = hash.indexOf('?');
    const routePath = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
    const queryString = queryIndex >= 0 ? hash.slice(queryIndex + 1) : '';
    const parts = routePath.split('/');
    const page = parts[0] || 'Dashboard';
    
    // Map of valid pages
    const validPages = ['Dashboard', 'Timer', 'Projects', 'Reports', 'BackupRestore', 'Guide', 'Imprint', 'PrivacyPolicy'];
    appState.routeParams = {};
    if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
            appState.routeParams[key] = value;
        });
    }
    
    if (validPages.includes(page)) {
        appState.currentPage = page;
    } else {
        appState.currentPage = 'Dashboard';
    }

    applyRouteParams();
}

function applyRouteParams() {
    const params = appState.routeParams || {};
    if (!params || Object.keys(params).length === 0) return;

    const projectParam = params.project_id || params.project;
    if (projectParam) {
        const matchingProject = appState.projects.find(p => p.project_id === projectParam);
        if (matchingProject) {
            if (appState.currentPage === 'Timer') {
                appState.selectedProjectId = matchingProject.project_id;
            }
            if (appState.currentPage === 'Reports') {
                appState.reportSelectedProject = matchingProject.project_id;
            }
        }
    }
}

function handleHashChange() {
    parseRoute();
    render();
}

function navigateTo(page) {
    window.location.hash = '#' + page;
}

// ========================================
// MAIN RENDER
// ========================================

function render() {
    const app = document.getElementById('app');
    
    if (appState.loading) {
        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-amber-100 flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-amber-700">${getText('app.loading')}</p>
                </div>
            </div>
        `;
        return;
    }
    
    // No user logged in
    if (!appState.currentCat) {
        const publicPages = ['Guide', 'Imprint', 'PrivacyPolicy'];
        if (publicPages.includes(appState.currentPage)) {
            let pageContent = '';
            switch (appState.currentPage) {
                case 'Guide':
                    pageContent = renderGuide();
                    break;
                case 'Imprint':
                    pageContent = renderImprint();
                    break;
                case 'PrivacyPolicy':
                    pageContent = renderPrivacyPolicy();
                    break;
                default:
                    pageContent = renderWelcomeScreen();
            }
            app.innerHTML = renderLayout(pageContent, appState.currentPage);
        } else {
            app.innerHTML = renderWelcomeScreen();
        }
        return;
    }
    
    // Render appropriate page
    let pageContent = '';
    
    switch (appState.currentPage) {
        case 'Dashboard':
            pageContent = renderDashboard();
            break;
        case 'Timer':
            pageContent = renderTimer();
            break;
        case 'Projects':
            pageContent = renderProjects();
            break;
        case 'Reports':
            pageContent = renderReports();
            break;
        case 'BackupRestore':
            pageContent = renderBackupRestore();
            break;
        case 'Guide':
            pageContent = renderGuide();
            break;
        case 'Imprint':
            pageContent = renderImprint();
            break;
        case 'PrivacyPolicy':
            pageContent = renderPrivacyPolicy();
            break;
        default:
            pageContent = renderDashboard();
    }
    
    app.innerHTML = renderLayout(pageContent, appState.currentPage);
}

// ========================================
// TIMER LOGIC
// ========================================

function startTimer() {
    if (appState.timerRunning || !appState.selectedProjectId) return;
    
    appState.timerRunning = true;
    appState.timerStartTime = Date.now() - (appState.elapsedTime * 1000);
    
    // Save timer state to localStorage
    saveTimerState();
    
    // Start interval - update elapsed time and re-render every second
    appState.timerInterval = setInterval(() => {
        appState.elapsedTime = Math.floor((Date.now() - appState.timerStartTime) / 1000);
        saveTimerState();
        render();
    }, 1000);
    
    render();
}

function pauseTimer() {
    if (!appState.timerRunning) return;
    
    appState.timerRunning = false;
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    
    saveTimerState();
    render();
}

function resetTimer() {
    appState.timerRunning = false;
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
    appState.elapsedTime = 0;
    appState.timerStartTime = null;
    
    clearTimerState();
    render();
}

function adjustTimer(minutes) {
    const seconds = minutes * 60;
    appState.elapsedTime = Math.max(0, appState.elapsedTime + seconds);
    
    if (appState.timerRunning) {
        appState.timerStartTime = Date.now() - (appState.elapsedTime * 1000);
    }
    
    saveTimerState();
    render();
}

async function saveTimeEntry(description = '') {
    if (appState.elapsedTime < 60) {
        showToast(getText('timer.tooShort') || 'Log at least one minute before saving.', 'error');
        return;
    }
    
    const project = appState.projects.find(p => p.project_id === appState.selectedProjectId);
    if (!project || !appState.currentCat) return;
    
    const now = new Date();
    const durationMinutes = Math.round(appState.elapsedTime / 60);
    
    // Calculate start time based on elapsed
    const startDate = new Date(now.getTime() - appState.elapsedTime * 1000);
    
    const entry = {
        cat_trucker_id: appState.currentCat.cat_trucker_id,
        project_id: project.project_id,
        date: now.toISOString().split('T')[0],
        start_time: formatTimeForEntry(startDate),
        end_time: formatTimeForEntry(now),
        duration_minutes: durationMinutes,
        description: description || ''
    };
    
    try {
        await TimeEntry.create(entry);
        showToast(getText('timer.entrySaved') || 'Expedition saved!', 'success');
        
        resetTimer();
        await loadUserData();
        render();
    } catch (error) {
        console.error('Error saving time entry:', error);
        showToast(getText('errors.saveFailed') || 'Could not save this expedition.', 'error');
    }
}

function formatTimeForEntry(date) {
    return date.toTimeString().slice(0, 5);
}

function saveTimerEntry() {
    const descriptionInput = document.getElementById('timer-description');
    const description = descriptionInput?.value || appState.timerDescription || '';
    saveTimeEntry(description);
}

function saveTimerState() {
    const state = {
        running: appState.timerRunning,
        startTime: appState.timerStartTime,
        elapsed: appState.elapsedTime,
        projectId: appState.selectedProjectId,
        catId: appState.currentCat?.cat_trucker_id
    };
    localStorage.setItem('timerState', JSON.stringify(state));
}

function clearTimerState() {
    localStorage.removeItem('timerState');
}

function restoreTimerState() {
    try {
        const saved = localStorage.getItem('timerState');
        if (!saved) return;
        
        const state = JSON.parse(saved);
        
        // Only restore if same cat
        if (state.catId !== appState.currentCat?.cat_trucker_id) {
            clearTimerState();
            return;
        }
        
        appState.selectedProjectId = state.projectId;
        
        if (state.running && state.startTime) {
            appState.timerStartTime = state.startTime;
            appState.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
            appState.timerRunning = true;
            
            appState.timerInterval = setInterval(() => {
                appState.elapsedTime = Math.floor((Date.now() - appState.timerStartTime) / 1000);
                updateTimerDisplay();
            }, 1000);
        } else {
            appState.elapsedTime = state.elapsed || 0;
        }
    } catch (error) {
        console.error('Error restoring timer state:', error);
        clearTimerState();
    }
}

// ========================================
// CAT USER HANDLERS
// ========================================

async function handleSelectCat(catId, hasPasscode) {
    if (hasPasscode) {
        showPasscodeDialog(catId);
    } else {
        await loginAsCat(catId);
    }
}

async function loginAsCat(catId) {
    try {
        const cat = await CatTrucker.get(catId);
        if (cat) {
            CatSession.setSession(catId, cat.nickname);
            appState.currentCat = cat;
            await loadUserData();
            navigateTo('Dashboard');
            render();
            showToast(getText('welcome.loggedIn', { CAT: cat.nickname }) || `${cat.nickname} is ready to haul!`, 'success');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        showToast(getText('errors.loginFailed') || 'Unable to load that cat profile.', 'error');
    }
}

function logoutCat() {
    // Clear timer if running
    if (appState.timerRunning) {
        pauseTimer();
    }
    clearTimerState();
    
    CatSession.clearSession();
    appState.currentCat = null;
    appState.projects = [];
    appState.timeEntries = [];
    appState.selectedProjectId = null;
    appState.elapsedTime = 0;
    
    navigateTo('Dashboard');
    render();
}

function handleSwitchCat() {
    logoutCat();
}

function showEditProfileDialog() {
    const cat = appState.currentCat;
    if (!cat) return;
    
    const specialties = [
        { value: 'ice_roads', label: getText('trucker.specialties.ice_roads') || 'Ice Road Expert' },
        { value: 'mountain_passes', label: getText('trucker.specialties.mountain_passes') || 'Mountain Pass Navigator' },
        { value: 'northern_lights', label: getText('trucker.specialties.northern_lights') || 'Northern Lights Guide' },
        { value: 'snow_drifts', label: getText('trucker.specialties.snow_drifts') || 'Snow Drift Specialist' },
        { value: 'blizzard_expert', label: getText('trucker.specialties.blizzard_expert') || 'Blizzard Master' }
    ];
    const currentAvatar = cat.avatar_url || DEFAULT_AVATAR;
    const modalContent = `
        <div class="p-6 max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-2">${getText('trucker.edit.title').replace('%CAT%', cat.nickname)}</h2>
            <p class="text-amber-700 mb-6">${getText('trucker.edit.description').replace('%CAT%', cat.nickname)}</p>
            
            <form id="edit-cat-form" class="space-y-5">
                <input type="hidden" name="avatar_url" id="edit-avatar-url" value="${currentAvatar}" />
                <div id="edit-avatar-selector">
                    ${typeof renderAvatarSelector === 'function' 
                        ? renderAvatarSelector(currentAvatar, 'handleEditCatAvatarSelect')
                        : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.edit.fullName')}</label>
                        <input type="text" 
                               name="full_name" 
                               value="${escapeHtml(cat.name || '')}"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="Aurora Snowpaw" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.edit.nickname')}</label>
                        <input type="text" 
                               name="nickname" 
                               required
                               value="${escapeHtml(cat.nickname || '')}"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="${getText('trucker.edit.nicknamePlaceholder') || 'Enter nickname'}" />
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.edit.years')}</label>
                        <input type="number"
                               name="years_of_service"
                               min="0"
                               value="${Number.isFinite(cat.years_of_service) ? cat.years_of_service : 0}"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="0" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.edit.favoriteRoute') || getText('trucker.new.favoriteRoute')}</label>
                        <input type="text"
                               name="favorite_route"
                               value="${escapeHtml(cat.favorite_route || '')}"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="Northern Lights Express" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.edit.specialty')}</label>
                    <select name="specialty" class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white">
                        ${specialties.map(s => `
                            <option value="${s.value}" ${cat.specialty === s.value ? 'selected' : ''}>
                                ${s.label}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="bg-amber-50/60 border border-amber-100 rounded-xl p-4 space-y-3">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" 
                               id="edit-passcode-toggle"
                               name="passcode_enabled"
                               ${cat.passcode_enabled ? 'checked' : ''}
                               class="w-4 h-4 text-amber-600 border-amber-300 rounded" />
                        <label for="edit-passcode-toggle" class="text-sm font-medium text-amber-900">
                            ${getText('trucker.edit.passEnable')}
                        </label>
                    </div>
                    <div id="edit-passcode-field" class="${cat.passcode_enabled ? '' : 'hidden'}">
                        <label class="block text-sm font-medium text-amber-800 mb-1" for="edit-passcode-input">
                            ${getText('trucker.edit.passLabel')}
                        </label>
                        <input type="password" 
                               id="edit-passcode-input"
                               name="passcode" 
                               maxlength="4"
                               pattern="[0-9]{4}"
                               ${cat.passcode_enabled ? '' : 'disabled'}
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="${getText('trucker.edit.passHintKeep')}" />
                        <p class="text-xs text-amber-600 mt-1">${getText('trucker.edit.passHintKeep')}</p>
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('common.saveChanges') || getText('common.save')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('edit-cat-form');
        if (form) {
            form.addEventListener('submit', handleUpdateProfile);
        }

        window.handleEditCatAvatarSelect = function(url) {
            const avatarInput = document.getElementById('edit-avatar-url');
            if (avatarInput) {
                avatarInput.value = url;
            }
            const avatarContainer = document.getElementById('edit-avatar-selector');
            if (avatarContainer && typeof renderAvatarSelector === 'function') {
                avatarContainer.innerHTML = renderAvatarSelector(url, 'handleEditCatAvatarSelect');
            }
        };

        const passToggle = document.getElementById('edit-passcode-toggle');
        const passField = document.getElementById('edit-passcode-field');
        const passInput = document.getElementById('edit-passcode-input');
        if (passToggle && passField && passInput) {
            passToggle.addEventListener('change', (event) => {
                const enabled = event.target.checked;
                passField.classList.toggle('hidden', !enabled);
                passInput.disabled = !enabled;
                if (!enabled) {
                    passInput.value = '';
                }
            });
        }
    }, 100);
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const cat = appState.currentCat;
    
    const updates = {
        name: (formData.get('full_name') || '').trim(),
        nickname: (formData.get('nickname') || '').trim(),
        specialty: formData.get('specialty'),
        avatar_url: formData.get('avatar_url') || cat.avatar_url || DEFAULT_AVATAR,
        years_of_service: Math.max(0, parseInt(formData.get('years_of_service'), 10) || 0),
        favorite_route: (formData.get('favorite_route') || '').trim(),
        passcode_enabled: formData.get('passcode_enabled') === 'on'
    };

    if (!updates.name || !updates.nickname) {
        showToast(getText('trucker.edit.validationName') || getText('trucker.new.validationName') || 'Full name and nickname are required', 'error');
        return;
    }
    
    // Handle passcode
    const newPasscode = formData.get('passcode');
    if (updates.passcode_enabled) {
        const trimmedPasscode = (newPasscode || '').trim();
        if (trimmedPasscode) {
            if (!/^\d{4}$/.test(trimmedPasscode)) {
                showToast(getText('trucker.new.passHintNew') || 'Passcode must be 4 digits', 'error');
                return;
            }
            updates.passcode = trimmedPasscode;
        } else {
            updates.passcode = cat.passcode || '';
        }
    } else if (!updates.passcode_enabled) {
        updates.passcode = '';
    }
    
    try {
        await CatTrucker.update(cat.cat_trucker_id, updates);
        appState.currentCat = { ...cat, ...updates };
        hideModal();
        showToast(getText('trucker.edit.success') || 'Profile updated!', 'success');
        render();
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(getText('errors.updateFailed') || 'Failed to update profile', 'error');
    }
}

async function showDeleteCatDialog() {
    const cat = appState.currentCat;
    if (!cat) return;

    const title = getText('trucker.delete.title') || 'Delete Cat Trucker';
    const bodyTitle = (getText('trucker.delete.bodyTitle') || '').replace('%CAT%', cat.nickname);
    const bodyText = getText('trucker.delete.bodyText') || '';
    const warning = getText('trucker.delete.warning') || '';
    const message = [bodyTitle, bodyText, warning].filter(Boolean).join(' ');

    const confirmed = await showConfirmDialog(
        title,
        message || `Are you sure you want to delete ${cat.nickname}? This will also delete all their routes and expedition logs.`,
        getText('trucker.delete.confirm') || getText('common.delete') || 'Delete',
        getText('trucker.delete.cancel') || getText('common.cancel') || 'Cancel'
    );

    if (!confirmed) return;

    try {
        // Delete associated time entries and projects first
        const projects = appState.projects || [];
        for (const project of projects) {
            // Delete time entries for this project
            const entries = (appState.timeEntries || []).filter(e => e.project_id === project.project_id);
            for (const entry of entries) {
                await TimeEntry.delete(entry.time_entry_id);
            }
            await Project.delete(project.project_id);
        }

        // Delete the cat
        await CatTrucker.delete(cat.cat_trucker_id);

        // Refresh cat list so welcome screen doesn't show stale profiles
        appState.cats = await CatTrucker.list();

        showToast(getText('trucker.delete.success') || 'Trucker deleted', 'success');
        logoutCat();
    } catch (error) {
        console.error('Error deleting cat:', error);
        showToast(getText('errors.deleteFailed') || 'Failed to delete trucker', 'error');
    }
}

// ========================================
// NEW CAT DIALOG
// ========================================

function showNewCatDialog() {
    const specialties = [
        { value: 'ice_roads', label: getText('trucker.specialties.ice_roads') || 'Ice Road Expert' },
        { value: 'mountain_passes', label: getText('trucker.specialties.mountain_passes') || 'Mountain Pass Navigator' },
        { value: 'northern_lights', label: getText('trucker.specialties.northern_lights') || 'Northern Lights Guide' },
        { value: 'snow_drifts', label: getText('trucker.specialties.snow_drifts') || 'Snow Drift Specialist' },
        { value: 'blizzard_expert', label: getText('trucker.specialties.blizzard_expert') || 'Blizzard Master' }
    ];

    const defaultAvatar = (AVATAR_OPTIONS && AVATAR_OPTIONS[0]) || DEFAULT_AVATAR;
    const modalContent = `
        <div class="p-6 max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-2">${getText('trucker.new.title')}</h2>
            <p class="text-amber-700 mb-6">${getText('trucker.new.description')}</p>
            
            <form id="new-cat-form" class="space-y-5">
                <input type="hidden" name="avatar_url" id="new-cat-avatar" value="${defaultAvatar}" />
                <div id="new-cat-avatar-selector">
                    ${typeof renderAvatarSelector === 'function' 
                        ? renderAvatarSelector(defaultAvatar, 'handleNewCatAvatarSelect')
                        : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.new.fullName')}</label>
                        <input type="text" 
                               name="full_name" 
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="Aurora Snowpaw" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.new.nickname')}</label>
                        <input type="text" 
                               name="nickname" 
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="Whiskers, Paws, etc." />
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.new.years')}</label>
                        <input type="number"
                               name="years_of_service"
                               min="0"
                               value="0"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="0" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.new.favoriteRoute')}</label>
                        <input type="text"
                               name="favorite_route"
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="Northern Lights Express" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('trucker.new.specialty')}</label>
                    <select name="specialty" 
                            class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white">
                        ${specialties.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
                    </select>
                </div>

                <div class="bg-amber-50/60 border border-amber-100 rounded-xl p-4 space-y-3">
                    <div class="flex items-center gap-3">
                        <input type="checkbox" 
                               id="new-cat-passcode-toggle"
                               name="passcode_enabled"
                               class="w-4 h-4 text-amber-600 border-amber-300 rounded" />
                        <label for="new-cat-passcode-toggle" class="text-sm font-medium text-amber-900">
                            ${getText('trucker.new.passEnable')}
                        </label>
                    </div>
                    <div id="new-cat-passcode-field" class="hidden">
                        <label class="block text-sm font-medium text-amber-800 mb-1" for="new-cat-passcode-input">
                            ${getText('trucker.new.passLabel')}
                        </label>
                        <input type="password" 
                               id="new-cat-passcode-input"
                               name="passcode" 
                               maxlength="4"
                               pattern="[0-9]{4}"
                               disabled
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                               placeholder="${getText('trucker.new.passHint')}" />
                        <p class="text-xs text-amber-600 mt-1">${getText('trucker.new.passHint')}</p>
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('trucker.new.addButton')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('new-cat-form');
        if (form) {
            form.addEventListener('submit', handleCreateCat);
        }

        window.handleNewCatAvatarSelect = function(url) {
            const avatarInput = document.getElementById('new-cat-avatar');
            if (avatarInput) {
                avatarInput.value = url;
            }
            const avatarContainer = document.getElementById('new-cat-avatar-selector');
            if (avatarContainer && typeof renderAvatarSelector === 'function') {
                avatarContainer.innerHTML = renderAvatarSelector(url, 'handleNewCatAvatarSelect');
            }
        };

        const passToggle = document.getElementById('new-cat-passcode-toggle');
        const passField = document.getElementById('new-cat-passcode-field');
        const passInput = document.getElementById('new-cat-passcode-input');
        if (passToggle && passField && passInput) {
            passToggle.addEventListener('change', (event) => {
                const enabled = event.target.checked;
                passField.classList.toggle('hidden', !enabled);
                passInput.disabled = !enabled;
                if (!enabled) {
                    passInput.value = '';
                }
            });
        }
    }, 100);
}

async function handleCreateCat(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const fullName = (formData.get('full_name') || '').trim();
    const nickname = (formData.get('nickname') || '').trim();
    const specialty = formData.get('specialty');
    const avatarUrl = formData.get('avatar_url') || DEFAULT_AVATAR;
    const yearsOfService = parseInt(formData.get('years_of_service'), 10);
    const favoriteRoute = (formData.get('favorite_route') || '').trim();
    const passcodeEnabled = formData.get('passcode_enabled') === 'on';
    const passcodeValue = (formData.get('passcode') || '').trim();

    if (!fullName || !nickname) {
        showToast(getText('trucker.new.validationName') || 'Full name and nickname are required.', 'error');
        return;
    }

    if (passcodeEnabled && !/^\d{4}$/.test(passcodeValue)) {
        showToast(getText('trucker.new.passHint') || 'Passcode must be 4 digits.', 'error');
        return;
    }

    const catData = {
        name: fullName,
        nickname,
        specialty,
        years_of_service: Number.isFinite(yearsOfService) && yearsOfService >= 0 ? yearsOfService : 0,
        favorite_route: favoriteRoute,
        avatar_url: avatarUrl,
        passcode_enabled: passcodeEnabled,
        passcode: passcodeEnabled ? passcodeValue : ''
    };
    
    try {
        const newCat = await CatTrucker.create(catData);
        appState.cats = await CatTrucker.list();
        
        hideModal();
        showToast(`Welcome ${newCat.nickname} to the trucking team!`, 'success');
        
        // Auto-login
        await loginAsCat(newCat.cat_trucker_id);
        
    } catch (error) {
        console.error('Error creating cat:', error);
        showToast('Failed to create trucker. Please try again.', 'error');
    }
}

// ========================================
// PASSCODE DIALOG
// ========================================

function showPasscodeDialog(catId) {
    const cat = appState.cats.find(c => c.cat_trucker_id === catId) || null;
    const avatarUrl = cat?.avatar_url || DEFAULT_AVATAR;
    const nickname = cat?.nickname || '';
    const instruction = nickname
        ? (getText('trucker.passcode.enterCode') || 'Enter the 4-digit code for %CAT%').replace('%CAT%', nickname)
        : getText('trucker.passcode.enterCodeGeneric') || 'Enter the 4-digit passcode to continue';
    
    const modalContent = `
        <div class="relative overflow-hidden bg-white rounded-3xl shadow-2xl max-w-sm mx-auto border-4 border-amber-50">
            <!-- Decorative background paws -->
            <div class="absolute top-0 right-0 -mt-6 -mr-6 text-amber-50 transform rotate-12 pointer-events-none">
                ${icons.paw.replace('h-6 w-6', 'h-40 w-40')}
            </div>
            <div class="absolute bottom-0 left-0 -mb-6 -ml-6 text-amber-50 transform -rotate-12 pointer-events-none">
                ${icons.paw.replace('h-6 w-6', 'h-32 w-32')}
            </div>

            <div class="relative z-10 p-8">
                <div class="flex flex-col items-center text-center space-y-5">
                    <!-- Header with Lock -->
                    <div class="flex items-center gap-2 text-amber-500/80 font-bold text-xs uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
                        ${icons.lock.replace('h-6 w-6', 'h-3 w-3')}
                        <span>Protected Paws Area</span>
                    </div>

                    <!-- Avatar -->
                    <div class="relative group">
                        <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-amber-100 group-hover:ring-amber-200 transition-all duration-300">
                            <img src="${avatarUrl}" alt="${nickname || 'Cat'}" class="w-full h-full object-cover" />
                        </div>
                        <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md text-amber-400 ring-2 ring-amber-50">
                            ${icons.paw.replace('h-6 w-6', 'h-5 w-5')}
                        </div>
                    </div>

                    <!-- Title & Instruction -->
                    <div class="space-y-2">
                        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">${getText('trucker.passcode.dialogTitle')}</h2>
                        <p class="text-amber-700/70 text-sm max-w-[220px] mx-auto leading-relaxed font-medium">${instruction}</p>
                    </div>
                    
                    <!-- Error Message -->
                    <div id="passcode-error" class="hidden flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-xl animate-bounce border border-red-100">
                        ${icons.alertCircle.replace('h-5 w-5', 'h-4 w-4')}
                        <span>${getText('trucker.passcode.error')}</span>
                    </div>

                    <!-- Input Fields -->
                    <div class="py-2 flex justify-center gap-3" id="passcode-input-group">
                        ${[0,1,2,3].map(i => `
                            <input type="text"
                                   inputmode="numeric"
                                   maxlength="1"
                                   data-passcode-index="${i}"
                                   class="passcode-digit w-12 h-14 text-center text-2xl font-bold text-amber-900 border-2 border-amber-100 rounded-2xl bg-amber-50/30 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 focus:bg-white transition-all duration-200 outline-none shadow-sm placeholder-amber-200" />
                        `).join('')}
                    </div>

                    <!-- Quote -->
                    <p class="text-center text-gray-400 text-xs italic font-medium">"${getText('trucker.passcode.quote')}"</p>

                    <!-- Cancel Button -->
                    <div class="pt-2 w-full">
                        <button type="button" 
                                onclick="hideModal()" 
                                class="w-full group flex items-center justify-center gap-2 px-6 py-3 border-2 border-amber-100 text-amber-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 rounded-xl transition-all duration-200 font-bold text-sm">
                            <span>${getText('trucker.passcode.cancel')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const digitInputs = Array.from(document.querySelectorAll('[data-passcode-index]'));
        if (digitInputs.length !== 4) return;
        const errorEl = document.getElementById('passcode-error');
        const passcodeState = ['', '', '', ''];
        
        const setErrorVisible = (visible) => {
            if (!errorEl) return;
            errorEl.classList.toggle('hidden', !visible);
            digitInputs.forEach(input => {
                input.classList.toggle('border-red-500', visible);
            });
        };
        
        const resetInputs = () => {
            passcodeState.fill('');
            digitInputs.forEach(input => input.value = '');
            digitInputs[0].focus();
        };
        
        const tryVerify = async () => {
            if (passcodeState.some(d => d === '')) return;
            const code = passcodeState.join('');
            const success = await verifyPasscode(catId, code);
            if (!success) {
                setErrorVisible(true);
                resetInputs();
            }
        };
        
        const handlePaste = (text) => {
            if (/^\d{4}$/.test(text)) {
                text.split('').forEach((char, idx) => {
                    passcodeState[idx] = char;
                    digitInputs[idx].value = char;
                });
                setErrorVisible(false);
                tryVerify();
            }
        };
        
        digitInputs.forEach((input, index) => {
            input.addEventListener('input', (event) => {
                const value = event.target.value.replace(/\D/g, '').slice(-1);
                event.target.value = value;
                passcodeState[index] = value;
                setErrorVisible(false);
                if (value && index < 3) {
                    digitInputs[index + 1].focus();
                }
                if (!value && index > 0) {
                    passcodeState[index] = '';
                }
                if (passcodeState.every(d => d !== '')) {
                    tryVerify();
                }
            });
            
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Backspace') {
                    if (passcodeState[index]) {
                        passcodeState[index] = '';
                        input.value = '';
                        event.preventDefault();
                        return;
                    }
                    if (index > 0) {
                        digitInputs[index - 1].focus();
                        passcodeState[index - 1] = '';
                        digitInputs[index - 1].value = '';
                        event.preventDefault();
                    }
                } else if (event.key === 'ArrowLeft' && index > 0) {
                    digitInputs[index - 1].focus();
                    event.preventDefault();
                } else if (event.key === 'ArrowRight' && index < 3) {
                    digitInputs[index + 1].focus();
                    event.preventDefault();
                } else if (event.key === 'Enter') {
                    if (passcodeState.every(d => d !== '')) {
                        tryVerify();
                    }
                }
            });
            
            input.addEventListener('paste', (event) => {
                const pasted = (event.clipboardData || window.clipboardData)?.getData('text') || '';
                if (/^\d{4}$/.test(pasted)) {
                    event.preventDefault();
                    handlePaste(pasted);
                }
            });
        });
        
        digitInputs[0].focus();
    }, 100);
}

async function verifyPasscode(catId, code) {
    if (!code || !/^\d{4}$/.test(code)) {
        return false;
    }

    try {
        const cat = await CatTrucker.get(catId);
        if (!cat) {
            showToast(getText('errors.catNotFound') || 'Cat not found', 'error');
            return false;
        }

        if (!cat.passcode_enabled) {
            hideModal();
            await loginAsCat(catId);
            return true;
        }

        const storedPasscode = (cat.passcode || '').trim();
        if (storedPasscode === code) {
            hideModal();
            await loginAsCat(catId);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error verifying passcode:', error);
        showToast(getText('errors.passcodeVerify') || 'Failed to verify passcode', 'error');
        return false;
    }
}

// ========================================
// PROJECT HANDLERS
// ========================================

function showNewProjectDialog() {
    const colors = [
        '#f59e0b', '#ef4444', '#10b981', '#3b82f6', 
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    
    const modalContent = `
        <div class="p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-2">${getText('projects.new')}</h2>
            <p class="text-amber-700 mb-6">${getText('projects.newDesc')}</p>
            
            <form id="new-project-form" class="space-y-4">
                <div>
                          <label class="block text-sm font-medium text-amber-800 mb-1">${getText('projects.projectName')}</label>
                    <input type="text" 
                           name="name" 
                           required
                           class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                              placeholder="${getText('projects.placeholders.nameGeneric') || getText('projects.placeholders.name')}" />
                </div>
                
                <div>
                          <label class="block text-sm font-medium text-amber-800 mb-1">${getText('projects.projectDescription')}</label>
                    <textarea name="description" 
                              rows="2"
                              class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                              placeholder="${getText('projects.placeholders.description')}"></textarea>
                </div>
                
                <div>
                          <label class="block text-sm font-medium text-amber-800 mb-2">${getText('projects.color')}</label>
                    <div class="flex gap-2 flex-wrap">
                        ${colors.map((color, i) => `
                            <label class="cursor-pointer">
                                <input type="radio" 
                                       name="color" 
                                       value="${color}" 
                                       ${i === 0 ? 'checked' : ''}
                                       class="hidden peer" />
                                <div class="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-white"
                                     style="background-color: ${color}"></div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('projects.createProject')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('new-project-form');
        if (form) {
            form.addEventListener('submit', handleCreateProject);
        }
    }, 100);
}

async function handleCreateProject(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const projectData = {
        cat_trucker_id: appState.currentCat.cat_trucker_id,
        name: formData.get('name'),
        description: formData.get('description') || '',
        color: formData.get('color') || '#f59e0b',
        is_archived: false
    };
    
    try {
        await Project.create(projectData);
        await loadUserData();
        
        hideModal();
        showToast(getText('projects.created') || 'Route created successfully.', 'success');
        render();
        
    } catch (error) {
        console.error('Error creating project:', error);
        showToast(getText('errors.createFailed') || 'Could not create that route.', 'error');
    }
}

function showEditProjectDialog(projectId) {
    const project = appState.projects.find(p => p.project_id === projectId);
    if (!project) return;
    
    const colors = [
        '#f59e0b', '#ef4444', '#10b981', '#3b82f6', 
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
    ];
    
    const modalContent = `
        <div class="p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-6">${getText('projects.edit')}</h2>
            
            <form id="edit-project-form" class="space-y-4">
                <input type="hidden" name="project_id" value="${project.project_id}" />
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('projects.projectName')}</label>
                    <input type="text" 
                           name="name" 
                           required
                           value="${escapeHtml(project.name)}"
                           class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('projects.projectDescription')}</label>
                    <textarea name="description" 
                              rows="2"
                              class="w-full px-3 py-2 border border-amber-200 rounded-lg">${escapeHtml(project.description || '')}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-2">${getText('projects.color')}</label>
                    <div class="flex gap-2 flex-wrap">
                        ${colors.map(color => `
                            <label class="cursor-pointer">
                                <input type="radio" 
                                       name="color" 
                                       value="${color}" 
                                       ${project.color === color ? 'checked' : ''}
                                       class="hidden peer" />
                                <div class="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-white"
                                     style="background-color: ${color}"></div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('common.save')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('edit-project-form');
        if (form) {
            form.addEventListener('submit', handleUpdateProject);
        }
    }, 100);
}

async function handleUpdateProject(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const projectId = formData.get('project_id');
    
    const updates = {
        name: formData.get('name'),
        description: formData.get('description') || '',
        color: formData.get('color')
    };
    
    try {
        await Project.update(projectId, updates);
        await loadUserData();
        
        hideModal();
        showToast(getText('projects.updated') || 'Route updated successfully.', 'success');
        render();
        
    } catch (error) {
        console.error('Error updating project:', error);
        showToast(getText('errors.updateFailed') || 'Could not update that route.', 'error');
    }
}

async function handleArchiveProject(projectId) {
    const project = appState.projects.find(p => p.project_id === projectId);
    if (!project) return;
    
    const action = project.is_archived ? 'unarchive' : 'archive';
    
    const confirmed = await showConfirmDialog(
        getText(`projects.${action}Confirm`),
        getText(`projects.${action}ConfirmDesc`, { NAME: project.name })
    );
    
    if (confirmed) {
        try {
            await Project.update(projectId, { is_archived: !project.is_archived });
            await loadUserData();
            showToast(getText(`projects.${action}d`) || 'Route status updated.', 'success');
            render();
        } catch (error) {
            console.error('Error archiving project:', error);
            showToast(getText('errors.updateFailed') || 'Could not update that route.', 'error');
        }
    }
}

async function handleDeleteProject(projectId) {
    const project = appState.projects.find(p => p.project_id === projectId);
    if (!project) return;
    
    const confirmed = await showConfirmDialog(
        getText('projects.deleteConfirm'),
        getText('projects.deleteConfirmDesc', { NAME: project.name })
    );
    
    if (confirmed) {
        try {
            await Project.delete(projectId);
            await loadUserData();
            
            // Clear selected if was this project
            if (appState.selectedProjectId === projectId) {
                appState.selectedProjectId = null;
            }
            
            showToast(getText('projects.deleted') || 'Route deleted.', 'success');
            render();
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast(getText('errors.deleteFailed') || 'Could not delete that route.', 'error');
        }
    }
}

// ========================================
// TIME ENTRY HANDLERS
// ========================================

function showAddTimeEntryDialog() {
    const projects = appState.projects.filter(p => !p.is_archived);
    const today = new Date().toISOString().split('T')[0];
    
    const modalContent = `
        <div class="p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-6">${getText('timer.addManual')}</h2>
            
            <form id="add-entry-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.route')}</label>
                    <select name="project_id" required class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white">
                        ${projects.map(p => `
                            <option value="${p.project_id}" ${p.project_id === appState.selectedProjectId ? 'selected' : ''}>
                                ${escapeHtml(p.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.date')}</label>
                    <input type="date" 
                           name="date" 
                           value="${today}"
                           max="${today}"
                           required
                           class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.startTime')}</label>
                        <input type="time" 
                               name="start_time" 
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.endTime')}</label>
                        <input type="time" 
                               name="end_time" 
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.description')}</label>
                    <textarea name="description" 
                              rows="2"
                              class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                              placeholder="${getText('timer.editLog.descriptionPlaceholder')}"></textarea>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('timer.editLog.save') || getText('common.save')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('add-entry-form');
        if (form) {
            form.addEventListener('submit', handleAddTimeEntry);
        }
    }, 100);
}

async function handleAddTimeEntry(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const startTime = formData.get('start_time');
    const endTime = formData.get('end_time');
    
    // Calculate duration
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    if (durationMinutes <= 0) {
        durationMinutes += 24 * 60; // Support overnight hauls that end after midnight
    }
    
    const entryData = {
        cat_trucker_id: appState.currentCat.cat_trucker_id,
        project_id: formData.get('project_id'),
        date: formData.get('date'),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        description: formData.get('description') || ''
    };
    
    try {
        await TimeEntry.create(entryData);
        await loadUserData();
        
        hideModal();
        showToast(getText('timer.entrySaved') || 'Expedition saved!', 'success');
        render();
        
    } catch (error) {
        console.error('Error adding time entry:', error);
        showToast(getText('errors.saveFailed') || 'Could not save this expedition.', 'error');
    }
}

function showEditTimeEntryDialog(entryId) {
    const entry = appState.timeEntries.find(e => e.time_entry_id === entryId);
    if (!entry) return;
    
    const projects = appState.projects.filter(p => !p.is_archived);
    
    const modalContent = `
        <div class="p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-6">${getText('timer.editEntry')}</h2>
            
            <form id="edit-entry-form" class="space-y-4">
                <input type="hidden" name="time_entry_id" value="${entry.time_entry_id}" />
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.route')}</label>
                    <select name="project_id" required class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white">
                        ${projects.map(p => `
                            <option value="${p.project_id}" ${p.project_id === entry.project_id ? 'selected' : ''}>
                                ${escapeHtml(p.name)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.date')}</label>
                    <input type="date" 
                           name="date" 
                           value="${entry.date}"
                           required
                           class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.startTime')}</label>
                        <input type="time" 
                               name="start_time" 
                               value="${entry.start_time || ''}"
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.endTime')}</label>
                        <input type="time" 
                               name="end_time" 
                               value="${entry.end_time || ''}"
                               required
                               class="w-full px-3 py-2 border border-amber-200 rounded-lg" />
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.description')}</label>
                    <textarea name="description" 
                              rows="2"
                              class="w-full px-3 py-2 border border-amber-200 rounded-lg">${escapeHtml(entry.description || '')}</textarea>
                </div>
                
                <div class="flex justify-between pt-4">
                    <button type="button" 
                            onclick="handleDeleteTimeEntry('${entry.time_entry_id}')"
                            class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        ${getText('common.delete')}
                    </button>
                    <div class="flex gap-2">
                        <button type="button" 
                                onclick="hideModal()" 
                                class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                            ${getText('common.cancel')}
                        </button>
                        <button type="submit" 
                                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                            ${getText('common.save')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('edit-entry-form');
        if (form) {
            form.addEventListener('submit', handleUpdateTimeEntry);
        }
    }, 100);
}

async function handleUpdateTimeEntry(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const entryId = formData.get('time_entry_id');
    
    const startTime = formData.get('start_time');
    const endTime = formData.get('end_time');
    
    // Calculate duration
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    if (durationMinutes <= 0) {
        durationMinutes += 24 * 60;
    }
    
    const updates = {
        project_id: formData.get('project_id'),
        date: formData.get('date'),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        description: formData.get('description') || ''
    };
    
    try {
        await TimeEntry.update(entryId, updates);
        await loadUserData();
        
        hideModal();
        showToast(getText('timer.entryUpdated') || 'Expedition updated.', 'success');
        render();
        
    } catch (error) {
        console.error('Error updating time entry:', error);
        showToast(getText('errors.updateFailed') || 'Could not update this expedition.', 'error');
    }
}

async function handleDeleteTimeEntry(entryId) {
    const confirmed = await showConfirmDialog(
        getText('timer.deleteEntryConfirm'),
        getText('timer.deleteEntryConfirmDesc')
    );
    
    if (confirmed) {
        try {
            await TimeEntry.delete(entryId);
            await loadUserData();
            
            hideModal();
            showToast(getText('timer.entryDeleted') || 'Expedition deleted.', 'success');
            render();
        } catch (error) {
            console.error('Error deleting time entry:', error);
            showToast(getText('errors.deleteFailed') || 'Could not delete this expedition.', 'error');
        }
    }
}

// ========================================
// SAVE TIMER ENTRY DIALOG
// ========================================

function showSaveTimerDialog() {
    const modalContent = `
        <div class="p-6 max-w-md mx-auto">
            <h2 class="text-2xl font-bold text-amber-900 mb-4">${getText('timer.saveEntry')}</h2>
            <p class="text-amber-700 mb-4">${getText('timer.saveEntryDesc', { TIME: formatTimeDisplay(appState.elapsedTime) })}</p>
            
            <form id="save-timer-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-amber-800 mb-1">${getText('timer.editLog.description')}</label>
                    <textarea name="description" 
                              rows="3"
                              class="w-full px-3 py-2 border border-amber-200 rounded-lg"
                              placeholder="${getText('timer.editLog.descriptionPlaceholder')}"></textarea>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button type="button" 
                            onclick="hideModal()" 
                            class="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg">
                        ${getText('common.cancel')}
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        ${getText('timer.save')}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    setTimeout(() => {
        const form = document.getElementById('save-timer-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                hideModal();
                saveTimeEntry(formData.get('description'));
            });
        }
    }, 100);
}

// ========================================
// BACKUP HANDLERS
// ========================================

async function handleCreateBackup() {
    try {
        const data = await exportAllData();
        const filename = `arctic_trucking_backup_${new Date().toISOString().split('T')[0]}.json`;
        downloadJson(data, filename);
        
        // Update last backup date
        saveBackupSettings({ ...getBackupSettings(), lastBackupDate: new Date().toISOString() });
        
        showToast(getText('backup.created') || 'Backup created and downloaded.', 'success');
        render();
    } catch (error) {
        console.error('Error creating backup:', error);
        showToast(getText('errors.backupFailed') || 'Backup failed. Please try again.', 'error');
    }
}

async function handleQuickBackup() {
    await handleCreateBackup();
}

async function handleFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const fileLabel = file.name || getText('backup.restoreBackup');
    const confirmed = await showConfirmDialog(
        getText('importConfirm.title'),
        getText('importConfirm.description', { FILE: fileLabel }),
        getText('importConfirm.action'),
        getText('common.cancel')
    );
    
    if (!confirmed) {
        event.target.value = '';
        return;
    }
    
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        await importAllData(data);
        
        // Reload everything
        appState.cats = await CatTrucker.list();
        if (appState.currentCat) {
            await loadUserData();
        }
        
        showToast(getText('backup.restored') || 'Backup restored successfully.', 'success');
        render();
    } catch (error) {
        console.error('Error importing backup:', error);
        showToast(getText('errors.importFailed') || 'Import failed. Check the file and try again.', 'error');
    }
    
    event.target.value = '';
}

function handleScheduleChange(schedule) {
    const settings = getBackupSettings();
    saveBackupSettings({ ...settings, schedule });
    render();
}

async function exportAllData() {
    const [catTruckers, projects, timeEntries] = await Promise.all([
        CatTrucker.list(),
        Project.list(),
        TimeEntry.list()
    ]);
    return {
        catTruckers,
        projects,
        timeEntries,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
    };
}

async function importAllData(data) {
    if (!data || !Array.isArray(data.catTruckers) || !Array.isArray(data.projects) || !Array.isArray(data.timeEntries)) {
        throw new Error('Invalid backup payload');
    }

    await localDB.clearAllData();

    if (data.catTruckers.length) {
        await localDB.CatTrucker.bulkCreate(data.catTruckers);
    }
    if (data.projects.length) {
        await localDB.Project.bulkCreate(data.projects);
    }
    if (data.timeEntries.length) {
        const projectCatMap = new Map();
        data.projects.forEach(project => {
            if (project?.project_id && project?.cat_trucker_id) {
                projectCatMap.set(project.project_id, project.cat_trucker_id);
            }
        });

        const normalizedEntries = data.timeEntries.map(entry => {
            if (!entry.cat_trucker_id && entry.project_id && projectCatMap.has(entry.project_id)) {
                return { ...entry, cat_trucker_id: projectCatMap.get(entry.project_id) };
            }
            return entry;
        });

        await localDB.TimeEntry.bulkCreate(normalizedEntries);
    }
}

// ========================================
// CSV EXPORT
// ========================================

function exportStatsCSV() {
    const entries = appState.timeEntries || [];
    const projectTotals = {};
    
    entries.forEach(entry => {
        const name = entry.project?.name || 'Unknown';
        if (!projectTotals[name]) {
            projectTotals[name] = 0;
        }
        projectTotals[name] += entry.duration_minutes || 0;
    });
    
    let csv = 'Route,Total Hours\n';
    Object.entries(projectTotals).forEach(([name, minutes]) => {
        csv += `"${name}",${(minutes / 60).toFixed(2)}\n`;
    });
    
    downloadCSV(csv, `arctic_trucking_stats_${new Date().toISOString().split('T')[0]}.csv`);
}

function exportLogCSV() {
    const entries = appState.timeEntries || [];
    
    let csv = 'Date,Route,Start Time,End Time,Duration (hours),Description\n';
    entries.forEach(entry => {
        const hours = ((entry.duration_minutes || 0) / 60).toFixed(2);
        csv += `${entry.date},"${entry.project?.name || 'Unknown'}",${entry.start_time || ''},${entry.end_time || ''},${hours},"${(entry.description || '').replace(/"/g, '""')}"\n`;
    });
    
    downloadCSV(csv, `arctic_trucking_log_${new Date().toISOString().split('T')[0]}.csv`);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// EVENT HANDLERS FOR COMPONENTS
// ========================================

function selectProject(projectId, options = {}) {
    if (!projectId) return;
    appState.selectedProjectId = projectId;
    saveTimerState();
    if (options.closeDropdown !== false) {
        const dropdown = document.getElementById('project-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
    render();
}

// Make all handlers global
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.adjustTimer = adjustTimer;
window.showSaveTimerDialog = showSaveTimerDialog;
window.handleSelectCat = handleSelectCat;
window.loginAsCat = loginAsCat;
window.logoutCat = logoutCat;
window.handleSwitchCat = handleSwitchCat;
window.showEditProfileDialog = showEditProfileDialog;
window.showDeleteCatDialog = showDeleteCatDialog;
window.verifyPasscode = verifyPasscode;
window.showNewCatDialog = showNewCatDialog;
window.showNewProjectDialog = showNewProjectDialog;
window.showEditProjectDialog = showEditProjectDialog;
window.handleArchiveProject = handleArchiveProject;
window.handleDeleteProject = handleDeleteProject;
window.showAddTimeEntryDialog = showAddTimeEntryDialog;
window.showEditTimeEntryDialog = showEditTimeEntryDialog;
window.handleDeleteTimeEntry = handleDeleteTimeEntry;
window.saveTimerEntry = saveTimerEntry;
window.handleCreateBackup = handleCreateBackup;
window.handleQuickBackup = handleQuickBackup;
window.handleFileImport = handleFileImport;
window.handleScheduleChange = handleScheduleChange;
window.exportStatsCSV = exportStatsCSV;
window.exportLogCSV = exportLogCSV;
window.navigateTo = navigateTo;
window.render = render;
window.selectProject = selectProject;

// ========================================
// START APP
// ========================================

document.addEventListener('DOMContentLoaded', initApp);
