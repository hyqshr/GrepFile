import * as vscode from 'vscode';
import axios from 'axios';
import { Readable } from 'stream';
import { Source, StreamResponse } from '../types';
import { getTokens } from './tokenManagement';


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
    if (!userRepo) {
        vscode.window.showErrorMessage('GrepFile: No repository information found.');
        return;
    }
    return userRepo;
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

            return processStream(response.data, token);
        });
    } catch (error) {
        console.error("Failed to send query:", error);
        vscode.window.showErrorMessage("Failed to send query.");
        return [];
    }
}

/**
 * Checks if a repository is indexed by the server.
 * @param context The extension context.
 */
export async function checkIfRepoIndexed(context: vscode.ExtensionContext) {
    const repoInfo = await getRepoInfo();
    const tokens = await getTokens(context);
    const apiUrl = buildRepositoryApiUrl(repoInfo);

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
        handleIndexingResponse(response);
    } catch (error) {
        vscode.window.showErrorMessage('Failed to check repository indexing: ' + error);
    }
}

function processStream(stream: Readable, cancellationToken: vscode.CancellationToken): Promise<string[]> {
    let buffer = '';

    return new Promise<string[]>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            processBuffer(buffer, resolve);
            buffer = buffer.substring(buffer.lastIndexOf('\n') + 1);
        });

        stream.on('end', () => {
            console.log("Streaming ended without finding sources.");
            resolve([]);  // No sources found
        });

        stream.on('error', (error: Error) => {
            console.error('Stream error:', error);
            reject([]);
        });

        cancellationToken.onCancellationRequested(() => {
            stream.destroy();
            console.log("Streaming cancelled by the user.");
            reject([]);
        });
    });
}

// Function to process buffer and resolve based on message type
function processBuffer(buffer: string, resolve: (filePaths: string[]) => void): void {
    const parts = buffer.split('\n').filter(part => part.trim());

    parts.forEach(part => {
        try {
            const json: StreamResponse = JSON.parse(part);
            if (json.type === 'sources') {
                const filepaths = (json.message as Source[]).map(source => source.filepath);
                resolve(filepaths);  // Resolve promise with file paths
            } else {
                console.log("Streamed message:", json.message);
            }
        } catch (error) {
            console.error('Failed to parse part of the stream:', part);
        }
    });
}

/**
 * Builds the URL for the repository API endpoint.
 * @param repositoryInfo Information about the repository.
 * @returns Formatted URL string.
 */
function buildRepositoryApiUrl(repositoryInfo: any): string {
    return `https://api.greptile.com/v2/repositories/${encodeURIComponent(`github:main:${repositoryInfo}`)}`;
}

/**
 * Handles the server response for repository indexing.
 * @param response Axios response from the server.
 */
function handleIndexingResponse(response: any) {
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
}