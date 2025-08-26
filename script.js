// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const batchButton = document.getElementById('batch-button');
const workspace = document.getElementById('workspace');
const closeWorkspaceBtn = document.getElementById('close-workspace');
const workspaceFilename = document.getElementById('workspace-filename');
const toolsMenuButton = document.getElementById('tools-menu-button');
const toolsMenu = document.getElementById('tools-menu');
const compressBtn = document.getElementById('compress-btn');
const secondaryActions = document.getElementById('secondary-actions');
const optionsPanel = document.getElementById('options-panel');

// State
let currentTool = null;
let currentFile = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // File upload via click and drag
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelection);
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // Batch processing
    batchButton.addEventListener('click', handleBatchProcessing);

    // Workspace management
    closeWorkspaceBtn.addEventListener('click', closeWorkspace);

    // Tools menu management
    toolsMenuButton.addEventListener('click', toggleToolsMenu);
    document.addEventListener('click', closeToolsMenuOnClickOutside);

    // Tool selection from menu
    const toolOptions = document.querySelectorAll('.tool-option');
    toolOptions.forEach(option => {
        option.addEventListener('click', () => selectTool(option.dataset.tool));
    });

    // Primary Action (Compress)
    compressBtn.addEventListener('click', compressPdf);
}

function handleFileSelection(e) {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
}

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }
    currentFile = file;
    openWorkspace(file);
}

function openWorkspace(file) {
    // Hide drop zone, show workspace
    dropZone.style.display = 'none';
    workspace.classList.add('active');
    
    // Set the filename in the workspace header
    workspaceFilename.textContent = file.name;

    // Reset the tools and options
    resetToolbar();
}

function closeWorkspace() {
    workspace.classList.remove('active');
    dropZone.style.display = 'block';
    currentFile = null;
    currentTool = null;
    fileInput.value = ''; // Reset file input
}

function toggleToolsMenu() {
    toolsMenu.classList.toggle('active');
}

function closeToolsMenuOnClickOutside(e) {
    if (toolsMenu.classList.contains('active') && 
        !toolsMenu.contains(e.target) && 
        e.target !== toolsMenuButton) {
        toolsMenu.classList.remove('active');
    }
}

function selectTool(tool) {
    currentTool = tool;
    toolsMenu.classList.remove('active'); // Close the menu after selection
    updateToolbarForTool(tool);
}

function updateToolbarForTool(tool) {
    // Update secondary actions text
    secondaryActions.innerHTML = `<p>Now using: <strong>${getToolName(tool)}</strong>. Configure options below.</p>`;

    // Update the options panel based on the selected tool
    let optionsHtml = '';
    switch(tool) {
        case 'edit':
            optionsHtml = `
                <h4>Edit Options</h4>
                <button class="btn"><i class="fas fa-font"></i> Add Text</button>
                <button class="btn"><i class="fas fa-image"></i> Add Image</button>
                <button class="btn"><i class="fas fa-highlighter"></i> Highlight</button>
            `;
            break;
        case 'ocr':
            optionsHtml = `
                <h4>OCR Options</h4>
                <label><input type="checkbox"> Make text searchable and selectable</label><br>
                <label><input type="checkbox"> Recognize text in multiple languages</label>
                <button class="btn" style="margin-top: 0.5rem;"><i class="fas fa-play"></i> Start OCR</button>
            `;
            break;
        case 'esign':
            optionsHtml = `
                <h4>Add Signature</h4>
                <button class="btn"><i class="fas fa-pen"></i> Draw Signature</button>
                <button class="btn"><i class="fas fa-typing"></i> Type Signature</button>
                <p>Drag and drop your signature onto the PDF preview.</p>
            `;
            break;
        // ... Add cases for other tools (convert, pages, cloud, ai-summarize, etc.)
        default:
            optionsHtml = `<p>Options for ${tool} will be shown here.</p>`;
    }
    optionsPanel.innerHTML = optionsHtml;
}

function getToolName(toolKey) {
    const toolNames = {
        'edit': 'Edit PDF',
        'convert': 'Convert',
        'ocr': 'OCR',
        'pages': 'Organize Pages',
        'esign': 'E-Sign',
        'cloud': 'Cloud Save',
        'ai-summarize': 'AI Summarize',
        'ai-translate': 'AI Translate'
    };
    return toolNames[toolKey] || 'Unknown Tool';
}

function resetToolbar() {
    secondaryActions.innerHTML = `<p>Select a tool from the menu to get started.</p>`;
    optionsPanel.innerHTML = ``;
    currentTool = null;
}

function compressPdf() {
    // This would be connected to your actual compression function
    alert(`Compressing "${currentFile.name}"... (This would run the real compression function)`);
    // Example: pdfCompressionFunction(currentFile);
}

function handleBatchProcessing() {
    alert("Batch processing window would open here, allowing multiple file selection.");
    // This would launch a separate modal or view for handling multiple files.
}