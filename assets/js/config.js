---
---

import { downloadLocalFile, downloadYamlFromGitHub } from './downloads.js';

document.addEventListener('DOMContentLoaded', async () => {
  let ghToken = null;
  
  // Use Liquid to inject the token path from _config.yml
  // The 'jsonify' filter ensures it's a valid JavaScript string (e.g., "secrets/ghtok.txt")
  const githubTokenPath = {{ site.github_settings.token_path | jsonify }};
  
  if (githubTokenPath) {
    try {
      // This creates a full URL that works for local dev and production
      // e.g., http://127.0.0.1:4000/your-repo-name/secrets/ghtok.txt
      // or https://your-username.github.io/your-repo-name/secrets/ghtok.txt
      const tokenUrl = new URL(githubTokenPath, window.location.origin + '{{ site.baseurl }}');
      
      console.log(`Attempting to fetch GitHub token from: ${tokenUrl}`);
      const tokenResponse = await fetch(tokenUrl);
      if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch GitHub token: ${tokenResponse.statusText}`);
      }
      ghToken = (await tokenResponse.text()).trim();
      console.log('GitHub token fetched successfully.');
    } catch (error) {
      console.error('Error fetching GitHub token:', error);
      alert(`Could not load GitHub token from ${githubTokenPath}. GitHub API features may not work.`);
    }
  } else {
    console.warn('site.github_settings.token_path is not defined in _config.yml. GitHub API features will not be available.');
  }
  
  if (ghToken) {
    try {
      // --- INJECTED BY JEKYLL ---
      // These values are now pulled directly from your _config.yml
      const owner = {{ site.github_settings.owner | jsonify }};
      const repo = {{ site.github_settings.repo | jsonify }};
      const path = {{ site.github_settings.config_path | jsonify }};
      const branch = {{ site.github_settings.branch | jsonify }};
      // --- END INJECTED ---
      
      const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      
      console.log('Attempting to fetch machine configuration from private GitHub API...');
      
      const response = await fetch(githubApiUrl, {
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const base64Content = data.content;
      
      if (!base64Content) {
        throw new Error('File content (Base64) not found in GitHub API response.');
      }
      
      const yamlText = atob(base64Content);
      const configResult = jsyaml.load(yamlText);
      console.log('Machine Config loaded from private GitHub YAML:', configResult);
      
    } catch (error) {
      console.error('Failed to load machine configuration from private GitHub:', error);
      alert('Could not load the machine configuration file from private GitHub. Some features may not work. Error: ' + error.message);
    }
  }
  
  // The rest of your existing script follows...
  const llmSettings = {};
  const queryParams = new URLSearchParams(window.location.search);
  // ...
});