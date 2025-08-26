    document.addEventListener('DOMContentLoaded', function() {
        // DOM Elements
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const compressionLevel = document.getElementById('compressionLevel');
        const imageQuality = document.getElementById('imageQuality');
        const qualityValue = document.getElementById('qualityValue');
        const serverProcessing = document.getElementById('serverProcessing');
        const serverInfo = document.getElementById('serverInfo');
        const compressBtn = document.getElementById('compressBtn');
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        const results = document.getElementById('results');
        const originalSize = document.getElementById('originalSize');
        const compressedSize = document.getElementById('compressedSize');
        const reductionPercent = document.getElementById('reductionPercent');
        const processingTime = document.getElementById('processingTime');
        const originalBar = document.getElementById('originalBar');
        const compressedBar = document.getElementById('compressedBar');
        const originalStats = document.getElementById('originalStats');
        const compressedStats = document.getElementById('compressedStats');
        const downloadBtn = document.getElementById('downloadBtn');
        const newFileBtn = document.getElementById('newFileBtn');

        // State variables
        let selectedFile = null;
        let compressedPdfBlob = null;
        let startTime = null;

        // Event Listeners
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        imageQuality.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value + '%';
        });

        serverProcessing.addEventListener('change', (e) => {
            serverInfo.style.display = e.target.checked ? 'block' : 'none';
        });

        compressBtn.addEventListener('click', async () => {
            if (!selectedFile) return;
            startTime = new Date();
            await compressPDF();
        });

        downloadBtn.addEventListener('click', () => {
            if (compressedPdfBlob) {
                const url = URL.createObjectURL(compressedPdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = selectedFile.name.replace('.pdf', '_compressed.pdf');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });

        newFileBtn.addEventListener('click', () => {
            resetUI();
        });

        // Functions
        function handleFileSelect(file) {
            if (file.type !== 'application/pdf') {
                showNotification('Please select a valid PDF file.', 'error');
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                showNotification('File size must be less than 50MB.', 'error');
                return;
            }

            selectedFile = file;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            
            fileInfo.style.display = 'flex';
            compressBtn.disabled = false;
            results.style.display = 'none';
            resultPlaceholder.style.display = 'block';
        }

        function updateProgress(percent) {
            progressBar.style.width = percent + '%';
            progressPercentage.textContent = percent + '%';
        }

// Fix 1: Update the compressPDF function to pass imageQuality to server
async function compressPDF() {
    if (!selectedFile) return;

    compressBtn.disabled = true;
    compressBtn.textContent = 'Compressing...';
    compressBtn.classList.add('processing');
    
    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        updateProgress(20);

        if (serverProcessing.checked) {
            // Server-side processing - NOW PASSING IMAGE QUALITY
            updateProgress(40);
            compressedPdfBlob = await compressWithServer(
                new Uint8Array(arrayBuffer),
                compressionLevel.value,  // Pass compression level
                imageQuality.value       // Pass image quality
            );
            updateProgress(100);
        } else {
            // Client-side processing
            updateProgress(40);
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            updateProgress(60);
            
            // Apply compression settings
            const compressionLevelValue = compressionLevel.value;
            const imageQualityValue = parseInt(imageQuality.value); // Get image quality value
            
            const options = {
                useObjectStreams: true,
                addDefaultPage: true,
                objectsPerTick: 100,
            };
            
            // Adjust options based on compression level
            if (compressionLevelValue === 'maximum') {
                options.useObjectStreams = false;
            }
            
            const compressedBytes = await pdfDoc.save(options);
            updateProgress(80);
            
            // Note: PDF-lib doesn't support image quality adjustment directly
            // For true image compression, you'd need to extract images, compress them,
            // and rebuild the PDF - this requires more complex processing
            
            compressedPdfBlob = new Blob([compressedBytes], { type: 'application/pdf' });
            updateProgress(100);
        }
        
        // Calculate and display results
        const endTime = new Date();
        const processingTimeMs = endTime - startTime;
        const originalSizeBytes = selectedFile.size;
        const compressedSizeBytes = compressedPdfBlob.size;
        const compressionRatio = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(1);
        
        originalSize.textContent = formatFileSize(originalSizeBytes);
        compressedSize.textContent = formatFileSize(compressedSizeBytes);
        reductionPercent.textContent = compressionRatio + '%';
        processingTime.textContent = (processingTimeMs / 1000).toFixed(1) + 's';
        
        // Update comparison bars
        const maxSize = Math.max(originalSizeBytes, compressedSizeBytes);
        const originalWidth = (originalSizeBytes / maxSize * 100).toFixed(1);
        const compressedWidth = (compressedSizeBytes / maxSize * 100).toFixed(1);
        
        originalBar.style.width = originalWidth + '%';
        compressedBar.style.width = compressedWidth + '%';
        
        originalStats.textContent = formatFileSize(originalSizeBytes);
        compressedStats.textContent = formatFileSize(compressedSizeBytes);
        
        // Show results
        resultPlaceholder.style.display = 'none';
        results.style.display = 'block';
        
        showNotification('PDF compressed successfully!', 'success');
        
    } catch (error) {
        console.error('Compression error:', error);
        showNotification('An error occurred during compression. Please try again.', 'error');
    }
    
    compressBtn.disabled = false;
    compressBtn.textContent = 'Compress PDF';
    compressBtn.classList.remove('processing');
}

// Fix 2: Update compressWithServer function signature (it was missing parameters)
async function compressWithServer(pdfBytes, compressionLevel, imageQuality) {
    // Create FormData object
    const formData = new FormData();
    
    // Convert Uint8Array to Blob and append to FormData
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    formData.append('file', pdfBlob, 'document.pdf');
    
    // Add compression parameters
    formData.append('compressionLevel', compressionLevel);
    formData.append('imageQuality', imageQuality);
    
    try {
        // Send to server - update with your production URL
        const response = await fetch('https://api.pdfsmaller.site/api/compress', {
            method: 'POST',
            body: formData
        });
        console.log('Backend Response Status: ', response.ok);
        console.log('Compression Level:', compressionLevel);
        console.log('Image Quality:', imageQuality);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server returned ${response.status}`);
        }
        
        // Return the compressed file as Blob
        return await response.blob();
    } catch (error) {
        console.error('Server compression error:', error);
        throw new Error('Failed to compress PDF on server: ' + error.message);
    }
}
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            
            // Add icon based on type
            let iconSvg = '';
            if (type === 'success') {
                iconSvg = '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#38a169" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            } else {
                iconSvg = '<svg class="notification-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#e53e3e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
            
            notification.innerHTML = `${iconSvg} <span>${message}</span>`;
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Hide after 3 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }

        function resetUI() {
            selectedFile = null;
            compressedPdfBlob = null;
            fileInput.value = '';
            fileInfo.style.display = 'none';
            compressBtn.disabled = true;
            results.style.display = 'none';
            resultPlaceholder.style.display = 'block';
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            serverInfo.style.display = 'none';
            serverProcessing.checked = false;
        }

        // Initialize
        updateProgress(0);
    }