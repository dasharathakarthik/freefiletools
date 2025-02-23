// Smooth scrolling for navigation
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

// Quality levels for image compression
const qualityLevels = {
    high: 0.8,
    medium: 0.6,
    low: 0.4
};

// Initialize dropzones
const dropzones = [
    { zone: 'imageDropzone', input: 'imageInput', handler: handleImageCompression },
    { zone: 'jpgToPngDropzone', input: 'jpgToPngInput', handler: handleJpgToPng },
    { zone: 'pngToJpgDropzone', input: 'pngToJpgInput', handler: handlePngToJpg }
];

// Initialize all dropzones
dropzones.forEach(({ zone, input, handler }) => {
    const dropzone = document.getElementById(zone);
    const fileInput = document.getElementById(input);

    if (!dropzone || !fileInput) return;

    // Handle drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handler(files);
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handler(files);
            e.target.value = ''; // Reset input
        }
    });
});

// Image Compression
async function handleImageCompression(files) {
    const quality = qualityLevels[document.getElementById('quality').value];
    const results = document.getElementById('compressionResults');
    results.innerHTML = '';

    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="file-info">
                <p class="file-name">Compressing ${file.name}...</p>
            </div>
        `;
        results.appendChild(resultItem);

        try {
            new Compressor(file, {
                quality: quality,
                success(result) {
                    const savedBytes = file.size - result.size;
                    const savedPercentage = ((savedBytes / file.size) * 100).toFixed(1);
                    
                    resultItem.innerHTML = `
                        <div class="file-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-status">Saved ${(savedBytes / 1024).toFixed(2)} KB (${savedPercentage}%)</p>
                        </div>
                        <button onclick="downloadFile('${URL.createObjectURL(result)}', 'compressed_${file.name}')" 
                                class="btn primary">Download</button>
                    `;
                },
                error(err) {
                    resultItem.innerHTML = `
                        <div class="error">Error compressing ${file.name}: ${err.message}</div>
                    `;
                }
            });
        } catch (err) {
            resultItem.innerHTML = `
                <div class="error">Error compressing ${file.name}: ${err.message}</div>
            `;
        }
    }
}

// JPG to PNG conversion
async function handleJpgToPng(files) {
    const results = document.getElementById('jpgToPngResults');
    results.innerHTML = '';

    for (const file of files) {
        if (!file.type.startsWith('image/jpeg')) continue;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="file-info">
                <p class="file-name">Converting ${file.name}...</p>
            </div>
        `;
        results.appendChild(resultItem);

        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const newFileName = file.name.replace(/\.[^/.]+$/, '.png');
                    resultItem.innerHTML = `
                        <div class="file-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-status">Successfully converted to PNG</p>
                        </div>
                        <button onclick="downloadFile('${URL.createObjectURL(blob)}', '${newFileName}')" 
                                class="btn primary">Download PNG</button>
                    `;
                }, 'image/png');
            };
            img.src = URL.createObjectURL(file);
        } catch (err) {
            resultItem.innerHTML = `
                <div class="error">Error converting ${file.name}: ${err.message}</div>
            `;
        }
    }
}

// PNG to JPG conversion
async function handlePngToJpg(files) {
    const results = document.getElementById('pngToJpgResults');
    results.innerHTML = '';

    for (const file of files) {
        if (!file.type.startsWith('image/png')) continue;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="file-info">
                <p class="file-name">Converting ${file.name}...</p>
            </div>
        `;
        results.appendChild(resultItem);

        try {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = 'white'; // Handle transparency
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob((blob) => {
                    const newFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
                    resultItem.innerHTML = `
                        <div class="file-info">
                            <p class="file-name">${file.name}</p>
                            <p class="file-status">Successfully converted to JPG</p>
                        </div>
                        <button onclick="downloadFile('${URL.createObjectURL(blob)}', '${newFileName}')" 
                                class="btn primary">Download JPG</button>
                    `;
                }, 'image/jpeg', 0.9);
            };
            img.src = URL.createObjectURL(file);
        } catch (err) {
            resultItem.innerHTML = `
                <div class="error">Error converting ${file.name}: ${err.message}</div>
            `;
        }
    }
}

// Helper function for downloading files
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 