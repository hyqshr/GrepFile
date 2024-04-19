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
    public readonly uri: vscode.Uri;

    constructor(public readonly filePath: string) {
        super(filePath, vscode.TreeItemCollapsibleState.None);

        // Determine if filePath is absolute. If not, concatenate it with the root path.
        const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '';
        const isAbsolutePath = path.isAbsolute(filePath);
        const fullFilePath = isAbsolutePath ? filePath : path.join(rootPath, filePath);
        
        this.uri = vscode.Uri.file(fullFilePath);

        this.resourceUri = this.uri;
        this.label = path.basename(filePath); // Shows only the file name
        this.tooltip = `${this.uri.fsPath} - Click to open the file`;

        this.command = {
            title: "Open File",
            command: "GrepFile.openFile",
            arguments: [this.uri]
        };
    }
}