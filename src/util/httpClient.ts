import * as vscode from 'vscode';
import axios from 'axios';
import path from 'path';
import { Readable } from 'stream';

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

export async function getTokens(context: vscode.ExtensionContext) {
    const greptileToken = await context.secrets.get("greptile_api_key");
    const githubToken = await context.secrets.get("github_token");
    if (!greptileToken || !githubToken) {
        vscode.window.showErrorMessage("API tokens are missing.");
        return null;
    }
    return { greptileToken, githubToken };
}

export async function filterFiles(sources: string[]) {
    const fileSources = [];

    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        console.error("No workspace folders are open.");
        return [];
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath; // Typically use the first workspace

    for (const source of sources) {
        try {
            // Make sure the path does not start with a slash for proper resolution
            const normalizedSource = source.startsWith('/') ? source.slice(1) : source;
            const fullSourcePath = path.join(workspaceRoot, normalizedSource);
            const uri = vscode.Uri.file(fullSourcePath);
            const stat = await vscode.workspace.fs.stat(uri);

            if (stat.type === vscode.FileType.File) {
                console.log("File exists:", uri.fsPath);
                fileSources.push(uri.fsPath); // Push the absolute path for clarity
            }
        } catch (error) {
            console.error(`Error accessing ${source}: ${error}`);
        }
    }
    console.log("Valid file sources:", fileSources);
    return fileSources;
}

export async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const tokens = await getTokens(context);
        if (!tokens) return;

        const userRepo = await getRepoInfo()
        const response = await axios.post('https://api.greptile.com/v2/repositories', {
            remote: "github",
            repository: userRepo
        }, {
            headers: {
                'Authorization': `Bearer ${tokens.greptileToken}`,
                'X-Github-Token': tokens.githubToken,
                'Content-Type': 'application/json'
            }
        });

        vscode.window.showInformationMessage(response.data.response);
    } catch (error) {
        console.error("Failed to send repository data:", error);
        vscode.window.showErrorMessage("Failed to send repository data.");
    }
}
export async function sendQuery(context: vscode.ExtensionContext, messageContent: string): Promise<string[]> {
    try {
        const tokens = await getTokens(context);
        if (!tokens) return [];
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
                        content: "List all files that are about " + messageContent,
                        role: "user"
                    }
                ],
                repositories: [
                    {
                        repository: await getRepoInfo(),
                        branch: "main"
                    }
                ],
                sessionId: "test-session-id",
                stream: true
            };

            const response = await axios.post('https://api.greptile.com/v2/query', payload, {
                headers: {
                    'Authorization': `Bearer ${tokens.greptileToken}`,
                    'X-Github-Token': tokens.githubToken,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            return new Promise<string[]>((resolve, reject) => {
                const stream: Readable = response.data;
                let buffer = '';

                stream.on('data', (chunk: Buffer) => {
                    buffer += chunk.toString();
                    const parts = buffer.split('\n');
                    buffer = parts.pop() || '';

                    parts.forEach(part => {
                        if (part.trim()) {
                            try {
                                const json = JSON.parse(part);
                                //Todo: stream message to message box
                                if (json.type !== 'sources') {
                                    console.log("Streamed message:", json.message);
                                } else if (json.type === 'sources') {
                                    // Resolve the promise immediately when sources are received
                                    const filepaths = json.message.map((source: { filepath: any; }) => source.filepath);
                                    resolve(filepaths);
                                }
                            } catch (error) {
                                console.error('Failed to parse part of the stream:', part);
                            }
                        }
                    });
                });

                stream.on('end', () => {
                    console.log("Streaming ended without finding sources.");
                    resolve([]);  // Resolve with an empty array if no sources are found before the stream ends
                });

                stream.on('error', (error) => {
                    console.error('Stream error:', error);
                    reject([]);
                });

                token.onCancellationRequested(() => {
                    stream.destroy();
                    console.log("Streaming cancelled by the user.");
                    reject([]);
                });
            });
        });
    } catch (error) {
        console.error("Failed to send query:", error);
        vscode.window.showErrorMessage("Failed to send query.");
        return [];
    }
}

export async function checkIfRepoIndexed(context: vscode.ExtensionContext) {
    const repoInfo = await getRepoInfo();
    if (!repoInfo) {
        vscode.window.showErrorMessage('No repository information found.');
        return;
    }
    const suffix = encodeURIComponent(`github:main:${repoInfo}`)
    const apiUrl = `https://api.greptile.com/v2/repositories/${suffix}`;
    console.log(apiUrl, "Checking repository indexing...")
    const tokens = await getTokens(context); // Function to retrieve stored tokens

    if (!tokens || !tokens.greptileToken) {
        vscode.window.showErrorMessage('Authentication token is missing.');
        return;
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${tokens.greptileToken}`,
                'X-Github-Token': tokens.githubToken,
            }
        });
        console.log('Repository indexing status:', response.data);
        if (response.status === 200) {
            vscode.window.showInformationMessage('GrepFile: This repository is indexed.');
        } else {
            vscode.window.showInformationMessage('This repository is not indexed.', 'Index Now')
                .then(selection => {
                    if (selection === 'Index Now') {
                        vscode.commands.executeCommand('GrepFile.sendRepoData');
                    }
                });
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to check repository indexing: ' + error);
    }
}
