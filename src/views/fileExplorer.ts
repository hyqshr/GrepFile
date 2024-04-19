import * as vscode from 'vscode';
import * as path from 'path';

export class FileExplorerProvider implements vscode.TreeDataProvider<FileItem> {

    constructor(private files: string[]) {}

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FileItem): Promise<FileItem[]> {
        if (element) {
            // If the element is a folder, read its contents
            if (element.isFolder) {
                console.log(element, "isFolder")

                const children = await vscode.workspace.fs.readDirectory(element.resourceUri || vscode.Uri.file(''));
                return children.map(([name, type]) => new FileItem(path.join(element.filePath, name), type === vscode.FileType.Directory));
            } else {
                return [];
            }
        } else {
            console.log(element, "else")
            return this.files.map(file => new FileItem(file, false)); // Assume root items are folders for initialization
        }
    }
}

export class FileItem extends vscode.TreeItem {
    constructor(public readonly filePath: string, public readonly isFolder: boolean) {
        super(filePath, isFolder ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);

        const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        const fullFilePath = rootPath ? path.join(rootPath, filePath) : filePath;

        this.resourceUri = vscode.Uri.file(fullFilePath);
        this.label = path.basename(filePath);
        this.tooltip = `${this.resourceUri.fsPath}`;

        if (!isFolder) {
            this.command = {
                title: "Open File",
                command: "fileExplorer.openFile",
                arguments: [this.resourceUri]
            };
        }
    }
}
