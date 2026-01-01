// ========================================
// UTILITIES - Helper functions
// ========================================

// Default avatar URL
const DEFAULT_AVATAR = "assets/1-pringles-ice-road-specialist.jpg";

// Avatar options for selection
const AVATAR_OPTIONS = [
    DEFAULT_AVATAR,
    "assets/2-aurora-purple-navigator.jpg",
    "assets/3-fluffy-snow-specialist.jpg",
    "assets/4-gray-night-professional.jpg",
    "assets/5-skittles-siamese-compass.jpg",
    "assets/6-orange-tabby-junior-driver.jpg",
    "assets/7-maine-coon-northern-expert.jpg",
	"assets/8-tuxedo-long-haul-professional.jpg"
];


// Project color options
const PROJECT_COLORS = [
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
];

// ========================================
// CSV UTILITIES
// ========================================

function getSystemCSVSeparator() {
    const numberFormat = new Intl.NumberFormat();
    const parts = numberFormat.formatToParts(1.1);
    const decimalPart = parts.find(part => part.type === 'decimal');
    return decimalPart && decimalPart.value === ',' ? ';' : ',';
}

function formatNumberForCSV(num, separator) {
    if (num === undefined || num === null) return '';
    // If separator is semicolon (EU), we want comma decimals
    if (separator === ';') {
        return num.toString().replace('.', ',');
    }
    return num.toString();
}

function escapeCSVField(field, separator) {
    if (field === undefined || field === null) return '';
    const stringField = String(field);
    if (stringField.includes(separator) || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

// ========================================
// TIME UTILITIES
// ========================================

function formatDuration(minutes) {
    if (!minutes && minutes !== 0) return "-";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    } else if (mins === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${mins}m`;
    }
}

function formatTime(timeValue) {
    if (!timeValue) return "-";
    
    // If it's already a simple time string like "14:30", return as-is
    if (typeof timeValue === 'string' && /^\d{1,2}:\d{2}$/.test(timeValue)) {
        return timeValue;
    }
    
    try {
        const date = new Date(timeValue);
        if (isNaN(date.getTime())) {
            // If parsing fails, try to return the value as-is
            return String(timeValue);
        }
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error("Invalid date format:", timeValue);
        return String(timeValue) || "-";
    }
}

// Format display time for a timer (expects seconds, not milliseconds)
function formatTimeDisplay(timeInSeconds) {
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { hours, minutes, seconds };
}

function formatDate(dateString) {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

function formatDateShort(dateString) {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

function getTimeRanges() {
    const now = new Date();
    
    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    // End of today
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // End of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // End of month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return {
        today: {
            start: startOfDay.toISOString(),
            end: endOfDay.toISOString()
        },
        week: {
            start: startOfWeek.toISOString(),
            end: endOfWeek.toISOString()
        },
        month: {
            start: startOfMonth.toISOString(),
            end: endOfMonth.toISOString()
        }
    };
}

// ========================================
// URL/ROUTING UTILITIES
// ========================================

function createPageUrl(pageName) {
    return '#' + pageName;
}

function getCurrentPage() {
    const hash = window.location.hash.slice(1) || 'Dashboard';
    return hash;
}

// ========================================
// BACKUP UTILITIES
// ========================================

const BACKUP_STORAGE_KEY = 'pringles_backup_settings';

function getBackupSettings() {
    try {
        const stored = localStorage.getItem(BACKUP_STORAGE_KEY);
        return stored ? JSON.parse(stored) : { schedule: 'off', lastBackupDate: null };
    } catch (e) {
        return { schedule: 'off', lastBackupDate: null };
    }
}

function saveBackupSettings(settings) {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(settings));
}

function isBackupDue() {
    const settings = getBackupSettings();
    if (settings.schedule === 'off' || !settings.lastBackupDate) {
        return settings.schedule !== 'off';
    }

    const lastBackup = new Date(settings.lastBackupDate);
    const now = new Date();
    const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

    if (settings.schedule === 'daily' && daysSinceBackup >= 1) return true;
    if (settings.schedule === 'weekly' && daysSinceBackup >= 7) return true;
    if (settings.schedule === 'monthly' && daysSinceBackup >= 30) return true;
    
    return false;
}

// ========================================
// DOM UTILITIES
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toastRoot = document.getElementById('toast-root');
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
    toast.className = `${bgColor} text-white px-4 py-2 rounded-lg shadow-lg mb-2 animate-pulse`;
    toast.textContent = message;
    toastRoot.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function closeModal() {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = '';
}

function showModal(content) {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onclick="if(event.target === this) closeModal()">
            <div class="bg-amber-50 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-amber-200">
                ${content}
            </div>
        </div>
    `;
}

function showConfirmDialog(title, message, confirmText = null, cancelText = null) {
    const cText = cancelText || getText('common.cancel');
    const okText = confirmText || getText('common.confirm');
    
    return new Promise((resolve) => {
        const modalRoot = document.getElementById('modal-root');
        modalRoot.innerHTML = `
            <div class="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
                <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                    <h2 class="text-xl font-bold text-amber-900 mb-4">${escapeHtml(title)}</h2>
                    <p class="text-amber-700 mb-6">${escapeHtml(message)}</p>
                    <div class="flex justify-end gap-3">
                        <button id="confirm-cancel" class="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100">
                            ${escapeHtml(cText)}
                        </button>
                        <button id="confirm-ok" class="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700">
                            ${escapeHtml(okText)}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('confirm-cancel').onclick = () => {
            closeModal();
            resolve(false);
        };
        document.getElementById('confirm-ok').onclick = () => {
            closeModal();
            resolve(true);
        };
    });
}

// ========================================
// ICONS (SVG strings)
// ========================================

const icons = {
    snowflake: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18m-18 0l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3"></path></svg>`,
    clock: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    folder: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>`,
    chart: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`,
    download: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>`,
    upload: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>`,
    book: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>`,
    menu: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`,
    x: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`,
    plus: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`,
    plusCircle: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    play: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    pause: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    save: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>`,
    truck: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 104 0 2 2 0 00-4 0zM3 9h12l3 8H3V9z"></path></svg>`,
    check: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
    chevronDown: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`,
    chevronUp: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`,
    edit: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`,
    trash: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`,
    archive: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>`,
    restore: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`,
    moreVertical: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>`,
    alertCircle: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    checkCircle: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    calendar: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
    info: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    logout: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`,
    paw: `<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM6 4C4.9 4 4 4.9 4 6C4 7.1 4.9 8 6 8C7.1 8 8 7.1 8 6C8 4.9 7.1 4 6 4ZM18 4C16.9 4 16 4.9 16 6C16 7.1 16.9 8 18 8C19.1 8 20 7.1 20 6C20 4.9 19.1 4 18 4ZM5 10C3.3 10 2 11.3 2 13C2 14.7 3.3 16 5 16C6.7 16 8 14.7 8 13C8 11.3 6.7 10 5 10ZM19 10C17.3 10 16 11.3 16 13C16 14.7 17.3 16 19 16C20.7 16 22 14.7 22 13C22 11.3 20.7 10 19 10ZM12 9C9.8 9 8 10.8 8 13C8 15.2 9.8 17 12 17C14.2 17 16 15.2 16 13C16 10.8 14.2 9 12 9Z"></path></svg>`,
    lock: `<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>`,
};

// Make available globally
window.DEFAULT_AVATAR = DEFAULT_AVATAR;
window.AVATAR_OPTIONS = AVATAR_OPTIONS;
window.PROJECT_COLORS = PROJECT_COLORS;
window.formatDuration = formatDuration;
window.formatTime = formatTime;
window.formatTimeDisplay = formatTimeDisplay;
window.formatDate = formatDate;
window.formatDateShort = formatDateShort;
window.getTimeRanges = getTimeRanges;
window.createPageUrl = createPageUrl;
window.getCurrentPage = getCurrentPage;
window.getBackupSettings = getBackupSettings;
window.saveBackupSettings = saveBackupSettings;
window.isBackupDue = isBackupDue;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.closeModal = closeModal;
window.hideModal = closeModal; // Alias for backward compatibility
window.showModal = showModal;
window.showConfirmDialog = showConfirmDialog;
window.icons = icons;
