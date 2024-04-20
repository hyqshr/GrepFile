import * as vscode from 'vscode';
import path from 'path';

/**
 * Open the file in the editor.
 */
export async function openFile(fileUri: vscode.Uri) {
    try {
        await vscode.commands.executeCommand('vscode.open', fileUri);
    } catch (error) {
        console.error('Failed to open file:', error);
        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
}

/**
 * Filter the provided sources to only include valid files. API response could contain directories.
 */
export async function filterFiles(sources: string[]) {
    const fileSources = [];

    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        console.error("No workspace folders are open.");
        return [];
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath; // Typically use the first workspace

    for (const source of sources) {
        try {
            // Make sure the path does not start with a slash for proper resolution
            const normalizedSource = source.startsWith('/') ? source.slice(1) : source;
            const fullSourcePath = path.join(workspaceRoot, normalizedSource);
            const uri = vscode.Uri.file(fullSourcePath);
            const stat = await vscode.workspace.fs.stat(uri);

            if (stat.type === vscode.FileType.File) {
                console.log("File exists:", uri.fsPath);
                fileSources.push(uri.fsPath); // Push the absolute path for clarity
            }
        } catch (error) {
            console.error(`Error accessing ${source}: ${error}`);
        }
    }
    console.log("Valid file sources:", fileSources);
    return fileSources;
}