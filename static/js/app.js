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
}

// PDF Compression Engine
class PDFCompressor {
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
}

// Function to handle plan selection
function handlePlanSelection(plan) {
}

// Function to upgrade to Pro plan
async function upgradeToPro(plan) {
}

// Function to downgrade to Free plan
async function downgradeToFree() {
}


function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateSingleProgress(percent, text = 'Processing') {
}

function updateBulkProgress(percent, text = 'Processing') {
}

function showNotification(message, type = 'success') {
}

// Modal Functions
function showAuthModal(mode) {
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
}

function resetUI() {
}

// File Handling Functions
function handleSingleFile(file) {
}

function handleConvertFile(file) {
}

function handleOcrFile(file) {
}

function handleAiFile(file) {
}

function handleBulkFiles(files) {
}

function updateBulkFileList() {
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
}


// Update the BackendAPI class with subscription methods
BackendAPI.prototype.createSubscription = async function (planId, paymentMethodId) {
};

BackendAPI.prototype.cancelSubscription = async function () {
};

BackendAPI.prototype.getSubscription = async function () {
    return await this.request('/api/subscriptions');
};

// Initialize backend API
const backendAPI = new BackendAPI();


// Update AuthenticationManager to use real backend
AuthenticationManager.prototype.login = async function (email, password) {
};

AuthenticationManager.prototype.register = async function (email, password, name) {
};

// Update AuthenticationManager to handle plan information
AuthenticationManager.prototype.updateUI = function () {
};

// Update PDFCompressor to use real backend
PDFCompressor.prototype.compressOnServer = async function (file, options) {
    return await backendAPI.compressSingle(file, options);
};

PDFCompressor.prototype.compressBulk = async function (files, options) {
};

// Add payment functionality
async function upgradeToPro() {
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
