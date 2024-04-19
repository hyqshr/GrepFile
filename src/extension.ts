// extension.ts
import * as vscode from 'vscode';
import { FileExplorerProvider, FileItem } from './views/fileExplorer';
import { filterFiles, sendQuery, sendRepositoryData } from './util/client';

export function activate(context: vscode.ExtensionContext) {
    const secrets: vscode.SecretStorage = context.secrets;
    let disposable = vscode.commands.registerCommand('GrepFile.askToken', async () => {
    // Get or ask for Greptile API token
    let greptileToken = await secrets.get("greptile_api_key");
        greptileToken = await vscode.window.showInputBox({
            placeHolder: 'Enter your Greptile API token',
            password: true,
            prompt: 'Please enter your Greptile API token to continue',
            ignoreFocusOut: true
        });

        if (greptileToken) {
            await secrets.store('greptile_api_key', greptileToken);
            console.log("Greptile API token stored");
        } else {
            vscode.window.showInformationMessage('Greptile API token is required!');
            return;  // Exit if no token provided
        }

        // Get or ask for GitHub token
        let githubToken = await secrets.get("github_token");
        githubToken = await vscode.window.showInputBox({
            placeHolder: 'Enter your GitHub token',
            password: true,
            prompt: 'Please enter your GitHub token to continue',
            ignoreFocusOut: true
        });

        if (githubToken) {
            await secrets.store('github_token', githubToken);
            console.log("GitHub token stored");
        } else {
            vscode.window.showInformationMessage('GitHub token is required!');
        }

        console.log("Greptile API token: ", greptileToken);
        console.log("GitHub token: ", githubToken);
    });
	
    // Register command to start search and show results in tree view
    let initSearchCommand = vscode.commands.registerCommand('GrepFile.initSearch', async () => {
        const userInput = await getUserInput();
        if (userInput) {
            const sources = await sendQuery(context, userInput);
            const filepaths = await filterFiles(sources)
            console.log("filepaths: ", filepaths);

            if (filepaths && filepaths.length > 0) {
                console.log("filepaths: ", filepaths);

                const fileExplorerProvider = new FileExplorerProvider(filepaths);
                vscode.window.registerTreeDataProvider('fileList', fileExplorerProvider);
                // Focus the tree view
                vscode.commands.executeCommand('workbench.view.extension.fileExplorer');
            } else {
                vscode.window.showInformationMessage('No relevant files found based on your query.');
            }
        }
    });

    let openFileCommand = vscode.commands.registerCommand('GrepFile.openFile', async (fileUri: vscode.Uri) => {
        try {
            // Use the built-in command to open the file
            await vscode.commands.executeCommand('vscode.open', fileUri);
        } catch (error) {
            console.error('Failed to open file:', error);
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
    });
    
    context.subscriptions.push(vscode.commands.registerCommand('GrepFile.sendRepoData', () => {
        sendRepositoryData(context);
    }));

    context.subscriptions.push(initSearchCommand, openFileCommand, disposable);
}


async function getUserInput(): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        placeHolder: 'GrepFile: Provide some information about the file you are looking for.',
        prompt: 'Enter here',
        validateInput: text => {
            return text.trim().length === 0 ? 'Please provide your input.' : null;
        }
    });
    return result;
}

