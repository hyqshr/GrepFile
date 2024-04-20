import * as vscode from 'vscode';

async function openFile(fileUri: vscode.Uri) {
    /**
     * Open the file in the editor.
     */
    try {
        await vscode.commands.executeCommand('vscode.open', fileUri);
    } catch (error) {
        console.error('Failed to open file:', error);
        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
}

export { openFile };