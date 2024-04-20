import * as vscode from 'vscode';

/**
 * Handles the server response for checkIfRepoIndexed command.
 * @param response Axios response from the server.
 */
export function handleIndexingResponse(response: any) {
    console.log('Repository indexing status:', response.data);
    if (response.status === 200) {
        vscode.window.showInformationMessage('GrepFile: This repository is indexed.');
    } else {
        vscode.window.showInformationMessage('GrepFile: This repository is not indexed.', 'Index Now')
            .then(selection => {
                if (selection === 'Index Now') {
                    vscode.commands.executeCommand('GrepFile.sendRepoData');
                }
            });
    }
}