import * as vscode from 'vscode';

/**
 * Retrieve the Greptile and GitHub tokens from the user's secrets.
 */
export async function getTokens(context: vscode.ExtensionContext) {
    const greptileToken = await context.secrets.get("greptile_api_key");
    const githubToken = await context.secrets.get("github_token");
    if (!greptileToken || !githubToken) {
        vscode.window.showErrorMessage("API tokens are missing.");
        return null;
    }
    return { greptileToken, githubToken };
}

/**
 * Prompt vscode input box for user to input tokens.
 */
async function promptInputToken(secrets: vscode.SecretStorage, secretId: string, promptText: string) {
    let token = await secrets.get(secretId);

    token = await vscode.window.showInputBox({
        placeHolder: `Enter your ${promptText} token`,
        password: true,
        prompt: `Please enter your ${promptText} token to continue`,
        ignoreFocusOut: true
    });

    if (token) {
        await secrets.store(secretId, token);
        vscode.window.showInformationMessage(`${promptText} token stored successfully!`);
    } else {
        vscode.window.showInformationMessage(`${promptText} token is required!`);
        return null;
    }

    return token;
}

/**
 * Handle the command to prompt the user to input both their Greptile and GitHub tokens.
 */
export async function handleTokenCommands(context: vscode.ExtensionContext) {
    const { secrets } = context;
    const greptileToken = await promptInputToken(secrets, 'greptile_api_key', 'Greptile API');
    const githubToken = await promptInputToken(secrets, 'github_token', 'GitHub');

    if (greptileToken && githubToken) {
        console.log('Tokens retrieved successfully.');
    } else {
        console.log('Failed to retrieve all necessary tokens.');
    }
}
