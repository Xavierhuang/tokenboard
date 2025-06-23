const fs = require('fs');
const path = require('path');

// Create frontend artifacts directory if it doesn't exist
const frontendArtifactsDir = path.join(__dirname, '../frontend/src/artifacts/contracts');
if (!fs.existsSync(frontendArtifactsDir)) {
  fs.mkdirSync(frontendArtifactsDir, { recursive: true });
}

// Copy contract artifacts
const contracts = ['CrowdfundFactory', 'Campaign', 'ProjectToken'];

contracts.forEach(contract => {
  const sourcePath = path.join(__dirname, `../artifacts/contracts/${contract}.sol/${contract}.json`);
  const destPath = path.join(frontendArtifactsDir, `${contract}.sol/${contract}.json`);
  
  // Create directory if it doesn't exist
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${contract}.json to frontend`);
  } else {
    console.warn(`Warning: ${sourcePath} not found. Run 'npm run compile' first.`);
  }
});

console.log('Artifact copying completed!'); 