const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const commitCount = execSync('git rev-list --count HEAD').toString().trim();
    const version = `v1.0.0-${commitCount}`;
    console.log('Setting version to:', version);

    // Update package.json
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = version;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    // Update manifest.json
    const manifestJsonPath = path.join(__dirname, '..', 'manifest.json');
    const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
    manifestJson.version = version;
    fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2) + '\n');

    // Store commit count in a file for web version
    fs.writeFileSync(path.join(__dirname, '..', 'commit-count.txt'), commitCount + '\n');
    console.log('Version updated successfully');
} catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
}
