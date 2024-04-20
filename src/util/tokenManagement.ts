import * as vscode from 'vscode';

async function ensureTokenStored(secrets: vscode.SecretStorage, secretId: string, promptText: string) {
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

export async function handleTokenCommands(context: vscode.ExtensionContext) {
    const { secrets } = context;
    const greptileToken = await ensureTokenStored(secrets, 'greptile_api_key', 'Greptile API');
    const githubToken = await ensureTokenStored(secrets, 'github_token', 'GitHub');

    if (greptileToken && githubToken) {
        console.log('Tokens retrieved successfully.');
    } else {
        console.log('Failed to retrieve all necessary tokens.');
    }
}
