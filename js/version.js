/**
 * Version management for Luxury Todo
 * Generates version based on Git commit count
 */

// Function to get Git commit count
function getGitCommitCount() {
  try {
    // Try to get from localStorage first (set by npm script)
    const storedCommitCount = localStorage.getItem("gitCommitCount");
    if (storedCommitCount) {
      return parseInt(storedCommitCount, 10);
    }

    // Try to get from commit-count.txt file (if available)
    if (typeof fetch !== "undefined") {
      fetch("commit-count.txt")
        .then((response) => {
          if (response.ok) {
            return response.text();
          }
          throw new Error("File not found");
        })
        .then((text) => {
          const commitCount = parseInt(text.trim(), 10);
          if (!isNaN(commitCount)) {
            localStorage.setItem("gitCommitCount", commitCount);
            return commitCount;
          }
          throw new Error("Invalid commit count");
        })
        .catch((error) => {});
    }

    // Try to get from Git (if in a Node.js environment)
    if (typeof require !== "undefined") {
      const { execSync } = require("child_process");
      try {
        const commitCount = execSync("git rev-list --count HEAD")
          .toString()
          .trim();
        return parseInt(commitCount, 10);
      } catch (gitError) {
        console.warn("Could not get Git commit count:", gitError);
      }
    }

    // Fallback: try to get from environment
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.COMMIT_COUNT
    ) {
      return parseInt(process.env.COMMIT_COUNT, 10);
    }

    // Last resort: use a default value
    return 9; // Default commit count (matches current commit count)
  } catch (error) {
    console.warn("Could not determine Git commit count, using default:", error);
    return 9; // Default commit count (matches current commit count)
  }
}

// Function to generate version string
function generateVersion() {
  const commitCount = getGitCommitCount();
  return `v1.0.0-${commitCount}`;
}

// Get the current version
const appVersion = generateVersion();

// Store version in global scope for access by other scripts
window.appVersion = appVersion;

// For debugging
if (window.DEV) {
}

// Display version in footer
function displayVersionInFooter() {
  const versionElement = document.getElementById("appVersion");
  if (versionElement) {
    versionElement.textContent = ` | ${appVersion}`;
    versionElement.className = "app-version";
  }
}

// Call this function when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", displayVersionInFooter);
} else {
  displayVersionInFooter();
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generateVersion,
    getGitCommitCount,
    appVersion,
    displayVersionInFooter,
  };
}
