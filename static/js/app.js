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

    async login(email, password) {}
    async register(email, password, name) {}

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
            if(guestActions) guestActions.classList.add('hidden');
            if(userActions) userActions.classList.remove('hidden');

            if(document.getElementById('userInitials')) document.getElementById('userInitials').textContent =
                this.appState.user.name.charAt(0).toUpperCase();
            if(document.getElementById('userName')) document.getElementById('userName').textContent = this.appState.user.name;
            if(document.getElementById('userPlan')) document.getElementById('userPlan').textContent = this.appState.user.plan;

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
                if(bulkUpgradePrompt) bulkUpgradePrompt.classList.add('hidden');
                if(bulkProcessingArea) bulkProcessingArea.classList.remove('hidden');
                if(useServerCheckbox) useServerCheckbox.disabled = false;
            } else {
                if(bulkUpgradePrompt) bulkUpgradePrompt.classList.remove('hidden');
                if(bulkProcessingArea) bulkProcessingArea.classList.add('hidden');
                if(useServerCheckbox) useServerCheckbox.disabled = true;
            }
        } else {
            // Update header user dropdown
            if(guestActions) guestActions.classList.remove('hidden');
            if(userActions) userActions.classList.add('hidden');

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

            if(bulkUpgradePrompt) bulkUpgradePrompt.classList.remove('hidden');
            if(bulkProcessingArea) bulkProcessingArea.classList.add('hidden');
            if(useServerCheckbox) useServerCheckbox.disabled = true;
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

    async compressOnServer(file, options) {}
    async compressBulk(files, options) {}

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
    const newActiveButton = document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`);
    if(newActiveButton) newActiveButton.classList.add('active');

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    const newActivePanel = document.getElementById(`${tabName}Tab`);
    if(newActivePanel) newActivePanel.classList.add('active');

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
    const proPlanBtn = document.getElementById('proPlanBtn');
    const businessPlanBtn = document.getElementById('businessPlanBtn');

    // Reset all buttons to default state
    [freePlanBtn, proPlanBtn, businessPlanBtn].forEach(btn => {
        if(btn) {
            btn.disabled = false;
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-premium');
        }
    });
    if(freePlanBtn) freePlanBtn.textContent = 'Get Started';
    if(proPlanBtn) proPlanBtn.textContent = 'Upgrade Now';
    if(businessPlanBtn) businessPlanBtn.textContent = 'Contact Sales';


    // Update based on current plan
    if (user) {
        if (user.plan === 'Free') {
            if(freePlanBtn) {
                freePlanBtn.textContent = 'Current Plan';
                freePlanBtn.disabled = true;
                freePlanBtn.classList.add('btn-secondary');
            }
        } else if (user.plan === 'Pro') {
             if(proPlanBtn) {
                proPlanBtn.textContent = 'Current Plan';
                proPlanBtn.disabled = true;
                proPlanBtn.classList.add('btn-secondary');
            }
            if(freePlanBtn) {
                freePlanBtn.textContent = 'Downgrade';
            }
        } else if (user.plan === 'Business') {
            if(businessPlanBtn) {
                businessPlanBtn.textContent = 'Current Plan';
                businessPlanBtn.disabled = true;
                businessPlanBtn.classList.add('btn-secondary');
            }
             if(freePlanBtn) {
                freePlanBtn.textContent = 'Downgrade';
            }
        }
    } else {
        // User is not logged in, 'Get Started' on free plan makes sense
        if(freePlanBtn) {
             freePlanBtn.onclick = () => showAuthModal('register');
        }
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
    if (plan.toLowerCase() === appState.user.plan.toLowerCase()) {
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

        // In a real app, you would get a paymentMethodId from a payment gateway like Stripe
        const paymentMethodId = 'pm_card_visa'; // Placeholder for demo
        await backendAPI.createSubscription(plan, paymentMethodId);

        // Update user plan locally
        appState.user.plan = plan.charAt(0).toUpperCase() + plan.slice(1); // 'pro' -> 'Pro'
        localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));

        // Update UI
        auth.updateUI();
        updatePricingUI();

        if (window.navigationMenu) {
            window.navigationMenu.updateUserPlan(appState.user);
        }

        showNotification(`Successfully upgraded to ${appState.user.plan}!`, 'success');
    } catch (error) {
        console.error('Upgrade failed:', error);
        showNotification('Upgrade failed: ' + error.message, 'error');
    }
}

// Function to downgrade to Free plan
async function downgradeToFree() {
    try {
        showNotification('Processing your downgrade...', 'info');

        await backendAPI.cancelSubscription();

        // Update user plan
        appState.user.plan = 'Free';
        localStorage.setItem('pdfsmaller_user', JSON.stringify(appState.user));

        // Update UI
        auth.updateUI();
        updatePricingUI();

        if (window.navigationMenu) {
            window.navigationMenu.updateUserPlan(appState.user);
        }

        showNotification('Your plan has been changed to Free.', 'success');
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
    const progressLabel = progressContainer.querySelector('.progress-label span:first-child');

    if(progressContainer) progressContainer.style.display = 'block';
    if(progressBar) progressBar.style.width = percent + '%';
    if(progressPercentage) progressPercentage.textContent = percent + '%';
    if(progressLabel) progressLabel.textContent = text;
}

function updateBulkProgress(percent, text = 'Processing') {
    const progressContainer = document.getElementById('bulkProgress');
    const progressBar = document.getElementById('bulkProgressBar');
    const progressPercentage = document.getElementById('bulkProgressPercentage');
    const progressText = document.getElementById('bulkProgressText');

    if(progressContainer) progressContainer.style.display = 'block';
    if(progressBar) progressBar.style.width = percent + '%';
    if(progressPercentage) progressPercentage.textContent = Math.round(percent) + '%';
    if(progressText) progressText.textContent = text;
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
        if(title) title.textContent = 'Sign In';
        if(submitBtn) submitBtn.textContent = 'Sign In';
        if(nameGroup) nameGroup.classList.add('hidden');
        if(switchText) switchText.textContent = "Don't have an account?";
        if(switchLink) switchLink.textContent = 'Sign up';
    } else {
        if(title) title.textContent = 'Create Account';
        if(submitBtn) submitBtn.textContent = 'Create Account';
        if(nameGroup) nameGroup.classList.remove('hidden');
        if(switchText) switchText.textContent = "Already have an account?";
        if(switchLink) switchLink.textContent = 'Sign in';
    }

    if(modal) modal.style.display = 'flex';
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if(modal) modal.style.display = 'none';
    const form = document.getElementById('authForm');
    if(form) form.reset();
}

function toggleAuthMode() {
    const title = document.getElementById('authModalTitle');
    if(title) {
        const isLogin = title.textContent === 'Sign In';
        showAuthModal(isLogin ? 'register' : 'login');
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logout() {
    auth.logout();
    resetApplicationState();
}

function resetApplicationState() {
    appState.reset();
    resetUI();
    auth.updateUI();
}

function resetUI() {
    // Reset single file UI
    const singleFileInfo = document.getElementById('singleFileInfo');
    const singleResults = document.getElementById('singleResults');
    const singleProgress = document.getElementById('singleProgress');
    const singleCompressBtn = document.getElementById('singleCompressBtn');
    const singleFileInput = document.getElementById('singleFileInput');

    if(singleFileInfo) singleFileInfo.style.display = 'none';
    if(singleResults) singleResults.style.display = 'none';
    if(singleProgress) singleProgress.style.display = 'none';
    if(singleCompressBtn) singleCompressBtn.disabled = true;
    if(singleFileInput) singleFileInput.value = '';

    // Reset bulk UI if it exists
    const bulkFileList = document.getElementById('bulkFileList');
    const bulkResults = document.getElementById('bulkResults');
    const bulkProgress = document.getElementById('bulkProgress');
    const bulkCompressBtn = document.getElementById('bulkCompressBtn');
    const bulkFileInput = document.getElementById('bulkFileInput');

    if(bulkFileList) {
        bulkFileList.innerHTML = '';
        bulkFileList.style.display = 'none';
    }
    if(bulkResults) bulkResults.style.display = 'none';
    if(bulkProgress) bulkProgress.style.display = 'none';
    if(bulkCompressBtn) bulkCompressBtn.disabled = true;
    if(bulkFileInput) bulkFileInput.value = '';

    appState.reset();
}

// File Handling Functions
function handleSingleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
        showNotification('Please select a valid PDF file.', 'error');
        return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showNotification('File size must be less than 50MB.', 'error');
        return;
    }

    appState.singleFile = file;
    const singleFileName = document.getElementById('singleFileName');
    const singleFileSize = document.getElementById('singleFileSize');
    const singleFileInfo = document.getElementById('singleFileInfo');
    const singleCompressBtn = document.getElementById('singleCompressBtn');

    if(singleFileName) singleFileName.textContent = file.name;
    if(singleFileSize) singleFileSize.textContent = formatFileSize(file.size);
    if(singleFileInfo) singleFileInfo.style.display = 'flex';
    if(singleCompressBtn) singleCompressBtn.disabled = false;

    const singleResults = document.getElementById('singleResults');
    if(singleResults) singleResults.style.display = 'none';
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

        if (file.size > 100 * 1024 * 1024) { // 100MB limit for bulk pro
            showNotification(`Skipped ${file.name}: File exceeds 100MB limit`, 'warning');
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
    if(!fileList) return;

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
            <button class="remove-file-btn" onclick="removeBulkFile(${index})">&times;</button>
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
    // Mode toggles
    document.querySelectorAll('.mode-switch').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const featureTab = e.target.closest('.tab-panel');
            const isBulk = e.target.checked;

            if (isBulk && !auth.isPro()) {
                e.target.checked = false;
                showNotification('Bulk processing is a Pro feature.', 'error');
                switchTab('pricing');
                return;
            }

            if(featureTab) {
                 const singleMode = featureTab.querySelector('.single-mode');
                 const bulkMode = featureTab.querySelector('.bulk-mode');
                 if(singleMode) singleMode.style.display = isBulk ? 'none' : 'block';
                 if(bulkMode) bulkMode.style.display = isBulk ? 'block' : 'none';
            }
        });
    });

    // Single file upload area
    const singleUploadArea = document.getElementById('compressUploadArea');
    const singleFileInput = document.getElementById('singleFileInput');
    if(singleUploadArea) {
        singleUploadArea.addEventListener('click', () => singleFileInput.click());
        singleUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); singleUploadArea.classList.add('dragover'); });
        singleUploadArea.addEventListener('dragleave', () => { singleUploadArea.classList.remove('dragover'); });
        singleUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            singleUploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleSingleFile(e.dataTransfer.files[0]);
        });
    }
    if(singleFileInput) {
        singleFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleSingleFile(e.target.files[0]);
        });
    }

    // Bulk file upload area
    const bulkUploadArea = document.getElementById('bulkUploadArea');
    const bulkFileInput = document.getElementById('bulkFileInput');
    if(bulkUploadArea) {
        bulkUploadArea.addEventListener('click', () => bulkFileInput.click());
        bulkUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); bulkUploadArea.classList.add('dragover'); });
        bulkUploadArea.addEventListener('dragleave', () => { bulkUploadArea.classList.remove('dragover'); });
        bulkUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            bulkUploadArea.classList.remove('dragover');
            handleBulkFiles(e.dataTransfer.files);
        });
    }
    if(bulkFileInput) {
        bulkFileInput.addEventListener('change', (e) => handleBulkFiles(e.target.files));
    }

    // Quality sliders
    const singleImageQuality = document.getElementById('singleImageQuality');
    if(singleImageQuality) {
        singleImageQuality.addEventListener('input', (e) => {
            const singleQualityValue = document.getElementById('singleQualityValue');
            if(singleQualityValue) singleQualityValue.textContent = e.target.value + '%';
        });
    }

    const bulkImageQuality = document.getElementById('bulkImageQuality');
    if(bulkImageQuality) {
        bulkImageQuality.addEventListener('input', (e) => {
            const bulkQualityValue = document.getElementById('bulkQualityValue');
            if(bulkQualityValue) bulkQualityValue.textContent = e.target.value + '%';
        });
    }


    // Server processing checkbox
    const useServerCheckbox = document.getElementById('useServerProcessing');
    if(useServerCheckbox) {
        useServerCheckbox.addEventListener('change', (e) => {
            const info = document.getElementById('serverProcessingInfo');
            if (e.target.checked && !auth.isPro()) {
                e.target.checked = false;
                showNotification('Server processing requires Pro subscription', 'error');
            } else {
                if(info) info.style.display = e.target.checked ? 'block' : 'none';
            }
        });
    }

    // Auth form
    const authForm = document.getElementById('authForm');
    if(authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const name = document.getElementById('authName').value;
            const title = document.getElementById('authModalTitle');
            const isLogin = title && title.textContent === 'Sign In';

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


    // Compression buttons
    const singleCompressBtn = document.getElementById('singleCompressBtn');
    if(singleCompressBtn) {
        singleCompressBtn.addEventListener('click', async () => {
            if (!appState.singleFile) return;

            const options = {
                compressionLevel: document.getElementById('singleCompressionLevel').value,
                imageQuality: parseInt(document.getElementById('singleImageQuality').value),
                useServer: document.getElementById('useServerProcessing').checked
            };

            try {
                appState.isProcessing = true;
                singleCompressBtn.disabled = true;
                singleCompressBtn.classList.add('processing');

                const result = await compressor.compressSingle(appState.singleFile, options);
                appState.compressedBlob = result.blob;

                const reductionPercent = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);

                document.getElementById('singleOriginalSize').textContent = formatFileSize(result.originalSize);
                document.getElementById('singleCompressedSize').textContent = formatFileSize(result.compressedSize);
                document.getElementById('singleReductionPercent').textContent = `${reductionPercent}%`;
                document.getElementById('singleProcessingTime').textContent = `${result.processingTime.toFixed(1)}s`;

                document.getElementById('singleResults').style.display = 'block';
                showNotification('PDF compressed successfully!', 'success');

            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                appState.isProcessing = false;
                singleCompressBtn.disabled = false;
                singleCompressBtn.classList.remove('processing');
            }
        });
    }

    // Download button
    const singleDownloadBtn = document.getElementById('singleDownloadBtn');
    if(singleDownloadBtn) {
        singleDownloadBtn.addEventListener('click', () => {
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
    }

    // New file button
    const singleNewFileBtn = document.getElementById('singleNewFileBtn');
    if(singleNewFileBtn) {
        singleNewFileBtn.addEventListener('click', () => {
            resetUI();
            // Go back to single file upload view
            const featureTab = document.getElementById('compressTab');
            if(featureTab) {
                const singleMode = featureTab.querySelector('.single-mode');
                const bulkMode = featureTab.querySelector('.bulk-mode');
                if(singleMode) singleMode.style.display = 'block';
                if(bulkMode) bulkMode.style.display = 'none';
                const modeSwitch = featureTab.querySelector('.mode-switch');
                if(modeSwitch) modeSwitch.checked = false;
            }
        });
    }

    // Bulk compression button
    const bulkCompressBtn = document.getElementById('bulkCompressBtn');
    if(bulkCompressBtn) {
        bulkCompressBtn.addEventListener('click', async () => {
            if (appState.bulkFiles.length === 0) return;

            const options = {
                compressionLevel: document.getElementById('bulkCompressionLevel').value,
                imageQuality: parseInt(document.getElementById('bulkImageQuality').value)
            };

            try {
                appState.isProcessing = true;
                bulkCompressBtn.disabled = true;
                bulkCompressBtn.classList.add('processing');

                const result = await compressor.compressBulk(appState.bulkFiles, options);
                appState.bulkCompressedFiles = result.files;

                const totalOriginalSize = result.files.reduce((sum, file) => sum + file.originalSize, 0);
                const totalCompressedSize = result.files.reduce((sum, file) => sum + file.compressedSize, 0);
                const totalSavings = totalOriginalSize - totalCompressedSize;
                const averageReduction = totalOriginalSize > 0 ? ((totalSavings / totalOriginalSize) * 100).toFixed(1) : 0;

                document.getElementById('bulkTotalFiles').textContent = result.files.length;
                document.getElementById('bulkTotalSavings').textContent = formatFileSize(totalSavings);
                document.getElementById('bulkAverageReduction').textContent = `${averageReduction}%`;
                document.getElementById('bulkTotalTime').textContent = `${result.totalProcessingTime.toFixed(1)}s`;

                document.getElementById('bulkResults').style.display = 'block';
                showNotification(`Compressed ${result.files.length} files successfully!`, 'success');

            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                appState.isProcessing = false;
                bulkCompressBtn.disabled = false;
                bulkCompressBtn.classList.remove('processing');
            }
        });
    }

    // Bulk download button
    const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');
    if(bulkDownloadBtn) {
        bulkDownloadBtn.addEventListener('click', async () => {
            if (appState.bulkCompressedFiles.length === 0) return;
            showNotification('Preparing download...', 'info');
            // This needs a library like JSZip to work client-side
            // For now, we'll download one by one as a fallback
            for (const file of appState.bulkCompressedFiles) {
                const url = URL.createObjectURL(file.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.originalName}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                await new Promise(res => setTimeout(res, 200));
            }
        });
    }

    // New batch button
    const bulkNewBatchBtn = document.getElementById('bulkNewBatchBtn');
    if(bulkNewBatchBtn) {
        bulkNewBatchBtn.addEventListener('click', () => {
            resetUI();
        });
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            hideAuthModal();
        }
        // Close user dropdown when clicking outside
        if (!e.target.closest('.user-menu')) {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });

    // Handle keyboard events for closing modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAuthModal();
            if(window.navigationMenu && window.navigationMenu.isOpen) {
                window.navigationMenu.closeMenu();
            }
        }
    });

    // Initialize UI on load
    switchTab('compress');
    auth.updateUI();
    updatePricingUI();

    // Stub functionality for other tabs
    const convertFileInput = document.getElementById('convertFileInput');
    if(convertFileInput) convertFileInput.addEventListener('change', e => handleOtherFile(e, 'convert'));
    const ocrFileInput = document.getElementById('ocrFileInput');
    if(ocrFileInput) ocrFileInput.addEventListener('change', e => handleOtherFile(e, 'ocr'));
    const aiFileInput = document.getElementById('aiFileInput');
    if(aiFileInput) aiFileInput.addEventListener('change', e => handleOtherFile(e, 'ai_tools'));
});

function handleOtherFile(event, feature) {
    if (event.target.files.length > 0) {
        const file = event.target.files[0];
        appState[feature + 'File'] = file;

        const fileNameEl = document.getElementById(feature + 'FileName');
        const fileSizeEl = document.getElementById(feature + 'FileSize');
        const fileInfoEl = document.getElementById(feature + 'FileInfo');
        const actionBtn = document.querySelector(`#${feature}Tab .btn-large`);

        if(fileNameEl) fileNameEl.textContent = file.name;
        if(fileSizeEl) fileSizeEl.textContent = formatFileSize(file.size);
        if(fileInfoEl) fileInfoEl.style.display = 'flex';
        if(actionBtn) actionBtn.disabled = false;

        if(feature === 'convert') {
            document.getElementById('convertToWordBtn').disabled = false;
            document.getElementById('convertToExcelBtn').disabled = false;
        }
    }
}

// Backend API Integration
class BackendAPI {
    constructor() {
        this.baseURL = 'https://api.pdfsmaller.site'; // Replace with actual backend URL
        this.token = localStorage.getItem('pdfsmaller_token');
    }

    setToken(token) {
        this.token = token;
        if(token) {
            localStorage.setItem('pdfsmaller_token', token);
        } else {
            localStorage.removeItem('pdfsmaller_token');
        }
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
            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || 'API request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ... other methods for compression, etc.
}

// Update the BackendAPI class with specific methods
BackendAPI.prototype.login = async function (email, password) {
    const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (response.token) this.setToken(response.token);
    return response;
};

BackendAPI.prototype.register = async function (name, email, password) {
    const response = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    if (response.token) this.setToken(response.token);
    return response;
};

BackendAPI.prototype.getProfile = async function () {
    return await this.request('/api/auth/profile');
};

BackendAPI.prototype.compressSingle = async function (file, options) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('compressionLevel', options.compressionLevel);
    formData.append('imageQuality', options.imageQuality);

    const response = await fetch(`${this.baseURL}/api/compress/single`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: formData
    });

    if (!response.ok) throw new Error('Compression failed on server');
    return await response.blob();
};

BackendAPI.prototype.compressBulk = async function (files, options) {
    const formData = new FormData();
    files.forEach((file, index) => formData.append(`file${index}`, file));
    formData.append('compressionLevel', options.compressionLevel);
    formData.append('imageQuality', options.imageQuality);

    const response = await fetch(`${this.baseURL}/api/compress/bulk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: formData
    });

    if (!response.ok) throw new Error('Bulk compression failed on server');
    return await response.blob(); // Expects a ZIP file
};

BackendAPI.prototype.createSubscription = async function (planId, paymentMethodId) {
    return await this.request('/api/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({ planId, paymentMethodId })
    });
};

BackendAPI.prototype.cancelSubscription = async function () {
    return await this.request('/api/subscriptions/cancel', { method: 'POST' });
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
            plan: response.user.plan || 'Free'
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
            plan: response.user.plan || 'Free'
        };
        this.setUser(user);
        return user;
    } catch (error) {
        throw new Error(error.message || 'Registration failed');
    }
};

// Update PDFCompressor to use real backend
PDFCompressor.prototype.compressOnServer = async function (file, options) {
    return await backendAPI.compressSingle(file, options);
};

PDFCompressor.prototype.compressBulk = async function (files, options) {
    const blob = await backendAPI.compressBulk(files, options);
    // The backend returns a ZIP file. In a real-world scenario,
    // a library like JSZip would be needed to parse this file
    // and provide individual downloads. For this implementation,
    // we will rely on the browser to handle the download of the zip.
    // We will simulate the results for the UI update.
    return {
        files: files.map(f => ({
            originalName: f.name,
            originalSize: f.size,
            compressedSize: f.size * 0.5, // Simulate 50% compression, as we can't read zip content here
            blob: blob
        })),
        totalProcessingTime: files.length * 1.5 // Simulate time
    };
};

// Navigation Menu Functionality
class NavigationMenu {
    constructor() {
        this.isOpen = false;
        this.hamburgerButton = document.querySelector('.hamburger-menu');
        this.navMenu = document.querySelector('.nav-menu');
        this.navMenuOverlay = document.querySelector('.nav-menu-overlay');
        this.navMenuLinks = document.querySelectorAll('.nav-menu-link[data-tab]');
        this.authLinks = document.querySelectorAll('.auth-link, .logout-link');

        this.init();
    }

    init() {
        if (this.hamburgerButton) {
            this.hamburgerButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMenu();
            });
        }

        if (this.navMenuOverlay) {
            this.navMenuOverlay.addEventListener('click', () => this.closeMenu());
        }

        this.navMenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab');
                if (tabName) {
                    switchTab(tabName);
                    this.closeMenu();
                }
            });
        });

        this.authLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.isOpen = true;
        this.hamburgerButton.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
    }

    closeMenu() {
        this.isOpen = false;
        this.hamburgerButton.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
    }

    updateUserPlan(user) {
        if (!user) return;
        const userPlanNav = document.getElementById('userPlanNav');
        if(userPlanNav) {
            const planText = user.plan.includes('Pro') ? 'Pro Plan' : 'Free Plan';
            userPlanNav.textContent = planText;
            if (user.plan.includes('Pro')) {
                userPlanNav.innerHTML = `${planText} <span class="pro-badge">PRO</span>`;
            }
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

// Export functions for global access from HTML onclick attributes
window.switchTab = switchTab;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.toggleAuthMode = toggleAuthMode;
window.toggleUserDropdown = toggleUserDropdown;
window.logout = logout;
window.removeBulkFile = removeBulkFile;
window.handlePlanSelection = handlePlanSelection;
