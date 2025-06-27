import { downloadLocalFile, downloadYamlFromGitHub } from './assets/js/downloads.js';

document.addEventListener('DOMContentLoaded', async () => { // Ensure this function is async// let githubToken = null;
  // Use 'ghtok' from your config to get the token path
  let ghToken = null;
  const githubTokenPath = window.machineConfig.ghtok;
  
  const down = downloadYamlFromGitHub(githubTokenPath);

  if (githubTokenPath) {
      try {
          console.log(`Attempting to fetch GitHub token from: ${githubTokenPath}`);
          const tokenResponse = await fetch('https://localhost/' + githubTokenPath);
          if (!tokenResponse.ok) {
              throw new Error(`Failed to fetch GitHub token: ${tokenResponse.status} ${tokenResponse.statusText}`);
          }
          ghToken = (await tokenResponse.text()).trim();
          console.log('GitHub token fetched successfully.');
      } catch (error) {
          console.error('Error fetching GitHub token:', error);
          alert(`Could not load GitHub token from ${githubTokenPath}. GitHub API features may not work.`);
      }
  } else {
      console.warn('window.machineConfig.ghtok is not defined. GitHub API features will not be available.');
  }

  if (!ghToken) {
    console.warn('GitHub Personal Access Token is not set');
  } else {
    try {
      const owner = 'thingking-machine'; // Your GitHub username or organization
      const repo = 'thingking_machine'; // The name of your private repository
      const path = 'machina.yaml'; // The path to the YAML file within the repo
      const branch = 'main'; // The branch where the file is located (e.g., 'main', 'master', 'dev')
      
      // Construct the GitHub API URL for repository contents
      const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      
      console.log('Attempting to fetch machine configuration from private GitHub API...');
      
      const response = await fetch(githubApiUrl, {
        headers: {
          'Authorization': `Bearer ${ghToken}`, // Send the token in the Authorization header
          'Accept': 'application/vnd.github+json' // Request the standard GitHub API JSON response
        }
      });
      
      if (!response.ok) {
        let errorMessage = `GitHub API response was not ok: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      const base64Content = data.content;
      
      if (!base64Content) {
        throw new Error('File content (Base64) not found in GitHub API response.');
      }
      
      // Decode the Base64 content to get the raw YAML string
      const yamlText = atob(base64Content);
      
      // Use js-yaml to parse the text and store it globally
      const configResult = jsyaml.load(yamlText);
      console.log('Machine Config loaded from private GitHub YAML:', configResult);
      
    } catch (error) {
      console.error('Failed to load machine configuration from private GitHub:', error);
      alert('Could not load the machine configuration file from private GitHub. Some features may not work. Error: ' + error.message);
    }
  }
  // --- END: New code ---
  
  // The rest of your existing script follows...
  const llmSettings = {};
  const queryParams = new URLSearchParams(window.location.search);
  
  // ... (rest of your existing action.js code)
});