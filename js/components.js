// ========================================
// COMPONENTS - Reusable UI Components
// ========================================

// ========================================
// LANGUAGE SELECTOR
// ========================================

function renderLanguageSelector() {
    const currentLang = getLanguage();
    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];

    const current = languages.find(l => l.code === currentLang) || languages[0];

    const globeIcon = `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.6 9h16.8"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.6 15h16.8"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.5 3c-3 3-3 15 0 18"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.5 3c3 3 3 15 0 18"></path></svg>`;
    
    return `
        <div class="relative">
            <button type="button"
                    onclick="toggleDropdown('language-menu')"
                    class="text-amber-300 hover:bg-amber-700 hover:text-white flex items-center gap-1.5 p-2 rounded-md">
                ${globeIcon}
                <span class="hidden md:inline">${current.flag}</span>
            </button>

            <div id="language-menu" class="hidden absolute right-0 mt-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg py-1 z-50">
                ${languages.map(lang => {
                    const isCurrent = lang.code === currentLang;
                    return `
                        <button type="button"
                                onclick="setLanguage('${lang.code}'); window.location.reload();"
                                class="w-full px-3 py-2 text-left text-sm text-amber-900 hover:bg-amber-100 flex items-center gap-2 ${isCurrent ? 'font-bold bg-amber-100' : ''}">
                            <span>${lang.flag}</span>
                            <span>${lang.name}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ========================================
// NAVIGATION ITEM
// ========================================

function renderNavItem(item, currentPage) {
    const isActive = currentPage === item.pageName;
    const activeClass = isActive 
        ? 'bg-amber-900 text-white' 
        : 'text-amber-300 hover:bg-amber-700 hover:text-white';
    
    return `
        <a href="${createPageUrl(item.pageName)}" 
           class="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${activeClass}"
           onclick="appState.sidebarOpen = false;">
            <div class="flex items-center">
                ${item.icon}
                <span class="ml-3">${escapeHtml(item.name)}</span>
            </div>
            ${item.showBadge ? '<div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Backup reminder due"></div>' : ''}
        </a>
    `;
}

// ========================================
// STATS CARD
// ========================================

function renderStatsCard(title, value, subtitle, extraLine = '', icon = '') {
    return `
        <div class="p-6 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-amber-700">${escapeHtml(title)}</h3>
                ${icon}
            </div>
            <p class="text-3xl font-bold text-amber-900">${escapeHtml(value)}</p>
            ${subtitle ? `<p class="text-sm text-amber-600 mt-1">${escapeHtml(subtitle)}</p>` : ''}
            ${extraLine ? `<p class="text-xs text-amber-500">${escapeHtml(extraLine)}</p>` : ''}
        </div>
    `;
}

// ========================================
// PROJECT CARD (Dashboard)
// ========================================

function renderDashboardProjectCard(project, stats) {
    const todayTime = formatDuration(stats.today || 0);
    const weekTime = formatDuration(stats.week || 0);
    const monthTime = formatDuration(stats.month || 0);
    
    return `
        <div class="p-4 rounded-lg border border-amber-200 bg-white/80 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-4 h-4 rounded-full" style="background-color: ${project.color || '#f59e0b'}"></div>
                <h3 class="font-semibold text-amber-900 truncate">${escapeHtml(project.name)}</h3>
            </div>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-amber-600">${getText('dashboard.projectCard.today')}</span>
                    <span class="font-medium text-amber-900">${todayTime}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-amber-600">${getText('dashboard.projectCard.week')}</span>
                    <span class="font-medium text-amber-900">${weekTime}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-amber-600">${getText('dashboard.projectCard.month')}</span>
                    <span class="font-medium text-amber-900">${monthTime}</span>
                </div>
            </div>
            <a href="${createPageUrl('Reports')}?project_id=${project.project_id}" 
               class="mt-4 block text-center text-sm text-amber-700 hover:text-amber-900 border-t border-amber-100 pt-3">
                ${getText('dashboard.projectCard.viewLogs')} →
            </a>
        </div>
    `;
}

// ========================================
// PROJECT CARD (Projects Page)
// ========================================

function renderProjectCard(project, onEdit, onArchive, onRestore, onDelete) {
    const isArchived = project.is_archived;
    
    return `
        <div class="p-4 rounded-lg border border-amber-200 bg-white/80 hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${project.color || '#f59e0b'}"></div>
                    <h3 class="font-semibold text-amber-900">${escapeHtml(project.name)}</h3>
                </div>
                <div class="relative">
                    <button onclick="toggleProjectMenu('${project.project_id}')" 
                            class="p-1 rounded hover:bg-amber-100 text-amber-600">
                        ${icons.moreVertical}
                    </button>
                    <div id="project-menu-${project.project_id}" class="hidden absolute right-0 top-8 bg-white border border-amber-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                        <button onclick="showEditProjectDialog('${project.project_id}')" 
                                class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                            ${icons.edit} ${getText('projects.edit')}
                        </button>
                        ${isArchived ? `
                            <button onclick="handleArchiveProject('${project.project_id}')" 
                                    class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                ${icons.restore} ${getText('projects.restore')}
                            </button>
                        ` : `
                            <button onclick="handleArchiveProject('${project.project_id}')" 
                                    class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                                ${icons.archive} ${getText('projects.archive')}
                            </button>
                        `}
                        <button onclick="handleDeleteProject('${project.project_id}')" 
                                class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            ${icons.trash} ${getText('projects.deleteProject')}
                        </button>
                    </div>
                </div>
            </div>
            ${project.description ? `<p class="text-sm text-amber-600 mb-3">${escapeHtml(project.description)}</p>` : ''}
            <a href="${createPageUrl('Timer')}?project_id=${project.project_id}" 
               class="inline-block text-sm text-amber-700 hover:text-amber-900">
                ${icons.clock} Start Timer →
            </a>
        </div>
    `;
}

function toggleProjectMenu(projectId) {
    const menu = document.getElementById(`project-menu-${projectId}`);
    // Close all other menus
    document.querySelectorAll('[id^="project-menu-"]').forEach(m => {
        if (m.id !== `project-menu-${projectId}`) {
            m.classList.add('hidden');
        }
    });
    menu.classList.toggle('hidden');
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('[id^="project-menu-"]') && !e.target.closest('button')) {
        document.querySelectorAll('[id^="project-menu-"]').forEach(m => m.classList.add('hidden'));
    }
});

// ========================================
// TIME ENTRY ROW
// ========================================

function renderTimeEntryRow(entry, showActions = true) {
    const projectName = entry.project?.name || getText('common.unknownRoute');
    const projectColor = entry.project?.color || '#f59e0b';
    const startTime = formatTime(entry.start_time);
    const endTime = formatTime(entry.end_time);
    const duration = formatDuration(entry.duration_minutes);
    const description = entry.description || getText('common.noCargoDetails');
    
    return `
        <tr class="border-b border-amber-100 hover:bg-amber-50/50">
            <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" style="background-color: ${projectColor}"></div>
                    <span class="text-amber-900">${escapeHtml(projectName)}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-amber-700">${startTime} - ${endTime}</td>
            <td class="px-4 py-3 text-amber-900 font-medium">${duration}</td>
            <td class="px-4 py-3 text-amber-600 truncate max-w-xs">${escapeHtml(description)}</td>
            ${showActions ? `
                <td class="px-4 py-3">
                    <div class="flex gap-2">
                        <button onclick="showEditTimeEntryDialog('${entry.time_entry_id}')" 
                                class="p-1 rounded hover:bg-amber-100 text-amber-600" title="Edit">
                            ${icons.edit}
                        </button>
                        <button onclick="handleDeleteTimeEntry('${entry.time_entry_id}')" 
                                class="p-1 rounded hover:bg-red-100 text-red-600" title="Delete">
                            ${icons.trash}
                        </button>
                    </div>
                </td>
            ` : ''}
        </tr>
    `;
}

// ========================================
// PROJECT SELECTOR DROPDOWN
// ========================================

function renderProjectSelector(projects, selectedProjectId) {
    const activeProjects = projects.filter(p => !p.is_archived);
    const selected = activeProjects.find(p => p.project_id === selectedProjectId);
    
    return `
        <div class="relative">
            <button onclick="toggleDropdown('project-dropdown')" 
                    class="w-full md:w-auto flex items-center justify-between px-4 py-2 border rounded-lg bg-amber-50 hover:bg-amber-100"
                    style="${selected ? `border-color: ${selected.color}; color: ${selected.color}` : 'border-color: #fde68a'}">
                ${selected ? `
                    <span class="flex items-center min-w-0">
                        <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${selected.color}"></span>
                        <span class="truncate">${escapeHtml(selected.name)}</span>
                    </span>
                ` : `
                    <span class="text-amber-700 flex items-center">
                        ${icons.truck}
                        <span class="ml-2">${getText('timer.selectProject')}</span>
                    </span>
                `}
                ${icons.chevronDown}
            </button>
            <div id="project-dropdown" class="hidden absolute z-20 w-full md:w-56 mt-1 bg-amber-50 border border-amber-200 rounded-lg shadow-lg">
                ${activeProjects.map(project => `
                    <button onclick="selectProject('${project.project_id}')" 
                            class="w-full px-3 py-2 text-left text-amber-900 hover:bg-amber-100 flex items-center justify-between">
                        <span class="flex items-center min-w-0">
                            <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${project.color}"></span>
                            <span class="truncate">${escapeHtml(project.name)}</span>
                        </span>
                        ${selectedProjectId === project.project_id ? icons.check : ''}
                    </button>
                `).join('')}
                ${activeProjects.length === 0 ? `
                    <div class="px-3 py-2 text-amber-500 italic">No routes available</div>
                ` : ''}
                <div class="border-t border-amber-200">
                    <a href="${createPageUrl('Projects')}" 
                       class="block px-3 py-2 text-amber-700 hover:bg-amber-100 flex items-center">
                        ${icons.plusCircle}
                        <span class="ml-2">${getText('timer.createNewRoute')}</span>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown) {
        // Close other dropdowns first
        document.querySelectorAll('#project-dropdown, #user-menu, #language-menu').forEach(dd => {
            if (dd.id !== id) dd.classList.add('hidden');
        });
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    // Check if clicked outside all dropdowns
    if (!e.target.closest('#project-dropdown') && 
        !e.target.closest('#user-menu') && 
        !e.target.closest('#language-menu') &&
        !e.target.closest('button[onclick*="toggleDropdown"]')) {
        document.querySelectorAll('#project-dropdown, #user-menu, #language-menu').forEach(dd => {
            dd.classList.add('hidden');
        });
    }
});

// ========================================
// TIMER CONTROLS
// ========================================

function renderTimerControls(isRunning, elapsedTime, selectedProject, currentCat) {
    const { hours, minutes, seconds } = formatTimeDisplay(elapsedTime);
    const catName = currentCat?.nickname || 'Cat';
    
    const statusMessage = isRunning 
        ? `${catName} is hauling cargo! 🚛` 
        : elapsedTime > 0 
            ? `${catName} is taking a cat nap` 
            : "Ready to hit the icy roads?";
    
    return `
        <div class="flex flex-col space-y-6 p-4 sm:p-6 border rounded-xl bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-200 shadow-lg">
            <!-- Cat Avatar -->
            <div class="text-center">
                <div class="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <img src="${currentCat?.avatar_url || DEFAULT_AVATAR}"
                         alt="${escapeHtml(catName)}"
                         class="w-28 h-28 rounded-full object-cover border-4 border-amber-200 mb-4" />
                </div>
                
                <!-- Time Display -->
                <div class="flex flex-col items-center gap-3 mt-4">
                    <div class="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-amber-900 leading-tight">
                        ${hours.toString().padStart(2, '0')}<span class="text-amber-700">:</span>${minutes.toString().padStart(2, '0')}<span class="text-amber-700">:</span>${seconds.toString().padStart(2, '0')}
                    </div>
                    
                    ${!isRunning && elapsedTime > 0 ? `
                        <div class="flex items-center gap-2 flex-wrap justify-center">
                            <button onclick="adjustTimer(-15)" 
                                    class="h-8 px-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center text-sm">
                                ${icons.chevronDown} 15 min
                            </button>
                            <span class="text-xs text-amber-600">Adjust time</span>
                            <button onclick="adjustTimer(15)" 
                                    class="h-8 px-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center text-sm">
                                ${icons.chevronUp} 15 min
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-2 text-amber-600">${escapeHtml(statusMessage)}</div>
            </div>

            <!-- Main Action Button -->
            ${!isRunning ? `
                <button onclick="startTimer()" 
                        class="w-full py-6 sm:py-8 bg-green-600 hover:bg-green-700 text-white text-base sm:text-lg font-semibold rounded-lg flex items-center justify-center">
                    ${icons.play}
                    <span class="ml-2">${elapsedTime > 0 ? 'Continue Arctic Trucking' : 'Start Arctic Expedition'}</span>
                </button>
            ` : `
                <button onclick="pauseTimer()" 
                        class="w-full py-6 sm:py-8 bg-amber-600 hover:bg-amber-700 text-white text-base sm:text-lg font-semibold rounded-lg flex items-center justify-center">
                    ${icons.pause}
                    <span class="ml-2">Take a Catnap</span>
                </button>
            `}

            <!-- Save Section -->
            ${!isRunning && elapsedTime > 0 ? `
                <div class="space-y-4 p-4 bg-amber-100 rounded-lg">
                    <h3 class="font-medium text-amber-900">Finished this cargo haul?</h3>
                    <input type="text" id="timer-description" 
                           placeholder="${getText('timer.whatHauling', { CAT: catName })}"
                           value="${escapeHtml(appState.timerDescription || '')}"
                           onchange="appState.timerDescription = this.value"
                           class="w-full px-4 py-2 border border-amber-200 rounded-lg bg-white text-amber-900 placeholder:text-amber-400" />
                    <button onclick="saveTimerEntry()" 
                            class="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center justify-center">
                        ${icons.save}
                        <span class="ml-2">Log Completed Delivery</span>
                    </button>
                    <p class="text-xs text-amber-700 italic text-center">
                        This will log the expedition and reset the paw-meter
                    </p>
                </div>
            ` : ''}

            <!-- Instructions -->
            <div class="text-sm text-amber-700 space-y-2 bg-amber-100/50 p-4 rounded-lg">
                <h4 class="font-medium flex items-center gap-2">
                    ${icons.clock}
                    <span>${getText('timer.instructionsTitle', { CAT: catName })}</span>
                </h4>
                <ol class="list-decimal list-inside space-y-1">
                    <li>${getText('timer.instruction1')}</li>
                    <li>${getText('timer.instruction2')}</li>
                    <li>${getText('timer.instruction3')}</li>
                    <li>${getText('timer.instruction4', { CAT: catName })}</li>
                    <li>${getText('timer.instruction5')}</li>
                </ol>
            </div>
        </div>
    `;
}

// ========================================
// CAT USER SWITCHER (Sidebar)
// ========================================

function renderCatUserSwitcher(currentCat) {
    const cats = appState.cats || [];
    const hasCat = !!currentCat;
    const displayName = hasCat
        ? (currentCat.nickname || 'Trucker')
        : (getText('timer.selectCat') || 'Select Cat Trucker');
    const avatarUrl = hasCat ? (currentCat.avatar_url || DEFAULT_AVATAR) : DEFAULT_AVATAR;
    const subLine = hasCat
        ? (getText(`trucker.specialties.${currentCat.specialty}`) || currentCat.specialty || '')
        : (cats.length > 0 ? (getText('welcome.selectTrucker') || 'Select Trucker') : (getText('welcome.addTrucker') || 'Add New Trucker'));

    return `
        <div class="relative">
            <button onclick="toggleDropdown('user-menu')" 
                    class="w-full flex items-center gap-3 p-2 rounded-lg bg-amber-700/50 hover:bg-amber-700 transition-colors">
                <div class="relative w-10 h-10">
                    <img src="${avatarUrl}" 
                         alt="${escapeHtml(displayName)}"
                         class="w-10 h-10 rounded-full object-cover border-2 border-amber-300" />
                    ${hasCat ? '' : `<div class="absolute -bottom-1 -right-1 bg-amber-200 text-amber-900 rounded-full w-5 h-5 flex items-center justify-center text-xs border border-amber-700">🐱</div>`}
                </div>
                <div class="flex-1 text-left min-w-0">
                    <div class="text-sm font-medium text-white truncate">${escapeHtml(displayName)}</div>
                    <div class="text-xs text-amber-300 truncate">${escapeHtml(subLine)}</div>
                </div>
                ${icons.chevronDown}
            </button>
            
            <div id="user-menu" class="hidden absolute left-0 w-full bg-amber-50 border border-amber-200 rounded-lg shadow-lg py-1 z-50 max-h-64 overflow-auto" style="bottom: calc(100% + 0.5rem);">
                ${hasCat ? `
                    <button onclick="showEditProfileDialog()" 
                            class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-100 flex items-center gap-2">
                        ${icons.edit} ${getText('trucker.menu.editProfile')}
                    </button>
                    <a href="${createPageUrl('BackupRestore')}" 
                       class="block px-3 py-2 text-sm text-amber-700 hover:bg-amber-100 flex items-center gap-2">
                        ${icons.download} ${getText('trucker.menu.dataManagement')}
                    </a>
                    <div class="border-t border-amber-200 my-1"></div>
                    <button onclick="handleSwitchCat()" 
                            class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-100 flex items-center gap-2">
                        ${icons.logout} ${getText('trucker.menu.switchCat')}
                    </button>
                    <button onclick="showDeleteCatDialog()" 
                            class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        ${icons.trash} ${getText('trucker.menu.deleteTrucker')}
                    </button>
                ` : `
                    ${cats.length > 0 ? cats.map(cat => `
                        <button onclick="handleSelectCat('${cat.cat_trucker_id}', ${cat.passcode_enabled})" 
                                class="w-full px-3 py-2 text-left text-sm text-amber-800 hover:bg-amber-100 flex items-center gap-2">
                            <img src="${cat.avatar_url || DEFAULT_AVATAR}" class="w-6 h-6 rounded-full border border-amber-200 object-cover" alt="${escapeHtml(cat.nickname)}" />
                            <span class="truncate">${escapeHtml(cat.nickname)}</span>
                            ${cat.passcode_enabled ? `<span class="ml-auto text-xs text-amber-600" title="${escapeHtml(getText('trucker.menu.passcodeProtected') || 'Protected')}">🔒</span>` : ''}
                        </button>
                    `).join('') : `
                        <div class="px-3 py-2 text-sm text-amber-700">
                            ${escapeHtml(getText('timer.selectCatPrompt') || 'Please select a cat trucker to start a new journey or load an existing one.')}
                        </div>
                    `}
                    <div class="border-t border-amber-200 my-1"></div>
                    <button onclick="showNewCatDialog()" 
                            class="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-100 flex items-center gap-2">
                        ${icons.plus} ${getText('welcome.addTrucker') || 'Add New Trucker'}
                    </button>
                `}
            </div>
        </div>
    `;
}

// ========================================
// AVATAR SELECTOR
// ========================================

function renderAvatarSelector(currentAvatar, onSelectCallback) {
    return `
        <div class="space-y-3">
            <label class="block text-sm font-medium text-amber-900">${getText('trucker.edit.profilePicture')}</label>
            <div class="grid grid-cols-4 gap-3">
                ${AVATAR_OPTIONS.map((url, index) => `
                    <button type="button" 
                            onclick="${onSelectCallback}('${url}')"
                            class="relative flex items-center justify-center w-20 h-20 rounded-full overflow-hidden border-4 ${currentAvatar === url ? 'border-amber-500' : 'border-transparent hover:border-amber-300'} transition-colors">
                        <img src="${url}" alt="Avatar ${index + 1}" class="w-16 h-16 rounded-full object-cover" />
                        ${currentAvatar === url ? `
                            <div class="absolute inset-0 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <div class="bg-amber-500 text-white rounded-full p-1">${icons.check}</div>
                            </div>
                        ` : ''}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// SPECIALTY SELECTOR
// ========================================

function renderSpecialtySelector(currentSpecialty, inputId = 'specialty') {
    const specialties = ['ice_roads', 'mountain_passes', 'northern_lights', 'snow_drifts', 'blizzard_expert'];
    
    return `
        <div class="space-y-1">
            <label for="${inputId}" class="block text-sm font-medium text-amber-900">${getText('trucker.new.specialty')}</label>
            <select id="${inputId}" 
                    class="w-full px-3 py-2 border border-amber-200 rounded-lg bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                ${specialties.map(spec => `
                    <option value="${spec}" ${currentSpecialty === spec ? 'selected' : ''}>
                        ${getText(`trucker.specialties.${spec}`)}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}

// Make component functions available globally
window.renderLanguageSelector = renderLanguageSelector;
window.renderNavItem = renderNavItem;
window.renderStatsCard = renderStatsCard;
window.renderDashboardProjectCard = renderDashboardProjectCard;
window.renderProjectCard = renderProjectCard;
window.toggleProjectMenu = toggleProjectMenu;
window.renderTimeEntryRow = renderTimeEntryRow;
window.renderProjectSelector = renderProjectSelector;
window.toggleDropdown = toggleDropdown;
window.renderTimerControls = renderTimerControls;
window.renderCatUserSwitcher = renderCatUserSwitcher;
window.renderAvatarSelector = renderAvatarSelector;
window.renderSpecialtySelector = renderSpecialtySelector;
