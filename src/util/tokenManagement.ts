import * as vscode from 'vscode';
import { CONSTANTS } from '../constants';

/**
 * Retrieve the Greptile and GitHub tokens from the user's secrets.
 */
export async function getTokens(context: vscode.ExtensionContext) {
    const greptileToken = await context.secrets.get(CONSTANTS.GREPTILE_KEY);
    const githubToken = await context.secrets.get(CONSTANTS.GITHUB_KEY);
    if (!greptileToken || !githubToken) {
        vscode.window.showErrorMessage(CONSTANTS.MISSING_TOKENS_MESSAGE);
        return null;
    }
    return { greptileToken, githubToken };
}

/**
 * Prompt vscode input box for user to input tokens.
 */
async function promptInputToken(secrets: vscode.SecretStorage, secretId: string) {
    let token = await secrets.get(secretId);

    token = await vscode.window.showInputBox({
        placeHolder: `Enter your ${secretId}`,
        password: true,
        prompt: `Please enter your ${secretId} to continue`,
        ignoreFocusOut: true
    });

    if (token) {
        await secrets.store(secretId, token);
        vscode.window.showInformationMessage(`GrepFile: ${secretId} stored successfully!`);
    } else {
        vscode.window.showInformationMessage(`GrepFile: ${secretId} is required!`);
        return null;
    }

    return token;
}

/**
 * Command to prompt the user to input both their Greptile and GitHub tokens.
 */
export async function handleTokenCommands(context: vscode.ExtensionContext) {
    const { secrets } = context;
    const greptileToken = await promptInputToken(secrets, CONSTANTS.GREPTILE_KEY);
    const githubToken = await promptInputToken(secrets, CONSTANTS.GITHUB_KEY);

    if (greptileToken && githubToken) {
        console.log('Tokens retrieved successfully.');
    } else {
        console.log('Failed to retrieve all necessary tokens.');
    }
}
