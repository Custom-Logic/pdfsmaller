// Application State Management
class AppState {
    constructor() {
        this.user = null;
        this.currentTab = 'compress';
        this.files = new Map(); // Using a map to store files for each feature tab
        this.isProcessing = false;
    }

    reset(tabName) {
        this.files.delete(tabName);
        this.isProcessing = false;
    }

    getFiles(tabName) {
        return this.files.get(tabName) || [];
    }

    setFiles(tabName, files) {
        this.files.set(tabName, files);
    }
}

// Rate Limiter (mock)
class RateLimiter {
    async isAllowed(userId, plan) {
        console.log(`Checking rate limit for user ${userId} with plan ${plan}`);
        return new Promise(resolve => setTimeout(() => resolve(true), 200));
    }

    async recordRequest(userId) {
        console.log(`Recording request for user ${userId}`);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 200));
    }
}

// Authentication System
class AuthenticationManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        const userData = localStorage.getItem('pdfsmaller_user');
        if (userData) {
            try {
                this.appState.user = JSON.parse(userData);
            } catch (e) {
                localStorage.removeItem('pdfsmaller_user');
            }
        }
        this.updateUI();
    }

    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'demo@example.com' && password === 'password') {
                    this.setUser({ id: 1, name: 'Demo User', email, plan: 'Free' });
                    resolve(this.appState.user);
                } else if (email === 'pro@example.com' && password === 'password') {
                    this.setUser({ id: 2, name: 'Pro User', email, plan: 'Pro' });
                    resolve(this.appState.user);
                } else {
                    reject(new Error('Invalid credentials.'));
                }
            }, 1000);
        });
    }

    async register(email, password, name) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.setUser({ id: Date.now(), name, email, plan: 'Free' });
                resolve(this.appState.user);
            }, 1000);
        });
    }

    setUser(user) {
        this.appState.user = user;
        localStorage.setItem('pdfsmaller_user', JSON.stringify(user));
        this.updateUI();
    }

    logout() {
        this.appState.user = null;
        localStorage.removeItem('pdfsmaller_user');
        this.updateUI();
        showNotification('Signed out successfully', 'success');
    }

    updateUI() {
        const isPro = this.isPro();
        const user = this.appState.user;

        // Update header
        const guestActions = document.getElementById('guestActions');
        const userActions = document.getElementById('userActions');
        if (guestActions) guestActions.style.display = user ? 'none' : 'flex';
        if (userActions) userActions.style.display = user ? 'flex' : 'none';

        if (user) {
            document.getElementById('userInitials').textContent = user.name.charAt(0).toUpperCase();
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userPlan').textContent = user.plan;
        }

        // Update feature tabs and toggles
        document.querySelectorAll('.mode-switch').forEach(toggle => {
            const featureTab = toggle.dataset.featureTab;
            const fileInput = document.getElementById(`${featureTab}FileInput`);
            toggle.disabled = !isPro;
            if(!isPro) {
                toggle.checked = false;
            }

            const proBadge = toggle.parentElement.parentElement.querySelector('.pro-badge');
            if(proBadge) proBadge.style.display = isPro ? 'none' : 'inline-block';
        });

        if (window.navigationMenu) {
            window.navigationMenu.updateAuthenticationState(user);
        }
    }

    isPro() {
        return this.appState.user && this.appState.user.plan.includes('Pro');
    }
}

class PDFProcessor {
    constructor() {}

    async process(files, feature, options, onProgress) {
        console.log(`Processing ${files.length} files for feature: ${feature}`, options);
        let processed = 0;
        for (const file of files) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
            processed++;
            if (onProgress) {
                onProgress((processed / files.length) * 100);
            }
        }

        return files.map(file => ({
            originalName: file.name,
            originalSize: file.size,
            compressedSize: file.size * 0.5, // Simulate 50% reduction
            blob: new Blob([''], { type: 'application/pdf' })
        }));
    }
}


function switchTab(tabName) {
    const tabButton = document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`);
    if(tabButton.classList.contains('disabled')) {
        showNotification('This is a Pro feature. Please upgrade.', 'error');
        switchTab('pricing');
        return;
    }

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    tabButton.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    appState.currentTab = tabName;
    if (tabName === 'pricing') updatePricingUI();
}

function updatePricingUI() {
    // ... logic to update pricing buttons based on user plan
}

function handlePlanSelection(plan) {
    // ... logic to handle plan selection
}

function upgradeToPro(plan) {
    // ... logic to upgrade user plan
}

function downgradeToFree() {
    // ... logic to downgrade user plan
}


function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `<span class="notification-icon">${icon}</span> <span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 4000);
}

function handleFileSelection(event, tabName) {
    const files = event.target.files;
    if (files.length > 1 && !auth.isPro()) {
        showNotification('Bulk processing is a Pro feature.', 'error');
        switchTab('pricing');
        return;
    }
    appState.setFiles(tabName, Array.from(files));
    updateFileList(tabName);
}

function updateFileList(tabName) {
    const files = appState.getFiles(tabName);
    const fileInfo = document.getElementById(`${tabName}FileInfo`) || document.getElementById(`singleFileInfo`);
    const fileName = document.getElementById(`${tabName}FileName`) || document.getElementById(`singleFileName`);
    const fileSize = document.getElementById(`${tabName}FileSize`) || document.getElementById(`singleFileSize`);

    if (files.length > 0) {
        fileInfo.style.display = 'flex';
        if (files.length === 1) {
            fileName.textContent = files[0].name;
            fileSize.textContent = formatFileSize(files[0].size);
        } else {
            fileName.textContent = `${files.length} files selected`;
            const totalSize = files.reduce((acc, file) => acc + file.size, 0);
            fileSize.textContent = `Total size: ${formatFileSize(totalSize)}`;
        }
    } else {
        fileInfo.style.display = 'none';
    }
}

function updateProgress(tabName, percent) {
    const progressContainer = document.getElementById(`${tabName}Progress`);
    if (!progressContainer) return;
    const progressBar = document.getElementById(`${tabName}ProgressBar`);
    const progressPercentage = document.getElementById(`${tabName}ProgressPercentage`);
    progressContainer.style.display = 'block';
    progressBar.style.width = `${percent}%`;
    progressPercentage.textContent = `${Math.round(percent)}%`;
}

function displayResults(tabName, results) {
    const resultsContainer = document.getElementById(`${tabName}Results`);
    if(!resultsContainer) return;

    // This is a simplified version. A real implementation would have more detailed result display.
    if (results.length === 1) {
        const result = results[0];
        document.getElementById('singleOriginalSize').textContent = formatFileSize(result.originalSize);
        document.getElementById('singleCompressedSize').textContent = formatFileSize(result.compressedSize);
        const reduction = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);
        document.getElementById('singleReductionPercent').textContent = `${reduction}%`;
    }
    resultsContainer.style.display = 'block';
}


// Initialize Application
const appState = new AppState();
const auth = new AuthenticationManager(appState);
const rateLimiter = new RateLimiter();
const pdfProcessor = new PDFProcessor();

document.addEventListener('DOMContentLoaded', function () {
    auth.updateUI();

    document.querySelectorAll('.mode-switch').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const tabName = e.target.dataset.featureTab;
            const fileInput = document.getElementById(`${tabName}FileInput`) || document.getElementById(`singleFileInput`);
            if (e.target.checked) {
                if (auth.isPro()) {
                    fileInput.multiple = true;
                } else {
                    e.target.checked = false; // Revert toggle
                    showNotification('Bulk mode is a Pro feature.', 'error');
                    switchTab('pricing');
                }
            } else {
                fileInput.multiple = false;
            }
        });
    });

    document.querySelectorAll('.upload-area').forEach(uploadArea => {
        const tabName = uploadArea.id.replace('UploadArea', '');
        const fileInput = document.getElementById(`${tabName}FileInput`) || document.getElementById(`singleFileInput`);
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFileSelection(e, tabName === 'single' ? 'compress' : tabName));
    });

    document.getElementById('singleCompressBtn').addEventListener('click', async () => {
        const files = appState.getFiles('compress');
        if (files.length === 0) return;
        if (!await rateLimiter.isAllowed(auth.appState.user?.id, auth.appState.user?.plan)) return;

        updateProgress('single', 0);
        const results = await pdfProcessor.process(files, 'compress', {}, (p) => updateProgress('single', p));
        displayResults('single', results);

        await rateLimiter.recordRequest(auth.appState.user?.id);
        showNotification(`Processing ${files.length} file(s) for compression.`);
    });

    document.getElementById('convertToWordBtn').addEventListener('click', async () => {
        const files = appState.getFiles('convert');
        if (files.length === 0) return;
        if (!await rateLimiter.isAllowed(auth.appState.user?.id, auth.appState.user?.plan)) return;
        await pdfProcessor.process(files, 'convert', { to: 'word' });
        await rateLimiter.recordRequest(auth.appState.user?.id);
        showNotification(`Processing ${files.length} file(s) for Word conversion.`);
    });

    document.getElementById('convertToExcelBtn').addEventListener('click', async () => {
        const files = appState.getFiles('convert');
        if (files.length === 0) return;
        if (!await rateLimiter.isAllowed(auth.appState.user?.id, auth.appState.user?.plan)) return;
        await pdfProcessor.process(files, 'convert', { to: 'excel' });
        await rateLimiter.recordRequest(auth.appState.user?.id);
        showNotification(`Processing ${files.length} file(s) for Excel conversion.`);
    });

    document.getElementById('extractTextBtn').addEventListener('click', async () => {
        const files = appState.getFiles('ocr');
        if (files.length === 0) return;
        if (!await rateLimiter.isAllowed(auth.appState.user?.id, auth.appState.user?.plan)) return;
        await pdfProcessor.process(files, 'ocr', {});
        await rateLimiter.recordRequest(auth.appState.user?.id);
        showNotification(`Processing ${files.length} file(s) for OCR.`);
    });

    document.getElementById('runAiToolBtn').addEventListener('click', async () => {
        const files = appState.getFiles('ai_tools');
        if (files.length === 0) return;
        if (!await rateLimiter.isAllowed(auth.appState.user?.id, auth.appState.user?.plan)) return;
        const tool = document.getElementById('aiToolSelection').value;
        await pdfProcessor.process(files, 'ai_tools', { tool });
        await rateLimiter.recordRequest(auth.appState.user?.id);
        showNotification(`Processing ${files.length} file(s) for AI tool: ${tool}.`);
    });

    // Handle Auth Modal
    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const name = document.getElementById('authName').value;
            const isLogin = document.getElementById('authModalTitle').textContent === 'Sign In';

            try {
                if (isLogin) {
                    await auth.login(email, password);
                    showNotification('Successfully signed in!', 'success');
                } else {
                    await auth.register(email, password, name);
                    showNotification('Account created successfully!', 'success');
                }
                hideAuthModal();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
});

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
        document.getElementById('authForm').reset();
    }
}
