import * as vscode from 'vscode';
import axios from 'axios';

export default async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        // Retrieve stored tokens
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");

        // Check if tokens are available
        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return;
        }

        // Assume the user's current workspace is a Git repository
        const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
        const api = gitExtension.getAPI(1);
        const repo = api.repositories[0];  // Using the first repository
        const repoName = repo.rootUri.path.split('/').pop();  // Extract the repo name from the path
        console.log("Repo name:", repoName);
        
        const response = await axios.post('https://api.greptile.com/v2/repositories', {
            remote: "github",
            repository: `${repoName}`
        }, {
            headers: {
                'Authorization': `Bearer ${greptileToken}`,
                'X-Github-Token': githubToken,
                'Content-Type': 'application/json'
            }
        });

        console.log("!!", response.data);
        vscode.window.showInformationMessage('Repository data sent successfully.');
    } catch (error) {
        console.error("Failed to send repository data:", error);
        vscode.window.showErrorMessage("Failed to send repository data.");
    }
}
