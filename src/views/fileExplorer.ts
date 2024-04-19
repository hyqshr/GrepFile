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
        super(filePath, vscode.TreeItemCollapsibleState.None);

        const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullFilePath = rootPath ? path.join(rootPath, filePath) : filePath;

        this.resourceUri = vscode.Uri.file(fullFilePath);
        this.label = path.basename(filePath); // Shows only the file name
        this.tooltip = `${this.resourceUri.fsPath} - Additional info here`;

        this.command = {
            title: "Open File",
            command: "fileExplorer.openFile",
            arguments: [this.resourceUri]
        };
    }
}