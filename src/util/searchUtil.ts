// src/searchUtils.ts
import * as vscode from 'vscode';
import { filterFiles, sendQuery } from './httpClient';
import { FileExplorerProvider } from '../views/fileExplorer';

/**
 * Prompts the user to provide input for the search.
 * @returns A string input from the user or undefined if no input was provided.
 */
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

/**
 * Initializes a search based on the user's input and displays the results in a tree view.
 * @param context The extension context provided by VSCode.
 */
async function initSearch(context: vscode.ExtensionContext) {
    const userInput = await getUserInput();
    if (userInput) {
        const sources = await sendQuery(context, userInput);
        const filepaths = await filterFiles(sources);
        if (filepaths && filepaths.length > 0) {
            const fileExplorerProvider = new FileExplorerProvider(filepaths);
            vscode.window.registerTreeDataProvider('fileList', fileExplorerProvider);
            vscode.commands.executeCommand('workbench.view.extension.fileExplorer');
        } else {
            vscode.window.showInformationMessage('No relevant files found based on your query.');
        }
    }
}

export { initSearch };
