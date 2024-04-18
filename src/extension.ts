import * as vscode from 'vscode';
import * as https from 'https';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.exampleCommand', async () => {
        await getUserInput(); 
    });

    context.subscriptions.push(disposable);
}


async function getUserInput() {
    const result = await vscode.window.showInputBox({
        placeHolder: 'Provide some information about the file you are looking for.',
        prompt: 'Enter here',
        validateInput: text => {
            return text.trim().length === 0 ? 'Please provide your input.' : null;
        }
    });

    if (result !== undefined) {
        const files = await searchFilesByName(result);
        if (files.length > 0) {
            showFilePicker(files);
        } else {
            vscode.window.showInformationMessage('No files found with that name.');
        }
    } else {
        vscode.window.showInformationMessage('No input received.');
    }
}

async function searchFilesByName(fileName: string): Promise<string[]> {
    // Simulating file search, replace this with actual search logic
    return vscode.workspace.findFiles(`**/*${fileName}*`, '**/node_modules/**', 10)
        .then(files => files.map(file => file.fsPath));
}

async function showFilePicker(files: string[]): Promise<void> {
    const picked = await vscode.window.showQuickPick(files, {
        placeHolder: 'Select a file to open'
    });
    if (picked) {
        openFile(picked);
    }
}

function openFile(path: string): void {
    const uri = vscode.Uri.file(path);
    vscode.window.showTextDocument(uri);
}