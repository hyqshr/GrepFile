import * as vscode from 'vscode';
import axios from 'axios';

import { getTokens } from './tokenManagement';
import { getRepoInfo } from './gitUtil';
import { processQueryStream } from './response/queryStreamHandler';
import { handleIndexingResponse } from './response/indexResponse';

async function getHeaders(context: vscode.ExtensionContext) {
    const tokens = await getTokens(context);
    if (!tokens) {
        throw new Error('Authentication tokens are missing.');
    }
    return {
        'Authorization': `Bearer ${tokens.greptileToken}`,
        'X-Github-Token': tokens.githubToken,
        'Content-Type': 'application/json'
    };
}

export async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const headers = await getHeaders(context);
        const userRepo = await getRepoInfo();

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "GrepFile: Sending repository data...",
        }, async () => {
            return axios.post('https://api.greptile.com/v2/repositories', {
                remote: "github",
                repository: userRepo
            }, { headers });
        });

        vscode.window.showInformationMessage(response.data.response);
    } catch (error) {
        console.error("Failed to send repository data:", error);
        vscode.window.showErrorMessage("Failed to send repository data.");
    }
}

export async function sendQuery(context: vscode.ExtensionContext, messageContent: string): Promise<string[]> {
    try {
        const headers = await getHeaders(context);
        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Sending query...",
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User canceled the long running operation");
            });

            const payload = {
                messages: [{ id: "some-id-1", content: "List all files that are about " + messageContent, role: "user" }],
                repositories: [{ repository: await getRepoInfo(), branch: "main" }],
                sessionId: "test-session-id",
                stream: true
            };

            const response = await axios.post('https://api.greptile.com/v2/query', payload, {
                headers,
                responseType: 'stream'
            });

            return processQueryStream(response.data, token);
        });
    } catch (error) {
        console.error("Failed to send query:", error);
        vscode.window.showErrorMessage("GrepFile: Failed to send query.");
        return [];
    }
}

export async function checkIfRepoIndexed(context: vscode.ExtensionContext) {
    try {
        const headers = await getHeaders(context);
        const repoInfo = await getRepoInfo();
        const apiUrl = buildRepositoryApiUrl(repoInfo);

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "GrepFile: Checking if repository is indexed...",
        }, async () => {
            return axios.get(apiUrl, { headers });
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
