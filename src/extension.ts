// extension.ts
import * as vscode from 'vscode';
import { sendRepositoryData } from './util/httpClient';
import { handleTokenCommands } from './util/tokenManagement';
import { Commands } from './commands';
import { initSearch } from './util/searchUtil';
import { openFile } from './util/fileOperations';

export function activate(context: vscode.ExtensionContext) {
    let AskTokenCommand = vscode.commands.registerCommand(
        Commands.AskToken, () => handleTokenCommands(context)
    );
	
    let SearchCommand = vscode.commands.registerCommand(
        Commands.InitSearch, () => initSearch(context)
    );

    let openFileCommand = vscode.commands.registerCommand(
        Commands.OpenFile, (fileUri: vscode.Uri) => openFile(fileUri)
    );
    
    let sendRepoDataCommand =vscode.commands.registerCommand(
        Commands.SendRepoData, () => sendRepositoryData(context)
    );

    context.subscriptions.push(
        AskTokenCommand, 
        openFileCommand, 
        SearchCommand, 
        sendRepoDataCommand
    );
}

