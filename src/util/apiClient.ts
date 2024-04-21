import * as vscode from 'vscode';
import axios from 'axios';

import { getTokens } from './tokenManagement';
import { getRepoInfo } from './gitUtil';
import { processQueryStream } from './response/queryStreamHandler';
import { handleIndexingResponse } from './response/indexResponse';
import { CONSTANTS } from '../constants';

/**
 * Retrieves the necessary HTTP headers for making authenticated requests.
 * It requires the context to access the extension's secret storage.
 * 
 * @param {vscode.ExtensionContext} context - The extension context used for accessing the secret storage.
 * @returns {Promise<Object>} A promise that resolves to an object containing HTTP headers.
 * @throws {Error} Throws an error if authentication tokens are missing.
 */
async function getHeaders(context: vscode.ExtensionContext) {
    const tokens = await getTokens(context);
    if (!tokens) {
        throw new Error(CONSTANTS.ERRORS.TOKENS_MISSING);
    }
    return {
        'Authorization': `Bearer ${tokens.greptileToken}`,
        'X-Github-Token': tokens.githubToken,
        'Content-Type': CONSTANTS.HEADERS.CONTENT_TYPE_JSON
    };
}

/**
 * Sends repository data to a remote server. This function handles the communication
 * including preparing headers and sending the actual request.
 * 
 * @param {vscode.ExtensionContext} context - The extension context.
 * @returns {Promise<void>} A promise that resolves when the data is sent, or an error is shown.
 */
export async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const headers = await getHeaders(context);
        const userRepo = await getRepoInfo();

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: CONSTANTS.TITLES.SENDING_REPO_DATA,
        }, async () => {
            return axios.post(CONSTANTS.API_URLS.REPOSITORIES, {
                remote: "github",
                repository: userRepo
            }, { headers });
        });

        vscode.window.showInformationMessage(response.data.response);
    } catch (error) {
        console.error(CONSTANTS.ERRORS.SEND_REPO_DATA_FAILED, error);
        vscode.window.showErrorMessage(CONSTANTS.ERRORS.SEND_REPO_DATA_FAILED);
    }
}

/**
 * Sends a user-generated query to the remote API and processes the streaming response.
 * It shows progress and handles user cancellation.
 * 
 * @param {vscode.ExtensionContext} context - The extension context.
 * @param {string} messageContent - The query content to be sent.
 * @returns {Promise<string[]>} A promise that resolves to an array of query results.
 */
export async function sendQuery(context: vscode.ExtensionContext, messageContent: string): Promise<string[]> {
    try {
        const headers = await getHeaders(context);
        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: CONSTANTS.TITLES.SENDING_QUERY,
            cancellable: true
        }, async (progress, token) => {
            const payload = {
                messages: [{ id: "some-id-1", content: "List all files that are about " + messageContent, role: "user" }],
                repositories: [{ repository: await getRepoInfo(), branch: "main" }],
                sessionId: "test-session-id",
                stream: true
            };

            const response = await axios.post(CONSTANTS.API_URLS.QUERY, payload, {
                headers,
                responseType: 'stream'
            });

            return processQueryStream(response.data, token);
        });
    } catch (error) {
        console.error(CONSTANTS.ERRORS.SEND_QUERY_FAILED, error);
        vscode.window.showErrorMessage(CONSTANTS.ERRORS.SEND_QUERY_FAILED);
        return [];
    }
}

/**
 * Checks if the given repository is indexed by making an API call.
 * It displays a progress notification during the operation.
 * 
 * @param {vscode.ExtensionContext} context - The extension context.
 * @returns {Promise<void>} A promise that resolves when the check is complete or an error occurs.
 */
export async function checkIfRepoIndexed(context: vscode.ExtensionContext) {
    try {
        const headers = await getHeaders(context);
        const repoInfo = await getRepoInfo();
        const apiUrl = buildRepositoryApiUrl(repoInfo);

        const response = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: CONSTANTS.TITLES.CHECKING_REPO_INDEX,
        }, async () => {
            return axios.get(apiUrl, { headers });
        });

        handleIndexingResponse(response);
    } catch (error) {
        vscode.window.showErrorMessage(CONSTANTS.ERRORS.CHECK_INDEX_FAILED + error);
    }
}

/**
 * Builds the URL for the repository API endpoint.
 * @param repositoryInfo Information about the repository.
 * @returns Formatted URL string.
 */
function buildRepositoryApiUrl(repositoryInfo: any): string {
    return `${CONSTANTS.API_URLS.REPOSITORIES}/${encodeURIComponent(`github:main:${repositoryInfo}`)}`;
}
