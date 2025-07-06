const fs = require('fs');
const path = require('path');
const https = require('https');

// Create folder if it doesn't exist
const outputDir = path.join(__dirname, 'src', 'assets', 'hq_map');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created folder: ${outputDir}`);
}

// File download function
function downloadFile(url, filePath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Main download function
async function downloadMapTiles() {
    console.log('🚀 Starting map tiles download...');
    
    const baseUrl = 'https://map.leagueoflegends.com/images/tiles/en_us/terrain_z2_';
    const totalFiles = 64;
    let downloadedCount = 0;
    let failedCount = 0;
    
    // Download multiple files concurrently (concurrent downloads)
    const concurrentLimit = 5;
    const promises = [];
    
    for (let i = 1; i <= totalFiles; i++) {
        const fileNumber = i.toString().padStart(2, '0'); // Add leading zero if single digit
        const url = `${baseUrl}${fileNumber}.jpg`;
        const filename = `terrain_z2_${fileNumber}.jpg`;
        const filePath = path.join(outputDir, filename);
        
        // Create promise for downloading each file
        const downloadPromise = downloadFile(url, filePath)
            .then(() => {
                downloadedCount++;
                console.log(`✅ Download successful: ${filename} (${downloadedCount}/${totalFiles})`);
            })
            .catch((error) => {
                failedCount++;
                console.error(`❌ Download failed: ${filename} - ${error.message}`);
            });
        
        promises.push(downloadPromise);
        
        // Limit concurrent downloads to avoid overwhelming the server
        if (promises.length >= concurrentLimit) {
            await Promise.all(promises);
            promises.length = 0; // Clear array
        }
    }
    
    // Wait for the last files to finish downloading
    if (promises.length > 0) {
        await Promise.all(promises);
    }
    
    console.log('\n📊 Download Summary:');
    console.log(`✅ Successful: ${downloadedCount} files`);
    console.log(`❌ Failed: ${failedCount} files`);
    console.log(`📁 Files saved to: ${outputDir}`);
}

// Execute the function
downloadMapTiles().catch(console.error); 