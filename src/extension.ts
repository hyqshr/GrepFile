// extension.ts
import * as vscode from 'vscode';
import { FileExplorerProvider, FileItem } from './views/fileExplorer';
import sendRepositoryData from './util/client';

export function activate(context: vscode.ExtensionContext) {
    const secrets: vscode.SecretStorage = context.secrets;
    let disposable = vscode.commands.registerCommand('fileExplorer.askToken', async () => {
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
            console.log("$$$ Greptile API token stored");
        } else {
            console.log("No Greptile API token entered");
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
            console.log("$$$ GitHub token stored");
        } else {
            console.log("No GitHub token entered");
            vscode.window.showInformationMessage('GitHub token is required!');
        }

        console.log("Greptile API token: ", greptileToken);
        console.log("GitHub token: ", githubToken);
    });
	
    // Register command to start search and show results in tree view
    let initSearchCommand = vscode.commands.registerCommand('fileExplorer.initSearch', async () => {
        const userInput = await getUserInput();
        if (userInput) {
            const files = await searchFilesByName(userInput);
            console.log(files);
            if (files.length > 0) {
                const fileExplorerProvider = new FileExplorerProvider(files);
                vscode.window.registerTreeDataProvider('fileList', fileExplorerProvider);
                // Focus the tree view
                vscode.commands.executeCommand('workbench.view.extension.fileExplorer');
            } else {
                vscode.window.showInformationMessage('No files found with that name.');
            }
        }
    });

	let openFileCommand = vscode.commands.registerCommand('fileExplorer.openFile', (filePath: string) => {
        const uri = vscode.Uri.file(filePath);
        vscode.window.showTextDocument(uri);
    });
    
    context.subscriptions.push(vscode.commands.registerCommand('fileExplorer.sendRepoData', () => {
        sendRepositoryData(context);
    }));

    context.subscriptions.push(initSearchCommand, openFileCommand, disposable);
}


async function getUserInput(): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        placeHolder: 'Provide some information about the file you are looking for.',
        prompt: 'Enter here',
        validateInput: text => {
            return text.trim().length === 0 ? 'Please provide your input.' : null;
        }
    });
    return result;
}

async function searchFilesByName(fileName: string): Promise<string[]> {
    return vscode.workspace.findFiles(`**/*${fileName}*`, '**/node_modules/**', 10)
        .then(files => files.map(file => file.fsPath));
}
