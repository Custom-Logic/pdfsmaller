// Application State Management
class AppState {
    constructor() {
        this.user = null;
        this.currentTab = 'single';
        this.singleFile = null;
        this.bulkFiles = [];
        this.isProcessing = false;
        this.compressedBlob = null;
        this.bulkCompressedFiles = [];
        this.convertFile = null;
        this.ocrFile = null;
        this.aiFile = null;
    }

    reset() {
        this.singleFile = null;
        this.bulkFiles = [];
        this.compressedBlob = null;
        this.bulkCompressedFiles = [];
        this.isProcessing = false;
        this.convertFile = null;
        this.ocrFile = null;
        this.aiFile = null;
    }
}

// Authentication System
class AuthenticationManager {
    constructor(appState) {
        this.appState = appState;
        this.init();
    }

    init() {
        // Check for existing user session
        const userData = localStorage.getItem('pdfsmaller_user');
        if (userData) {
            try {
                this.appState.user = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('pdfsmaller_user');
            }
        }
    }

    async login(email, password) {
        // Simulate API call with demo credentials
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'demo@example.com' && password === 'password') {
                    const user = {
                        id: 1,
                        name: 'Demo User',
                        email: email,
                        plan: 'Free'
                    };
                    this.setUser(user);
                    resolve(user);
                } else if (email === 'pro@example.com' && password === 'password') {
                    const user = {
                        id: 2,
                        name: 'Pro User',
                        email: email,
                        plan: 'Pro'
                    };
                    this.setUser(user);
                    resolve(user);
                } else {
                    reject(new Error('Invalid credentials. Try: demo@example.com / password or pro@example.com / password'));
                }
            }, 1000);
        });
    }

    async register(email, password, name) {
        // Simulate registration
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: Date.now(),
                    name: name,
                    email: email,
                    plan: 'Free'
                };
                this.setUser(user);
                resolve(user);
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
        const guestActions = document.getElementById('guestActions');
        const userActions = document.getElementById('userActions');
        const bulkUpgradePrompt = document.getElementById('bulkUpgradePrompt');
        const bulkProcessingArea = document.getElementById('bulkProcessingArea');
        const useServerCheckbox = document.getElementById('useServerProcessing');

        // Navigation menu authentication sections
        const guestAuthSection = document.getElementById('guestAuthSection');
        const userAuthSection = document.getElementById('userAuthSection');

        if (this.appState.user) {
            // Update header user dropdown
            guestActions.classList.add('hidden');
            userActions.classList.remove('hidden');

            document.getElementById('userInitials').textContent =
                this.appState.user.name.charAt(0).toUpperCase();
            document.getElementById('userName').textContent = this.appState.user.name;
            document.getElementById('userPlan').textContent = this.appState.user.plan;

            // Update navigation menu authentication sections
            if (guestAuthSection && userAuthSection) {
                guestAuthSection.style.display = 'none';
                userAuthSection.classList.remove('hidden');
                userAuthSection.style.display = 'block';

                // Update navigation menu user info
                const userInitialsNav = document.getElementById('userInitialsNav');
                const userNameNav = document.getElementById('userNameNav');
                const userPlanNav = document.getElementById('userPlanNav');

                if (userInitialsNav) {
                    userInitialsNav.textContent = this.appState.user.name.charAt(0).toUpperCase();
                }
                if (userNameNav) {
                    userNameNav.textContent = this.appState.user.name;
                }
                if (userPlanNav) {
                    const planText = this.appState.user.plan.includes('Pro') ? 'Pro Plan' : 'Free Plan';
                    userPlanNav.textContent = planText;

                    // Add plan badge styling for Pro users
                    if (this.appState.user.plan.includes('Pro')) {
                        userPlanNav.innerHTML = planText + ' <span class="plan-badge">PRO</span>';
                    }
                }
            }

            // Update navigation menu authentication state
            if (window.navigationMenu) {
                window.navigationMenu.updateAuthenticationState(this.appState.user);
            }

            // Enable/disable features based on plan
            if (this.appState.user.plan === 'Pro') {
                bulkUpgradePrompt.classList.add('hidden');
                bulkProcessingArea.classList.remove('hidden');
                useServerCheckbox.disabled = false;
            } else {
                bulkUpgradePrompt.classList.remove('hidden');
                bulkProcessingArea.classList.add('hidden');
                useServerCheckbox.disabled = true;
            }
        } else {
            // Update header user dropdown
            guestActions.classList.remove('hidden');
            userActions.classList.add('hidden');

            // Update navigation menu authentication sections
            if (guestAuthSection && userAuthSection) {
                guestAuthSection.style.display = 'block';
                userAuthSection.classList.add('hidden');
                userAuthSection.style.display = 'none';
            }

            // Update navigation menu authentication state
            if (window.navigationMenu) {
                window.navigationMenu.updateAuthenticationState(null);
            }

            bulkUpgradePrompt.classList.remove('hidden');
            bulkProcessingArea.classList.add('hidden');
            useServerCheckbox.disabled = true;
        }
    }

    isPro() {
        return this.appState.user && this.appState.user.plan === 'Pro';
    }
}

// PDF Compression Engine
class PDFCompressor {
    constructor(appState) {
        this.appState = appState;
    }

    async compressSingle(file, options) {
        const startTime = Date.now();

        try {
            let compressedBlob;

            if (options.useServer && auth.isPro()) {
                compressedBlob = await this.compressOnServer(file, options);
            } else {
                compressedBlob = await this.compressClientSide(file, options);
            }

            const endTime = Date.now();
            const processingTime = (endTime - startTime) / 1000;

            return {
                originalSize: file.size,
                compressedSize: compressedBlob.size,
                processingTime: processingTime,
                blob: compressedBlob
            };
        } catch (error) {
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    async compressClientSide(file, options) {
        updateSingleProgress(20, 'Loading PDF...');

        const arrayBuffer = await file.arrayBuffer();
        updateSingleProgress(40, 'Processing...');

        // Load PDF with PDF-lib
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        updateSingleProgress(60, 'Compressing...');

        // Configure compression options
        const compressionOptions = this.getClientCompressionOptions(options);

        updateSingleProgress(80, 'Finalizing...');

        // Save compressed PDF
        const compressedBytes = await pdfDoc.save(compressionOptions);
        updateSingleProgress(100, 'Complete!');

        return new Blob([compressedBytes], { type: 'application/pdf' });
    }

    async compressOnServer(file, options) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('compressionLevel', options.compressionLevel);
        formData.append('imageQuality', options.imageQuality);
        formData.append('userId', this.appState.user?.id || 'anonymous');

        // Simulate server compression with better results
        return new Promise((resolve) => {
            let progress = 20;
            const interval = setInterval(() => {
                progress += 15;
                updateSingleProgress(Math.min(progress, 90), 'Server processing...');

                if (progress >= 90) {
                    clearInterval(interval);

                    // Simulate server response with better compression
                    setTimeout(() => {
                        updateSingleProgress(100, 'Complete!');

                        // Create a more compressed version for server processing
                        const reductionFactor = this.getServerReductionFactor(options);
                        const compressedSize = Math.floor(file.size * reductionFactor);

                        // Create dummy compressed blob (in real app, this would be from server)
                        const compressedBlob = new Blob(
                            [new ArrayBuffer(compressedSize)],
                            { type: 'application/pdf' }
                        );

                        resolve(compressedBlob);
                    }, 500);
                }
            }, 300);
        });
    }

    async compressBulk(files, options) {
        if (!auth.isPro()) {
            throw new Error('Bulk processing requires Pro subscription');
        }

        const startTime = Date.now();
        const results = [];

        updateBulkProgress(0, 'Starting bulk compression...');

        // Process files in batches for better performance
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progress = ((i + 1) / files.length) * 100;

            updateBulkProgress(progress, `Processing ${i + 1}/${files.length}: ${file.name}`);

            try {
                const result = await this.compressOnServer(file, options);
                results.push({
                    originalName: file.name,
                    originalSize: file.size,
                    compressedSize: result.size,
                    blob: result
                });
            } catch (error) {
                console.error(`Failed to compress ${file.name}:`, error);
                // Continue with other files
            }

            // Small delay to prevent UI blocking
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const endTime = Date.now();
        const totalProcessingTime = (endTime - startTime) / 1000;

        return {
            files: results,
            totalProcessingTime: totalProcessingTime
        };
    }

    getClientCompressionOptions(options) {
        const baseOptions = {
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 50
        };

        switch (options.compressionLevel) {
            case 'low':
                return { ...baseOptions, useObjectStreams: false };
            case 'medium':
                return baseOptions;
            case 'high':
                return { ...baseOptions, objectsPerTick: 100 };
            case 'maximum':
                return { ...baseOptions, useObjectStreams: false, objectsPerTick: 200 };
            default:
                return baseOptions;
        }
    }

    getServerReductionFactor(options) {
        // Server processing achieves better compression ratios
        const baseReduction = {
            'low': 0.85,
            'medium': 0.65,
            'high': 0.45,
            'maximum': 0.35,
            'extreme': 0.25
        };

        const qualityFactor = options.imageQuality / 100;
        return baseReduction[options.compressionLevel] * (0.7 + qualityFactor * 0.3);
    }
}

// UI Management Functions

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');

    appState.currentTab = tabName;

    // If switching to pricing tab, update the UI based on current plan
    if (tabName === 'pricing') {
        updatePricingUI();
    }
}

// Function to update pricing UI based on current user plan
function updatePricingUI() {
    const user = appState.user;
    const freePlanBtn = document.getElementById('freePlanBtn');
    const proMonthlyBtn = document.getElementById('proMonthlyBtn');
    const proAnnualBtn = document.getElementById('proAnnualBtn');
    const proMonthlyCurrent = document.getElementById('proMonthlyCurrent');
    const proAnnualCurrent = document.getElementById('proAnnualCurrent');

    // Reset all buttons
    freePlanBtn.textContent = 'Current Plan';
    freePlanBtn.classList.remove('btn-premium');
    freePlanBtn.classList.add('btn-secondary');
    freePlanBtn.disabled = true;

    proMonthlyBtn.textContent = 'Upgrade Now';
    proMonthlyBtn.classList.remove('btn-secondary');
    proMonthlyBtn.classList.add('btn-premium');
    proMonthlyBtn.disabled = false;

    proAnnualBtn.textContent = 'Upgrade Now';
    proAnnualBtn.classList.remove('btn-secondary');
    proAnnualBtn.classList.add('btn-premium');
    proAnnualBtn.disabled = false;

    // Hide all current plan badges
    proMonthlyCurrent.classList.add('hidden');
    proAnnualCurrent.classList.add('hidden');

    // Update based on current plan
    if (user) {
        if (user.plan === 'Free') {
            freePlanBtn.textContent = 'Current Plan';
            freePlanBtn.disabled = true;
        } else if (user.plan === 'Pro' || user.plan === 'Pro Monthly') {
            freePlanBtn.textContent = 'Downgrade';
            freePlanBtn.disabled = false;
            freePlanBtn.onclick = () => downgradeToFree();

            proMonthlyBtn.textContent = 'Current Plan';
            proMonthlyBtn.classList.remove('btn-premium');
            proMonthlyBtn.classList.add('btn-secondary');
            proMonthlyBtn.disabled = true;
            proMonthlyCurrent.classList.remove('hidden');
        } else if (user.plan === 'Pro Annual') {
            freePlanBtn.textContent = 'Downgrade';
            freePlanBtn.disabled = false;
            freePlanBtn.onclick = () => downgradeToFree();

            proAnnualBtn.textContent = 'Current Plan';
            proAnnualBtn.classList.remove('btn-premium');
            proAnnualBtn.classList.add('btn-secondary');
            proAnnualBtn.disabled = true;
            proAnnualCurrent.classList.remove('hidden');
        }
    } else {
        // User is not logged in
        freePlanBtn.textContent = 'Get Started';
        freePlanBtn.disabled = false;
        freePlanBtn.onclick = () => showAuthModal('register');
    }
}

// Function to handle plan selection
function handlePlanSelection(plan) {
    if (!appState.user) {
        // If user is not logged in, show auth modal with register form
        showAuthModal('register');
        return;
    }

    // Check if user is already on this plan
    if ((plan === 'free' && appState.user.plan === 'Free') ||
        (plan === 'pro_monthly' && (appState.user.plan === 'Pro' || appState.user.plan === 'Pro Monthly')) ||
        (plan === 'pro_annual' && appState.user.plan === 'Pro Annual')) {
        showNotification('You are already on this plan', 'info');
        return;
    }

    // Handle upgrade/downgrade
    if (plan === 'free') {
        downgradeToFree();
    } else {
        upgradeToPro(plan);
    }
}

// Function to upgrade to Pro plan
async function upgradeToPro(plan) {
    try {
        showNotification('Processing your upgrade...', 'info');

        // Call backend API to create subscription
        const planId = plan === 'pro_monthly' ? 'price_monthly' : 'price_annual';
        const paymentMethod = 'card'; // In a real implementation, this would come from a payment form

        const response = await backendAPI.createSubscription(planId, paymentMethod);

        // Update user plan
        appState.user.plan = plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Annual';
        localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));

        // Update UI
        auth.updateUI();
        updatePricingUI();

        // Update navigation menu plan info
        if (window.navigationMenu) {
            window.navigationMenu.updateUserPlan(appState.user);
        }

        showNotification('Successfully upgraded to Pro!', 'success');
    } catch (error) {
        console.error('Upgrade failed:', error);
        showNotification('Upgrade failed: ' + error.message, 'error');
    }
}

// Function to downgrade to Free plan
async function downgradeToFree() {
    try {
        showNotification('Processing your downgrade...', 'info');

        // Call backend API to cancel subscription
        await backendAPI.cancelSubscription();

        // Update user plan
        appState.user.plan = 'Free';
        localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));

        // Update UI
        auth.updateUI();
        updatePricingUI();

        // Update navigation menu plan info
        if (window.navigationMenu) {
            window.navigationMenu.updateUserPlan(appState.user);
        }

        showNotification('Your plan has been changed to Free. Pro features will be available until the end of your billing period.', 'success');
    } catch (error) {
        console.error('Downgrade failed:', error);
        showNotification('Downgrade failed: ' + error.message, 'error');
    }
}


function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateSingleProgress(percent, text = 'Processing') {
    const progressContainer = document.getElementById('singleProgress');
    const progressBar = document.getElementById('singleProgressBar');
    const progressPercentage = document.getElementById('singleProgressPercentage');
    const progressLabel = progressContainer.querySelector('.progress-label span');

    progressContainer.style.display = 'block';
    progressBar.style.width = percent + '%';
    progressPercentage.textContent = percent + '%';
    progressLabel.textContent = text;
}

function updateBulkProgress(percent, text = 'Processing') {
    const progressContainer = document.getElementById('bulkProgress');
    const progressBar = document.getElementById('bulkProgressBar');
    const progressPercentage = document.getElementById('bulkProgressPercentage');
    const progressText = document.getElementById('bulkProgressText');

    progressContainer.style.display = 'block';
    progressBar.style.width = percent + '%';
    progressPercentage.textContent = Math.round(percent) + '%';
    progressText.textContent = text;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Modal Functions
function showAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const nameGroup = document.getElementById('authNameGroup');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');

    if (mode === 'login') {
        title.textContent = 'Sign In';
        submitBtn.textContent = 'Sign In';
        nameGroup.classList.add('hidden');
        switchText.textContent = "Don't have an account?";
        switchLink.textContent = 'Sign up';
    } else {
        title.textContent = 'Create Account';
        submitBtn.textContent = 'Create Account';
        nameGroup.classList.remove('hidden');
        switchText.textContent = "Already have an account?";
        switchLink.textContent = 'Sign in';
    }

    modal.classList.add('show');
}

function hideAuthModal() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('authForm').reset();
}

function toggleAuthMode() {
    const title = document.getElementById('authModalTitle');
    const isLogin = title.textContent === 'Sign In';
    showAuthModal(isLogin ? 'register' : 'login');
}

function toggleUserDropdown() {
    document.getElementById('userDropdown').classList.toggle('show');
}

function logout() {
    auth.logout();
    document.getElementById('userDropdown').classList.remove('show');
    resetUI();
}

function upgradeAccount() {
    // Simulate account upgrade
    if (appState.user && appState.user.plan === 'Free') {
        appState.user.plan = 'Pro';
        localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));
        auth.updateUI();

        // Update navigation menu plan info
        if (window.navigationMenu) {
            window.navigationMenu.updateUserPlan(appState.user);
        }

        showNotification('Congratulations! You now have Pro features!', 'success');
    }
    document.getElementById('userDropdown').classList.remove('show');
}

function resetUI() {
    // Reset single file UI
    document.getElementById('singleFileInfo').style.display = 'none';
    document.getElementById('singleResults').style.display = 'none';
    document.getElementById('singleProgress').style.display = 'none';
    document.getElementById('singleCompressBtn').disabled = true;
    document.getElementById('singleFileInput').value = '';

    // Reset bulk UI
    document.getElementById('bulkFileList').innerHTML = '';
    document.getElementById('bulkFileList').style.display = 'none';
    document.getElementById('bulkResults').style.display = 'none';
    document.getElementById('bulkProgress').style.display = 'none';
    document.getElementById('bulkCompressBtn').disabled = true;
    document.getElementById('bulkFileInput').value = '';

    appState.reset();
}

// File Handling Functions
function handleSingleFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('Please select a valid PDF file.', 'error');
        return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showNotification('File size must be less than 50MB.', 'error');
        return;
    }

    appState.singleFile = file;
    document.getElementById('singleFileName').textContent = file.name;
    document.getElementById('singleFileSize').textContent = formatFileSize(file.size);
    document.getElementById('singleFileInfo').style.display = 'flex';
    document.getElementById('singleCompressBtn').disabled = false;

    // Hide previous results
    document.getElementById('singleResults').style.display = 'none';
}

function handleConvertFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('Please select a valid PDF file.', 'error');
        return;
    }

    appState.convertFile = file;
    document.getElementById('convertFileName').textContent = file.name;
    document.getElementById('convertFileSize').textContent = formatFileSize(file.size);
    document.getElementById('convertFileInfo').style.display = 'flex';
    document.getElementById('convertToWordBtn').disabled = false;
    document.getElementById('convertToExcelBtn').disabled = false;
}

function handleOcrFile(file) {
    appState.ocrFile = file;
    document.getElementById('ocrFileName').textContent = file.name;
    document.getElementById('ocrFileSize').textContent = formatFileSize(file.size);
    document.getElementById('ocrFileInfo').style.display = 'flex';
    document.getElementById('extractTextBtn').disabled = false;
}

function handleAiFile(file) {
    appState.aiFile = file;
    document.getElementById('aiFileName').textContent = file.name;
    document.getElementById('aiFileSize').textContent = formatFileSize(file.size);
    document.getElementById('aiFileInfo').style.display = 'flex';
    document.getElementById('runAiToolBtn').disabled = false;
}

function handleBulkFiles(files) {
    if (!auth.isPro()) {
        showNotification('Please upgrade to Pro to use bulk processing', 'error');
        return;
    }

    const validFiles = Array.from(files).filter(file => {
        if (file.type !== 'application/pdf') {
            showNotification(`Skipped ${file.name}: Not a PDF file`, 'warning');
            return false;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit for bulk
            showNotification(`Skipped ${file.name}: File exceeds 10MB limit`, 'warning');
            return false;
        }

        return true;
    });

    // Add to existing files, avoiding duplicates
    validFiles.forEach(file => {
        const exists = appState.bulkFiles.some(f => f.name === file.name && f.size === file.size);
        if (!exists) {
            appState.bulkFiles.push(file);
        }
    });

    updateBulkFileList();
}

function updateBulkFileList() {
    const fileList = document.getElementById('bulkFileList');
    fileList.innerHTML = '';

    if (appState.bulkFiles.length === 0) {
        fileList.style.display = 'none';
        document.getElementById('bulkCompressBtn').disabled = true;
        return;
    }

    fileList.style.display = 'block';
    document.getElementById('bulkCompressBtn').disabled = false;

    appState.bulkFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'bulk-file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <svg class="file-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="25" y="25" width="50" height="50" rx="5" fill="#3182ce"/>
                    <path d="M35 40H65V45H35z M35 50H65V55H35z M35 60H65V65H35z" fill="white"/>
                </svg>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)}</p>
                </div>
            </div>
            <button class="remove-file-btn" onclick="removeBulkFile(${index})">Remove</button>
        `;
        fileList.appendChild(fileItem);
    });
}

function removeBulkFile(index) {
    appState.bulkFiles.splice(index, 1);
    updateBulkFileList();
}

// Initialize Application
const appState = new AppState();
const auth = new AuthenticationManager(appState);
const compressor = new PDFCompressor(appState);

// Event Listeners Setup
document.addEventListener('DOMContentLoaded', function () {
    // Single file upload area
    const singleUploadArea = document.getElementById('singleUploadArea');
    const singleFileInput = document.getElementById('singleFileInput');

    singleUploadArea.addEventListener('click', () => singleFileInput.click());
    singleUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        singleUploadArea.classList.add('dragover');
    });
    singleUploadArea.addEventListener('dragleave', () => {
        singleUploadArea.classList.remove('dragover');
    });
    singleUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        singleUploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleSingleFile(e.dataTransfer.files[0]);
        }
    });
    singleFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleSingleFile(e.target.files[0]);
        }
    });

            // Convert file upload area
            const convertUploadArea = document.getElementById('convertUploadArea');
            const convertFileInput = document.getElementById('convertFileInput');

            convertUploadArea.addEventListener('click', () => convertFileInput.click());
            convertUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                convertUploadArea.classList.add('dragover');
            });
            convertUploadArea.addEventListener('dragleave', () => {
                convertUploadArea.classList.remove('dragover');
            });
            convertUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                convertUploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleConvertFile(e.dataTransfer.files[0]);
                }
            });
            convertFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleConvertFile(e.target.files[0]);
                }
            });

            // OCR file upload area
            const ocrUploadArea = document.getElementById('ocrUploadArea');
            const ocrFileInput = document.getElementById('ocrFileInput');

            ocrUploadArea.addEventListener('click', () => ocrFileInput.click());
            ocrUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                ocrUploadArea.classList.add('dragover');
            });
            ocrUploadArea.addEventListener('dragleave', () => {
                ocrUploadArea.classList.remove('dragover');
            });
            ocrUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                ocrUploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleOcrFile(e.dataTransfer.files[0]);
                }
            });
            ocrFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleOcrFile(e.target.files[0]);
                }
            });

            // AI file upload area
            const aiUploadArea = document.getElementById('aiUploadArea');
            const aiFileInput = document.getElementById('aiFileInput');

            aiUploadArea.addEventListener('click', () => aiFileInput.click());
            aiUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                aiUploadArea.classList.add('dragover');
            });
            aiUploadArea.addEventListener('dragleave', () => {
                aiUploadArea.classList.remove('dragover');
            });
            aiUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                aiUploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length > 0) {
                    handleAiFile(e.dataTransfer.files[0]);
                }
            });
            aiFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleAiFile(e.target.files[0]);
                }
            });

    // Bulk file upload area
    const bulkUploadArea = document.getElementById('bulkUploadArea');
    const bulkFileInput = document.getElementById('bulkFileInput');

    if (bulkUploadArea) {
        bulkUploadArea.addEventListener('click', () => {
            if (auth.isPro()) bulkFileInput.click();
        });
        bulkUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (auth.isPro()) bulkUploadArea.classList.add('dragover');
        });
        bulkUploadArea.addEventListener('dragleave', () => {
            bulkUploadArea.classList.remove('dragover');
        });
        bulkUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            bulkUploadArea.classList.remove('dragover');
            handleBulkFiles(e.dataTransfer.files);
        });
        bulkFileInput.addEventListener('change', (e) => {
            handleBulkFiles(e.target.files);
        });
    }

    // Quality sliders
    document.getElementById('singleImageQuality').addEventListener('input', (e) => {
        document.getElementById('singleQualityValue').textContent = e.target.value + '%';
    });

    document.getElementById('bulkImageQuality').addEventListener('input', (e) => {
        document.getElementById('bulkQualityValue').textContent = e.target.value + '%';
    });

    // Server processing checkbox
    document.getElementById('useServerProcessing').addEventListener('change', (e) => {
        const info = document.getElementById('serverProcessingInfo');
        if (e.target.checked && !auth.isPro()) {
            e.target.checked = false;
            showNotification('Server processing requires Pro subscription', 'error');
        } else {
            info.classList.toggle('show', e.target.checked);
        }
    });

    // Auth form
    document.getElementById('authForm').addEventListener('submit', async (e) => {
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

    // Compression buttons
    document.getElementById('singleCompressBtn').addEventListener('click', async () => {
        if (!appState.singleFile) return;

        const options = {
            compressionLevel: document.getElementById('singleCompressionLevel').value,
            imageQuality: parseInt(document.getElementById('singleImageQuality').value),
            useServer: document.getElementById('useServerProcessing').checked
        };

        try {
            appState.isProcessing = true;
            document.getElementById('singleCompressBtn').disabled = true;
            document.getElementById('singleCompressBtn').classList.add('processing');

            const result = await compressor.compressSingle(appState.singleFile, options);

            // Store compressed blob
            appState.compressedBlob = result.blob;

            // Calculate and display results
            const reductionPercent = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);

            document.getElementById('singleOriginalSize').textContent = formatFileSize(result.originalSize);
            document.getElementById('singleCompressedSize').textContent = formatFileSize(result.compressedSize);
            document.getElementById('singleReductionPercent').textContent = `${reductionPercent}%`;
            document.getElementById('singleProcessingTime').textContent = `${result.processingTime.toFixed(1)}s`;

            // Show results
            document.getElementById('singleResults').style.display = 'block';

            showNotification('PDF compressed successfully!', 'success');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            appState.isProcessing = false;
            document.getElementById('singleCompressBtn').disabled = false;
            document.getElementById('singleCompressBtn').classList.remove('processing');
        }
    });

    // Download button
    document.getElementById('singleDownloadBtn').addEventListener('click', () => {
        if (appState.compressedBlob) {
            const url = URL.createObjectURL(appState.compressedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compressed_${appState.singleFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    });

    // New file button
    document.getElementById('singleNewFileBtn').addEventListener('click', () => {
        resetUI();
    });

    // Bulk compression button
    document.getElementById('bulkCompressBtn').addEventListener('click', async () => {
        if (appState.bulkFiles.length === 0) return;

        const options = {
            compressionLevel: document.getElementById('bulkCompressionLevel').value,
            imageQuality: parseInt(document.getElementById('bulkImageQuality').value)
        };

        try {
            appState.isProcessing = true;
            document.getElementById('bulkCompressBtn').disabled = true;
            document.getElementById('bulkCompressBtn').classList.add('processing');

            const result = await compressor.compressBulk(appState.bulkFiles, options);

            // Store compressed files
            appState.bulkCompressedFiles = result.files;

            // Calculate and display results
            const totalOriginalSize = result.files.reduce((sum, file) => sum + file.originalSize, 0);
            const totalCompressedSize = result.files.reduce((sum, file) => sum + file.compressedSize, 0);
            const totalSavings = totalOriginalSize - totalCompressedSize;
            const averageReduction = ((totalSavings / totalOriginalSize) * 100).toFixed(1);

            document.getElementById('bulkTotalFiles').textContent = result.files.length;
            document.getElementById('bulkTotalSavings').textContent = formatFileSize(totalSavings);
            document.getElementById('bulkAverageReduction').textContent = `${averageReduction}%`;
            document.getElementById('bulkTotalTime').textContent = `${result.totalProcessingTime.toFixed(1)}s`;

            // Show results
            document.getElementById('bulkResults').style.display = 'block';

            showNotification(`Compressed ${result.files.length} files successfully!`, 'success');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            appState.isProcessing = false;
            document.getElementById('bulkCompressBtn').disabled = false;
            document.getElementById('bulkCompressBtn').classList.remove('processing');
        }
    });

    // Bulk download button
    document.getElementById('bulkDownloadBtn').addEventListener('click', async () => {
        if (appState.bulkCompressedFiles.length === 0) return;

        try {
            showNotification('Preparing download...', 'info');

            // In a real implementation, this would download a ZIP from the server
            // For demo purposes, we'll download files individually
            for (const file of appState.bulkCompressedFiles) {
                const url = URL.createObjectURL(file.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.originalName}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 100);

                // Small delay between downloads
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            showNotification('Downloads started!', 'success');
        } catch (error) {
            showNotification('Error preparing download', 'error');
        }
    });

    // New batch button
    document.getElementById('bulkNewBatchBtn').addEventListener('click', () => {
        resetUI();
    });

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            hideAuthModal();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('userDropdown').classList.remove('show');
        }
    });

    // Handle keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAuthModal();
            document.getElementById('userDropdown').classList.remove('show');
        }
    });

    // Convert buttons
    document.getElementById('convertToWordBtn').addEventListener('click', () => {
        if (!appState.convertFile) {
            showNotification('Please select a file first.', 'warning');
            return;
        }
        showNotification(`Converting ${appState.convertFile.name} to Word... (stubbed)`, 'info');
        // In a real implementation, call the backend API here.
    });

    document.getElementById('convertToExcelBtn').addEventListener('click', () => {
        if (!appState.convertFile) {
            showNotification('Please select a file first.', 'warning');
            return;
        }
        showNotification(`Converting ${appState.convertFile.name} to Excel... (stubbed)`, 'info');
        // In a real implementation, call the backend API here.
    });

    document.getElementById('extractTextBtn').addEventListener('click', () => {
        if (!appState.ocrFile) {
            showNotification('Please select a file first.', 'warning');
            return;
        }
        const useOcr = document.getElementById('ocrCheckbox').checked;
        showNotification(`Extracting text from ${appState.ocrFile.name} with OCR enabled: ${useOcr}... (stubbed)`, 'info');
        // In a real implementation, call the backend API here.
    });

    document.getElementById('aiToolSelection').addEventListener('change', (e) => {
        const translateOptions = document.getElementById('translateOptions');
        if (e.target.value === 'translate') {
            translateOptions.style.display = 'block';
        } else {
            translateOptions.style.display = 'none';
        }
    });

    document.getElementById('runAiToolBtn').addEventListener('click', () => {
        if (!appState.aiFile) {
            showNotification('Please select a file first.', 'warning');
            return;
        }
        const tool = document.getElementById('aiToolSelection').value;
        let message = `Running ${tool} on ${appState.aiFile.name}... (stubbed)`;
        if (tool === 'translate') {
            const language = document.getElementById('translateLanguage').value;
            message = `Translating ${appState.aiFile.name} to ${language}... (stubbed)`;
        }
        showNotification(message, 'info');
        // In a real implementation, call the backend API here.
        const resultContainer = document.getElementById('aiResultContainer');
        const resultText = document.getElementById('aiResultText');
        resultText.value = "This is a stubbed result from the AI tool.";
        resultContainer.style.display = 'block';
    });

    document.getElementById('saveToDriveBtn').addEventListener('click', () => {
        if (!appState.compressedBlob) {
            showNotification('No compressed file to save.', 'warning');
            return;
        }
        showNotification('Saving to Google Drive... (stubbed)', 'info');
        // In a real implementation, call the Google Drive API here.
    });
});

// Backend API Integration
class BackendAPI {
    constructor() {
        this.baseURL = 'https://api.pdfsmaller.site';
        this.token = localStorage.getItem('pdfsmaller_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('pdfsmaller_token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async login(email, password) {
        const response = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async register(name, email, password) {
        const response = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async getProfile() {
        return await this.request('/api/auth/profile');
    }

    // Compression endpoints
    async compressSingle(file, options) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('compressionLevel', options.compressionLevel);
        formData.append('imageQuality', options.imageQuality);

        const response = await fetch(`${this.baseURL}/api/compress/single`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Compression failed');
        }

        return await response.blob();
    }

    async compressBulk(files, options) {
        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });

        formData.append('compressionLevel', options.compressionLevel);
        formData.append('imageQuality', options.imageQuality);

        const response = await fetch(`${this.baseURL}/api/compress/bulk`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Bulk compression failed');
        }

        return await response.blob();
    }

    // Payment endpoints
    async createSubscription(plan, paymentMethod) {
        return await this.request('/api/payment/subscribe', {
            method: 'POST',
            body: JSON.stringify({ plan, paymentMethod })
        });
    }

    async getSubscription() {
        return await this.request('/api/payment/subscription');
    }

    async cancelSubscription() {
        return await this.request('/api/payment/cancel', {
            method: 'POST'
        });
    }
}


// Update the BackendAPI class with subscription methods
BackendAPI.prototype.createSubscription = async function (planId, paymentMethodId) {
    return await this.request('/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planId, paymentMethodId })
    });
};

BackendAPI.prototype.cancelSubscription = async function () {
    return await this.request('/api/subscriptions/cancel', {
        method: 'POST'
    });
};

BackendAPI.prototype.getSubscription = async function () {
    return await this.request('/api/subscriptions');
};

// Initialize backend API
const backendAPI = new BackendAPI();


// Update AuthenticationManager to use real backend
AuthenticationManager.prototype.login = async function (email, password) {
    try {
        const response = await backendAPI.login(email, password);
        const user = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            plan: response.user.plan
        };
        this.setUser(user);
        return user;
    } catch (error) {
        throw new Error(error.message || 'Login failed');
    }
};

AuthenticationManager.prototype.register = async function (email, password, name) {
    try {
        const response = await backendAPI.register(name, email, password);
        const user = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            plan: response.user.plan
        };
        this.setUser(user);
        return user;
    } catch (error) {
        throw new Error(error.message || 'Registration failed');
    }
};

// Update AuthenticationManager to handle plan information
AuthenticationManager.prototype.updateUI = function () {
    const guestActions = document.getElementById('guestActions');
    const userActions = document.getElementById('userActions');
    const bulkUpgradePrompt = document.getElementById('bulkUpgradePrompt');
    const bulkProcessingArea = document.getElementById('bulkProcessingArea');
    const useServerCheckbox = document.getElementById('useServerProcessing');

    // Navigation menu auth sections
    const guestAuthSection = document.getElementById('guestAuthSection');
    const userAuthSection = document.getElementById('userAuthSection');

    if (this.appState.user) {
        // Update header user dropdown
        guestActions.classList.add('hidden');
        userActions.classList.remove('hidden');

        document.getElementById('userInitials').textContent =
            this.appState.user.name.charAt(0).toUpperCase();
        document.getElementById('userName').textContent = this.appState.user.name;
        document.getElementById('userPlan').textContent = this.appState.user.plan;

        // Update navigation menu auth sections
        if (guestAuthSection && userAuthSection) {
            guestAuthSection.style.display = 'none';
            userAuthSection.classList.remove('hidden');
            userAuthSection.style.display = 'block';

            // Update navigation menu user info
            const userInitialsNav = document.getElementById('userInitialsNav');
            const userNameNav = document.getElementById('userNameNav');
            const userPlanNav = document.getElementById('userPlanNav');

            if (userInitialsNav) {
                userInitialsNav.textContent = this.appState.user.name.charAt(0).toUpperCase();
            }
            if (userNameNav) {
                userNameNav.textContent = this.appState.user.name;
            }
            if (userPlanNav) {
                const planText = this.appState.user.plan.includes('Pro') ? 'Pro Plan' : 'Free Plan';
                userPlanNav.textContent = planText;

                if (this.appState.user.plan.includes('Pro')) {
                    userPlanNav.innerHTML = `${planText} <span class="plan-badge">Pro</span>`;
                }
            }
        }

        // Update navigation menu authentication state
        if (window.navigationMenu) {
            window.navigationMenu.updateAuthenticationState(this.appState.user);
        }

        // Enable/disable features based on plan
        if (this.appState.user.plan.includes('Pro')) {
            bulkUpgradePrompt.classList.add('hidden');
            bulkProcessingArea.classList.remove('hidden');
            useServerCheckbox.disabled = false;
        } else {
            bulkUpgradePrompt.classList.remove('hidden');
            bulkProcessingArea.classList.add('hidden');
            useServerCheckbox.disabled = true;
        }

        // Update pricing UI if on pricing tab
        if (appState.currentTab === 'pricing') {
            showPricingModal();
        }
    } else {
        // Update header user dropdown
        guestActions.classList.remove('hidden');
        userActions.classList.add('hidden');

        // Update navigation menu auth sections
        if (guestAuthSection && userAuthSection) {
            guestAuthSection.style.display = 'block';
            userAuthSection.classList.add('hidden');
            userAuthSection.style.display = 'none';
        }

        // Update navigation menu authentication state
        if (window.navigationMenu) {
            window.navigationMenu.updateAuthenticationState(null);
        }

        bulkUpgradePrompt.classList.remove('hidden');
        bulkProcessingArea.classList.add('hidden');
        useServerCheckbox.disabled = true;

        // Update pricing UI if on pricing tab
        if (appState.currentTab === 'pricing') {
            showPricingModal();
        }
    }
};

// Update PDFCompressor to use real backend
PDFCompressor.prototype.compressOnServer = async function (file, options) {
    return await backendAPI.compressSingle(file, options);
};

PDFCompressor.prototype.compressBulk = async function (files, options) {
    const blob = await backendAPI.compressBulk(files, options);

    // In a real implementation, the server would return a ZIP file
    // For now, we'll return individual file results
    return {
        files: files.map(file => ({
            originalName: file.name,
            originalSize: file.size,
            compressedSize: Math.floor(file.size * 0.6), // Simulate 40% reduction
            blob: file // In real implementation, this would be the compressed file
        })),
        totalProcessingTime: files.length * 2 // Simulate processing time
    };
};

// Add payment functionality
async function upgradeToPro() {
    if (!appState.user) {
        showAuthModal('register');
        return;
    }

    try {
        showNotification('Redirecting to payment...', 'info');

        // In a real implementation, this would integrate with Stripe or similar
        // For demo purposes, we'll simulate successful payment
        setTimeout(() => {
            appState.user.plan = 'Pro';
            localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));
            auth.updateUI();

            // Update navigation menu plan info
            if (window.navigationMenu) {
                window.navigationMenu.updateUserPlan(appState.user);
            }

            showNotification('Successfully upgraded to Pro!', 'success');
        }, 2000);
    } catch (error) {
        showNotification('Payment failed: ' + error.message, 'error');
    }
}

// Add service worker for offline functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Navigation Menu Functionality - Simplified Version
class NavigationMenu {
    constructor() {
        this.isOpen = false;
        this.hamburgerButton = document.querySelector('.hamburger-menu');
        this.navMenu = document.querySelector('.nav-menu');
        this.navMenuOverlay = document.querySelector('.nav-menu-overlay');
        this.navMenuLinks = document.querySelectorAll('.nav-menu-link[data-tab]');
        this.authMenuLinks = document.querySelectorAll('.nav-menu-link:not([data-tab])');

        this.init();
    }

    init() {
        // Hamburger button click
        if (this.hamburgerButton) {
            this.hamburgerButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        // Overlay click to close
        if (this.navMenuOverlay) {
            this.navMenuOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Navigation links
        this.navMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const tabName = link.getAttribute('data-tab');
                if (tabName) {
                    switchTab(tabName);
                    this.closeMenu();
                    this.updateActiveMenuItem(tabName);
                }
            });
        });

        // Auth menu links
        this.authMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    this.closeMenu();
                }, 100);
            });
        });

        // Set initial active state
        this.updateActiveMenuItem('single');
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.hamburgerButton.classList.add('active');
        this.hamburgerButton.setAttribute('aria-expanded', 'true');
        this.navMenu.classList.add('show');
        this.navMenu.setAttribute('aria-hidden', 'false');
    }

    closeMenu() {
        this.isOpen = false;
        this.hamburgerButton.classList.remove('active');
        this.hamburgerButton.setAttribute('aria-expanded', 'false');
        this.navMenu.classList.remove('show');
        this.navMenu.setAttribute('aria-hidden', 'true');
    }

    updateActiveMenuItem(activeTab) {
        this.navMenuLinks.forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`.nav-menu-link[data-tab="${activeTab}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    updateAuthenticationState(user) {
        const guestSection = document.getElementById('guestAuthSection');
        const userSection = document.getElementById('userAuthSection');
        const userInfo = document.getElementById('userInfoSection');

        if (user) {
            if (guestSection) guestSection.style.display = 'none';
            if (userSection) userSection.style.display = 'block';
            if (userInfo) {
                userInfo.style.display = 'flex';
                const userName = userInfo.querySelector('.user-name');
                const userPlan = userInfo.querySelector('.user-plan');
                if (userName) userName.textContent = user.name || user.email;
                if (userPlan) {
                    userPlan.innerHTML = user.plan === 'pro'
                        ? 'Pro Plan <span class="plan-badge">PRO</span>'
                        : 'Free Plan';
                }
            }
        } else {
            if (guestSection) guestSection.style.display = 'block';
            if (userSection) userSection.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    updateUserPlan(user) {
        if (!user) return;
        const userPlan = document.querySelector('.user-info .user-plan');
        if (userPlan) {
            userPlan.innerHTML = user.plan === 'pro'
                ? 'Pro Plan <span class="plan-badge">PRO</span>'
                : 'Free Plan';
        }
    }
}

// Initialize navigation menu when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.navigationMenu = new NavigationMenu();
    });
} else {
    window.navigationMenu = new NavigationMenu();
}

// Enhanced switchTab function to update navigation menu
const originalSwitchTab = switchTab;
switchTab = function (tabName) {
    // Call original switchTab function
    originalSwitchTab(tabName);

    // Update navigation menu active state
    if (navigationMenu) {
        navigationMenu.updateActiveMenuItem(tabName);
    }
};

// Export functions for global access
window.switchTab = switchTab;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.toggleUserDropdown = toggleUserDropdown;
window.logout = logout;
window.upgradeAccount = upgradeAccount;
window.removeBulkFile = removeBulkFile;
window.upgradeToPro = upgradeToPro;
window.handlePlanSelection = handlePlanSelection;
window.downgradeToFree = downgradeToFree;
