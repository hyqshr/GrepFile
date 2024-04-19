import * as vscode from 'vscode';
import axios from 'axios';

export default async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");

        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return;
        }
        
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            vscode.window.showErrorMessage("Git extension is not available.");
            return;
        }

        const api = gitExtension.exports.getAPI(1);
        const repo = api.repositories[0];  // Assuming the first repository

        // Parse repository information
        const remote = await repo.getConfig('remote.origin.url');
        if (!remote) {
            vscode.window.showErrorMessage("No remote origin found.");
            return;
        }

        // Parse the user and repository from the GitHub URL
        const regex = /github\.com[\/:](.+?)\/(.+?)\.git$/;
        const match = remote.match(regex);
        if (!match) {
            vscode.window.showErrorMessage("Failed to parse repository URL.");
            return;
        }

        const userRepo = `${match[1]}/${match[2]}`;  // Concatenate to get "user_id/repo_name"

        // Send data to API
        const response = await axios.post('https://api.greptile.com/v2/repositories', {
            remote: "github",
            repository: userRepo
        }, {
            headers: {
                'Authorization': `Bearer ${greptileToken}`,
                'X-Github-Token': githubToken,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
        vscode.window.showInformationMessage(response.data.response);
    } catch (error) {
        console.error("Failed to send repository data:", error);
        vscode.window.showErrorMessage("Failed to send repository data.");
    }
}
