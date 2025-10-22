/* Municipal Dashboard JS */

let currentUser = null;
let map = null;
let heatLayer = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserData();
    initializeNavigation();
    initializeThemeToggle();
    loadDashboardData();
    initializeFilters();
});

// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            document.getElementById('userName').textContent = data.user.username;
        } else {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        window.location.href = '/login.html';
    }
}

// Initialize navigation
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-view]');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            showView(view);
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileSidebar);
    document.getElementById('exportBtn').addEventListener('click', exportData);
}

function showView(viewName) {
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
    
    if (viewName === 'heatmap' && !map) initializeMap();
    if (viewName === 'trends') loadTrends();
    if (viewName === 'alerts') loadAlerts();
    if (viewName === 'records') loadRecords();
}

function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [recordsResponse, statsResponse, alertsResponse] = await Promise.all([
            fetch('/api/records', { credentials: 'include' }),
            fetch('/api/analytics/stats', { credentials: 'include' }),
            fetch('/api/alerts?status=active', { credentials: 'include' })
        ]);
        
        if (recordsResponse.ok) {
            const data = await recordsResponse.json();
            const totalCases = data.records.reduce((sum, r) => sum + r.casesCount, 0);
            document.getElementById('totalRecords').textContent = data.records.length;
            document.getElementById('totalCases').textContent = totalCases;
        }
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('activeAlerts').textContent = stats.stats.activeAlerts || 0;
            document.getElementById('alertCount').textContent = stats.stats.activeAlerts || 0;
            
            if (stats.stats.activeAlerts > 0) {
                const banner = document.getElementById('alertBanner');
                const bannerText = document.getElementById('alertBannerText');
                bannerText.textContent = `${stats.stats.activeAlerts} active disease spike alert${stats.stats.activeAlerts > 1 ? 's' : ''} require${stats.stats.activeAlerts === 1 ? 's' : ''} attention`;
                banner.classList.remove('d-none');
            }
        }
        
        if (alertsResponse.ok) {
            const alerts = await alertsResponse.json();
            loadRecentAlerts(alerts.alerts);
        }
        
        loadOverviewChart();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load overview chart
async function loadOverviewChart() {
    try {
        const response = await fetch('/api/analytics/trends?days=30', { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            renderOverviewChart(data.trends);
        }
    } catch (error) {
        console.error('Error loading overview chart:', error);
    }
}

function renderOverviewChart(trends) {
    const ctx = document.getElementById('overviewChart');
    
    if (window.overviewChartInstance) {
        window.overviewChartInstance.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#cbd5e1' : '#6b7280';
    const gridColor = isDark ? '#334155' : '#e5e7eb';
    
    window.overviewChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.map(t => formatDate(t.date)),
            datasets: [{
                label: 'Cases',
                data: trends.map(t => t.cases),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
            }
        }
    });
}

// Load recent alerts
function loadRecentAlerts(alerts) {
    const container = document.getElementById('recentAlertsList');
    
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="text-center text-secondary py-4">
                <i class="fas fa-bell-slash fa-2x mb-2 d-block"></i>
                No recent alerts
            </div>
        `;
    } else {
        container.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="alert-item mb-3 p-3 rounded" style="background: var(--bg-soft-gray);">
                <div class="d-flex align-items-start">
                    <span class="badge bg-${getSeverityColor(alert.severity)} me-2">${alert.severity}</span>
                    <div class="flex-grow-1">
                        <div class="fw-semibold">${alert.location}</div>
                        <small class="text-secondary">${alert.diseaseType} - ${alert.casesDetected} cases</small>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize map
function initializeMap() {
    map = L.map('map').setView([40.7128, -74.0060], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    loadHeatmapData();
}

async function loadHeatmapData() {
    try {
        const response = await fetch('/api/analytics/heatmap?days=7', { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            
            if (heatLayer) {
                map.removeLayer(heatLayer);
            }
            
            const heatData = data.heatmapData.map(point => [
                point.lat,
                point.lng,
                point.intensity / 10
            ]);
            
            if (heatData.length > 0) {
                heatLayer = L.heatLayer(heatData, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    gradient: {
                        0.0: '#0ea5e9',
                        0.5: '#f59e0b',
                        1.0: '#ef4444'
                    }
                }).addTo(map);
                
                data.heatmapData.forEach(point => {
                    L.marker([point.lat, point.lng])
                        .bindPopup(`
                            <strong>${point.location}</strong><br>
                            ${point.diseaseType}<br>
                            Cases: ${point.intensity}<br>
                            Date: ${formatDate(point.dateReported)}
                        `)
                        .addTo(map);
                });
            }
        }
    } catch (error) {
        console.error('Error loading heatmap data:', error);
    }
}

// Load trends
async function loadTrends() {
    try {
        const period = document.getElementById('trendPeriod').value || 30;
        const location = document.getElementById('trendLocation').value;
        const diseaseType = document.getElementById('trendDiseaseType').value;
        
        let url = `/api/analytics/trends?days=${period}`;
        if (location) url += `&location=${location}`;
        if (diseaseType) url += `&diseaseType=${diseaseType}`;
        
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            renderTrendsChart(data.trends);
        }
    } catch (error) {
        console.error('Error loading trends:', error);
    }
}

function renderTrendsChart(trends) {
    const ctx = document.getElementById('trendsChart');
    
    if (window.trendsChartInstance) {
        window.trendsChartInstance.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#cbd5e1' : '#6b7280';
    const gridColor = isDark ? '#334155' : '#e5e7eb';
    
    const casesData = trends.map(t => t.cases);
    const avgCases = casesData.reduce((a, b) => a + b, 0) / casesData.length;
    const stdDev = Math.sqrt(casesData.map(x => Math.pow(x - avgCases, 2)).reduce((a, b) => a + b) / casesData.length);
    
    window.trendsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.map(t => formatDate(t.date)),
            datasets: [{
                label: 'Actual Cases',
                data: casesData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }, {
                label: 'Expected (Average)',
                data: Array(trends.length).fill(avgCases),
                borderColor: '#10b981',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }, {
                label: 'Upper Threshold (+2σ)',
                data: Array(trends.length).fill(avgCases + 2 * stdDev),
                borderColor: '#ef4444',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: textColor }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
            }
        }
    });
}

// Load alerts
async function loadAlerts() {
    try {
        const status = document.getElementById('alertStatus').value;
        const severity = document.getElementById('alertSeverity').value;
        const location = document.getElementById('alertLocation').value;
        
        let url = '/api/alerts?';
        if (status) url += `status=${status}&`;
        if (severity) url += `severity=${severity}&`;
        if (location) url += `location=${location}&`;
        
        const response = await fetch(url, { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            renderAlerts(data.alerts);
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

function renderAlerts(alerts) {
    const container = document.getElementById('alertsListContainer');
    
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="text-center text-secondary py-5">
                <i class="fas fa-bell-slash fa-3x mb-3 d-block"></i>
                No alerts found
            </div>
        `;
    } else {
        container.innerHTML = alerts.map(alert => `
            <div class="alert alert-${getSeverityColor(alert.severity)} mb-3">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-start">
                            <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                            <div>
                                <h5 class="alert-heading mb-2">${alert.diseaseType} - ${alert.location}</h5>
                                <p class="mb-2">${alert.message}</p>
                                <small class="text-muted">
                                    Detected: ${formatDate(alert.dateDetected)} | 
                                    Cases: ${alert.casesDetected} (Expected: ${alert.expectedCases})
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 text-md-end mt-3 mt-md-0">
                        <span class="badge bg-${getSeverityColor(alert.severity)} mb-2">${alert.severity.toUpperCase()}</span>
                        <span class="badge bg-${getStatusColor(alert.status)} d-block">${alert.status.toUpperCase()}</span>
                        ${alert.status === 'active' ? `
                            <button class="btn btn-sm btn-primary mt-2" onclick="acknowledgeAlert('${alert._id}')">
                                <i class="fas fa-check me-1"></i> Acknowledge
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

async function acknowledgeAlert(alertId) {
    try {
        const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
            method: 'PUT',
            credentials: 'include'
        });
        
        if (response.ok) {
            showToast('Alert acknowledged successfully', 'success');
            loadAlerts();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error acknowledging alert:', error);
        showToast('Failed to acknowledge alert', 'error');
    }
}

// Load records
async function loadRecords() {
    try {
        const response = await fetch('/api/records', { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('recordsTableBody');
            
            if (data.records.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-secondary py-5">
                            <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                            No records found
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = data.records.map(record => `
                    <tr>
                        <td>${record.uploadedBy?.hospitalName || record.uploadedBy?.username || 'Unknown'}</td>
                        <td>${record.location}</td>
                        <td><span class="badge bg-info">${record.diseaseType}</span></td>
                        <td><strong>${record.casesCount}</strong></td>
                        <td>${formatDate(record.dateReported)}</td>
                        <td>${formatDate(record.uploadedAt)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="viewRecord('${record._id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading records:', error);
    }
}

function viewRecord(recordId) {
    showToast('Record details functionality coming soon', 'info');
}

// Initialize filters
function initializeFilters() {
    document.getElementById('applyTrendFilters').addEventListener('click', loadTrends);
    document.getElementById('applyAlertFilters').addEventListener('click', loadAlerts);
}

// Export data
function exportData() {
    showToast('Export functionality coming soon', 'info');
}

// Logout
async function logout(e) {
    e.preventDefault();
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Theme toggle
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggleSidebar');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.querySelector('i').classList.replace(
            isDark ? 'fa-moon' : 'fa-sun',
            isDark ? 'fa-sun' : 'fa-moon'
        );
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        if (window.overviewChartInstance) {
            loadOverviewChart();
        }
        if (window.trendsChartInstance) {
            loadTrends();
        }
    });
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getSeverityColor(severity) {
    const colors = {
        critical: 'danger',
        high: 'danger',
        medium: 'warning',
        low: 'info'
    };
    return colors[severity] || 'secondary';
}

function getStatusColor(status) {
    const colors = {
        active: 'danger',
        acknowledged: 'warning',
        resolved: 'success'
    };
    return colors[status] || 'secondary';
}
