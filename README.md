### **Phase 1: Foundation & Core Functionality (Days 1-2)**

**Goal:** A working, ugly-but-functional prototype that compresses a PDF in the browser.

**1. Project Setup:**
   *   Create a new directory for the project.
   *   Initialize a Git repository: `git init`
   *   Initialize npm: `npm init -y`
   *   Create a basic project structure:
        ```
        pdfsmaller/
        ├── index.html
        ├── style.css
        ├── script.js
        ├── package.json
        └── readme.md
        ```
   *   We'll use **Parcel** as our bundler for its simplicity. Install it:
        `npm install --save-dev parcel`
   *   Add a start script to `package.json`:
        ```json
        "scripts": {
          "start": "parcel index.html",
          "build": "parcel build index.html"
        }
        ```

**2. Core HTML Structure (`index.html`):**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>PDFSmaller - Compress PDFs Privately in Your Browser</title>
       <link rel="stylesheet" href="style.css">
   </head>
   <body>
       <header>
           <h1>PDFSmaller</h1>
           <p>Reduce PDF file size instantly. <strong>Your files never leave your computer!</strong></p>
       </header>

       <main>
           <div id="upload-container">
               <p>Drag & drop your PDF here or</p>
               <input type="file" id="file-input" accept=".pdf" />
               <label for="file-input">Choose a file</label>
           </div>

           <div id="controls-container" class="hidden">
               <label for="compression-level">Compression Level:</label>
               <input type="range" id="compression-level" min="0" max="2" step="1" value="1">
               <span id="compression-label">Medium (Good Quality)</span>
               <button id="compress-btn">Compress PDF</button>
           </div>

           <div id="result-container" class="hidden">
               <p>Original Size: <span id="original-size"></span></p>
               <p>New Size: <span id="new-size"></span></p>
               <a id="download-link" class="btn">Download Compressed PDF</a>
           </div>

           <div id="progress" class="hidden">Processing... (This may take a moment for large files)</div>
       </main>

       <script src="https://unpkg.com/pdf-lib@1.17.1"></script>
       <script type="module" src="script.js"></script>
   </body>
   </html>
   ```

**3. Core JavaScript Logic (`script.js`):**
   *   The logic will follow these steps:
        1.  Listen for file input.
        2.  Read the PDF file using `FileReader`.
        3.  Use `pdf-lib` to parse the PDF.
        4.  Implement simple compression techniques:
            *   **`compression-level=0` (Low):** Flatten all form fields, remove all annotations.
            *   **`compression-level=1` (Medium):** Above + downscale images to a reasonable resolution (e.g., 72 DPI). This is the most common and useful step.
            *   **`compression-level=2` (High):** Above + more aggressive image downscaling.
        5.  Save the modified PDF and create a download link.

   *   A basic code structure to get started:
        ```javascript
        import * as PDFLib from 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';

        const fileInput = document.getElementById('file-input');
        const compressionLevel = document.getElementById('compression-level');
        const compressBtn = document.getElementById('compress-btn');
        const downloadLink = document.getElementById('download-link');

        let originalPdfBytes = null;

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                // Show the compression controls
                document.getElementById('controls-container').classList.remove('hidden');
                // Read the file as an ArrayBuffer
                const reader = new FileReader();
                reader.onload = (e) => {
                    originalPdfBytes = new Uint8Array(e.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        });

        compressBtn.addEventListener('click', async () => {
            if (!originalPdfBytes) return;

            document.getElementById('progress').classList.remove('hidden');
            const level = parseInt(compressionLevel.value);

            try {
                // Load the PDF document
                const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);

                // --- Compression Logic Goes Here ---
                // This is where you will iterate through pages and
                // process images based on the selected level.

                // Serialize the PDFDocument to bytes
                const compressedPdfBytes = await pdfDoc.save();

                // Create a Blob and generate a download link
                const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                downloadLink.href = url;
                downloadLink.download = 'compressed.pdf';

                // Show the result container
                document.getElementById('result-container').classList.remove('hidden');
                document.getElementById('progress').classList.add('hidden');

            } catch (error) {
                console.error('Error compressing PDF:', error);
                alert('Failed to compress the PDF. Please try another file.');
                document.getElementById('progress').classList.add('hidden');
            }
        });
        ```
   *   **Note:** The actual image processing logic is the most complex part. `pdf-lib` allows you to get images from pages and embed new ones. You might need a library like `pica` or to use Canvas API to downscale the images before re-embedding them. For the MVP, start with just flattening.

**4. Basic Styling (`style.css`):**
   *   Focus on making the drag-and-drop area clear and the progress feedback obvious. Use a clean, minimalist design.

---

### **Phase 2: Polish & Performance (Days 3-4)**

**Goal:** Make it look good, work reliably, and provide user feedback.

1.  **UI/UX Improvements:**
    *   Style the drag-and-drop zone with a dashed border.
    *   Add a progress bar or spinner for better feedback than just text.
    *   Display the file name and original size.
    *   Calculate and display the size reduction percentage (e.g., "57% smaller!").
2.  **Advanced Compression:**
    *   Research and implement the image downscaling logic using the Canvas API. This is the key to significant compression.
    *   Test with various PDFs (text-only, image-heavy, scanned documents).
3.  **Error Handling:**
    *   Add robust error handling for corrupt files, non-PDF files, etc.
4.  **Deploy!**
    *   Create a free account on **Netlify** or **Vercel**.
    *   Connect your Git repository. Every time you push code, it will deploy automatically.
    *   **You now have a live, functioning product.**

---

### **Phase 3: Monetization & Pro Features (Days 5-7)**

**Goal:** Add a payment wall for the most valuable feature: **Batch Processing**.

1.  **Integrate Stripe:**
    *   Use **Stripe Checkout** for the simplest integration. You can create a "Buy Now" button that unlocks a feature for the user's current browser session.
    *   Create a product in your Stripe dashboard for "PDFSmaller Pro - One-Time Purchase" (e.g., $5).
2.  **Build the Premium Feature:**
    *   **Free Tier:** Single file processing only.
    *   **Pro Tier:** Add a "Add more files..." button that appears after the first file is processed, allowing users to add multiple files to a queue. This should be hidden behind a paywall.
3.  **Gating Logic:**
    *   When the user clicks "Compress" on multiple files, check if they are a paying customer.
    *   If not, intercept the action and show a modal with a compelling message: "**Upgrade to Pro to compress multiple files at once and save hours!**" with a link to your Stripe Checkout page.
    *   Upon successful payment, Stripe will redirect them back to your app. You can use a simple flag in `localStorage` to grant Pro access. For a more robust solution, you'd need a backend to manage licenses, but `localStorage` is a fine MVP solution.
4.  **Final Polish:**
    *   Add a footer with a link to your GitHub, terms of service, and privacy policy (emphasizing the client-side processing).
    *   Add simple analytics (like Plausible.io) to see how people are using it.

### **Recommended Tech Stack Summary**

*   **Frontend:** Vanilla HTML, CSS, and JavaScript (ES6 modules).
*   **Bundler:** Parcel (for ease).
*   **PDF Library:** `pdf-lib` (Client-side).
*   **Image Processing (if needed):** Canvas API or `pica.js`.
*   **Payments:** Stripe Checkout.
*   **Hosting:** Netlify or Vercel.
*   **Database:** None for MVP. Pro status stored in `localStorage`.

This plan is aggressive but very achievable. The focus is on shipping a core valuable function first and then iterating on monetization. Let's start coding!
