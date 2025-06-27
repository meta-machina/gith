export async function downloadLocalFile(fileName) {
  try { // --- Fetch the text file ---
    console.log(`Downloader: Fetching the ${fileName} from https://localhost/`);
    const fileResponse = await fetch('https://localhost/' + fileName);
    if (!fileResponse.ok) {
      throw new Error(`HTTP error fetching file! status: ${fileResponse.status}`);
    }
    const text = (await fileResponse.text()).trim();
    console.log(`Downloader: ${fileName} downloaded successfully.`);
    return text
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

// Function to download GitHub yaml file
export async function downloadYamlFromGitHub(owner, repo, file, branch, token) {
  try {
    const owner = owner || '{{ site.github_settings.owner }}'; // Your GitHub username or organization
    const repo = repo || '{{ site.github_settings.repo }}'; // The name of your private repository
    const file = file || '{{ site.github_settings.config_path }}'; // The path to the YAML file within the repo
    const branch = 'main'; // The branch where the file is located (e.g., 'main', 'master', 'dev')

    // Construct the GitHub API URL for repository contents
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file}?ref=${branch}`;
    
    console.log('Attempting to fetch machine configuration from private GitHub API...');
    const response = await fetch(githubApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`, // Send the token in the Authorization header
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
