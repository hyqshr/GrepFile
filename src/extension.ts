// extension.ts
import * as vscode from 'vscode';
import { FileExplorerProvider, FileItem } from './views/fileExplorer';

export function activate(context: vscode.ExtensionContext) {
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

    context.subscriptions.push(initSearchCommand, openFileCommand);
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
