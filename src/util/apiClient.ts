import * as vscode from 'vscode';
import axios from 'axios';

import { getTokens } from './tokenManagement';
import { getRepoInfo } from './gitUtil';
import { processQueryStream } from './response/queryStreamHandler';
import { handleIndexingResponse } from './response/indexResponse';

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

            return processQueryStream(response.data, token);
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

/**
 * Builds the URL for the repository API endpoint.
 * @param repositoryInfo Information about the repository.
 * @returns Formatted URL string.
 */
function buildRepositoryApiUrl(repositoryInfo: any): string {
    return `https://api.greptile.com/v2/repositories/${encodeURIComponent(`github:main:${repositoryInfo}`)}`;
}
