import * as vscode from 'vscode';
import * as path from 'path';

export class FileExplorerProvider implements vscode.TreeDataProvider<FileItem> {

    constructor(private files: string[]) {}

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        if (!element) {
            return Promise.resolve(this.files.map(file => new FileItem(file)));
        }
        return Promise.resolve([]);
    }
}

export class FileItem extends vscode.TreeItem {
    constructor(public readonly filePath: string) {
        super(vscode.Uri.file(filePath), vscode.TreeItemCollapsibleState.None);

        // Safely check if resourceUri is defined
        if (this.resourceUri) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(this.resourceUri);
            const relativePath = workspaceFolder
                ? path.relative(workspaceFolder.uri.fsPath, this.resourceUri.fsPath)
                : this.resourceUri.fsPath;

            this.label = relativePath;
            this.tooltip = `${relativePath} - Additional info here`;
        } else {
            this.label = "Undefined Path";
            this.tooltip = "The file path is not defined";
        }
        
        this.command = {
            title: "Open File",
            command: "fileExplorer.openFile",
            arguments: [this.filePath]
        };
    }
}
