// extension.ts
import * as vscode from 'vscode';
import { checkIfRepoIndexed, sendRepositoryData } from './util/httpClient';
import { handleTokenCommands } from './util/tokenManagement';
import { Commands } from './commands';
import { initSearch } from './util/searchUtil';
import { openFile } from './util/fileOperations';

export function activate(context: vscode.ExtensionContext) {
    // Command for user to input their greptile key and github token.
    let AskTokenCommand = vscode.commands.registerCommand(
        Commands.AskToken, () => handleTokenCommands(context)
    );
	
    // Command to initiate the query process with input box.
    let SearchCommand = vscode.commands.registerCommand(
        Commands.InitSearch, () => initSearch(context)
    );

    // Command to open the selected file.
    let openFileCommand = vscode.commands.registerCommand(
        Commands.OpenFile, (fileUri: vscode.Uri) => openFile(fileUri)
    );
    
    // Command to send repository data to the Greptile API.
    let sendRepoDataCommand =vscode.commands.registerCommand(
        Commands.SendRepoData, () => sendRepositoryData(context)
    );

    // Command to check if the repository is indexed.
    let checkRepoIndexedCommand = vscode.commands.registerCommand(
        Commands.CheckRepoIndex, () => checkIfRepoIndexed(context)
    );

    context.subscriptions.push(
        AskTokenCommand, 
        openFileCommand, 
        SearchCommand, 
        sendRepoDataCommand,
        checkRepoIndexedCommand
    );
}
