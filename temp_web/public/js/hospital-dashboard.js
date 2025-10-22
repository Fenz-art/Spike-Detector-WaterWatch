/* Hospital Dashboard JS */

let currentUser = null;
let selectedFile = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    await loadUserData();
    initializeNavigation();
    initializeFileUpload();
    initializeThemeToggle();
    loadDashboardData();
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
            document.getElementById('userName').textContent = data.user.hospitalName || data.user.username;
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
}

function showView(viewName) {
    document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName + 'View').classList.add('active');
    
    if (viewName === 'records') loadRecords();
    if (viewName === 'alerts') loadAlerts();
    if (viewName === 'analytics') loadAnalytics();
}

function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Initialize file upload
function initializeFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });
    
    document.getElementById('removeFile').addEventListener('click', removeFile);
    
    uploadForm.addEventListener('submit', handleUpload);
}

function handleFileSelect(file) {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
        showToast('Please select a CSV or Excel file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.getElementById('fileInfo').classList.remove('d-none');
    document.getElementById('uploadBtn').disabled = false;
}

function removeFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('d-none');
    document.getElementById('uploadBtn').disabled = true;
}

async function handleUpload(e) {
    e.preventDefault();
    
    if (!selectedFile) {
        showToast('Please select a file', 'error');
        return;
    }
    
    const location = document.getElementById('location').value;
    const diseaseType = document.getElementById('diseaseType').value;
    const dateReported = document.getElementById('dateReported').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('location', location);
    formData.append('diseaseType', diseaseType);
    formData.append('dateReported', dateReported);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const uploadBtn = document.getElementById('uploadBtn');
    
    uploadProgress.classList.remove('d-none');
    uploadBtn.disabled = true;
    
    try {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                progressText.textContent = `Uploading... ${percent}%`;
            }
        });
        
        xhr.addEventListener('load', function() {
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                showToast(response.message, 'success');
                
                if (response.alert) {
                    showToast(`⚠️ SPIKE DETECTED! ${response.alert.message}`, 'warning');
                }
                
                e.target.reset();
                removeFile();
                uploadProgress.classList.add('d-none');
                progressBar.style.width = '0%';
                loadDashboardData();
            } else {
                const error = JSON.parse(xhr.responseText);
                showToast(error.message || 'Upload failed', 'error');
                uploadBtn.disabled = false;
            }
        });
        
        xhr.addEventListener('error', function() {
            showToast('Upload failed. Please try again.', 'error');
            uploadBtn.disabled = false;
        });
        
        xhr.open('POST', '/api/records/upload');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(formData);
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed. Please try again.', 'error');
        uploadBtn.disabled = false;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const [recordsResponse, statsResponse] = await Promise.all([
            fetch('/api/records', { credentials: 'include' }),
            fetch('/api/analytics/stats', { credentials: 'include' })
        ]);
        
        if (recordsResponse.ok) {
            const data = await recordsResponse.json();
            const totalCases = data.records.reduce((sum, r) => sum + r.casesCount, 0);
            document.getElementById('totalUploads').textContent = data.records.length;
            document.getElementById('totalCases').textContent = totalCases;
        }
        
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            document.getElementById('spikesDetected').textContent = stats.stats.activeAlerts || 0;
            document.getElementById('alertCount').textContent = stats.stats.activeAlerts || 0;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
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
                            No records found. Upload your first file to get started.
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = data.records.map(record => `
                    <tr>
                        <td><strong>${record.fileName}</strong></td>
                        <td>${record.location}</td>
                        <td><span class="badge bg-info">${record.diseaseType}</span></td>
                        <td><strong>${record.casesCount}</strong></td>
                        <td>${formatDate(record.dateReported)}</td>
                        <td>${formatDate(record.uploadedAt)}</td>
                        <td><span class="badge bg-success">Processed</span></td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading records:', error);
    }
}

// Load alerts
async function loadAlerts() {
    try {
        const response = await fetch('/api/alerts', { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('alertsContainer');
            
            if (data.alerts.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-secondary py-5">
                        <i class="fas fa-bell-slash fa-3x mb-3 d-block"></i>
                        No alerts at this time
                    </div>
                `;
            } else {
                container.innerHTML = data.alerts.map(alert => `
                    <div class="alert alert-${getSeverityColor(alert.severity)} mb-3">
                        <div class="d-flex align-items-start">
                            <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                            <div class="flex-grow-1">
                                <h5 class="alert-heading mb-2">${alert.diseaseType} - ${alert.location}</h5>
                                <p class="mb-2">${alert.message}</p>
                                <small class="text-muted">Detected: ${formatDate(alert.dateDetected)}</small>
                            </div>
                            <span class="badge bg-${getSeverityColor(alert.severity)}">${alert.severity.toUpperCase()}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch('/api/analytics/trends?days=30', { credentials: 'include' });
        
        if (response.ok) {
            const data = await response.json();
            renderTrendsChart(data.trends);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
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
    
    window.trendsChartInstance = new Chart(ctx, {
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
        
        if (window.trendsChartInstance) {
            window.trendsChartInstance.destroy();
            loadAnalytics();
        }
    });
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

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
