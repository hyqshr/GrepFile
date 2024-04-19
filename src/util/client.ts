import * as vscode from 'vscode';
import axios from 'axios';
import path from 'path';
import { ApiResponse } from './types';

export async function getRepoInfo() {

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
    console.log("User and repository:", userRepo);
    return userRepo;
}

export async function filterFiles(sources: string[]) {
    const fileSources = [];

    // Assuming there's at least one workspace folder open
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        console.error("No workspace folders are open.");
        return [];
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath; // Typically use the first workspace

    for (const source of sources) {
        try {
            // Resolve relative paths against the workspace root
            const fullSourcePath = path.resolve(workspaceRoot, source);
            const uri = vscode.Uri.file(fullSourcePath);
            const stat = await vscode.workspace.fs.stat(uri);

            if (stat.type === vscode.FileType.File) {
                console.log("uri!!!", source);
                fileSources.push(source);
            }
        } catch (error) {
            console.error(`Error accessing ${source}: ${error}`);
        }
    }
    console.log("fileSources@@@", fileSources);
    return fileSources;
}

export async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");

        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return;
        }

        const userRepo = await getRepoInfo()
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

export async function sendQuery(context: vscode.ExtensionContext, messageContent: string): Promise<string[]> {
    try {
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");

        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return [];
        }

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "GrepFile: Sending query...",
            cancellable: true  // Optionally make this operation cancellable
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User canceled the long running operation");
            });

            const payload = {
                messages: [
                    {
                        id: "some-id-1",
                        content: messageContent,
                        role: "user"
                    }
                ],
                repositories: [
                    {
                        repository: await getRepoInfo(),  // Ensure this function is non-blocking and efficient
                        branch: "main"
                    }
                ],
                sessionId: "test-session-id"
            };

            const response = await axios.post<ApiResponse>('https://api.greptile.com/v2/query', payload, {
                headers: {
                    'Authorization': `Bearer ${greptileToken}`,
                    'X-Github-Token': githubToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                vscode.window.showInformationMessage(response.data.message);
                return response.data.sources.map(source => source.filepath);
            } else {
                vscode.window.showErrorMessage('Failed to get a successful response from the server');
                return [];
            }
        });
    } catch (error) {
        console.error("Failed to send query:", error);
        vscode.window.showErrorMessage("Failed to send query.");
        return [];
    }
}