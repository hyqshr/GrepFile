import * as vscode from 'vscode';
import axios from 'axios';

export async function getRepoInfo() {

    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
        vscode.window.showErrorMessage("Git extension is not available.");
        return;
    }
    const api = gitExtension.exports.getAPI(1);
    const repo = api.repositories[0];  // Assuming the first repository

    // Parse repository information
    const remote = await repo.getConfig('remote.origin.url');
    if (!remote) {
        vscode.window.showErrorMessage("No remote origin found.");
        return;
    }

    // Parse the user and repository from the GitHub URL
    const regex = /github\.com[\/:](.+?)\/(.+?)\.git$/;
    const match = remote.match(regex);
    if (!match) {
        vscode.window.showErrorMessage("Failed to parse repository URL.");
        return;
    }

    const userRepo = `${match[1]}/${match[2]}`;  // Concatenate to get "user_id/repo_name"
    console.log("User and repository:", userRepo);
    return userRepo;
}

export async function filterFiles(sources: string[]) {
    const fileSources = [];

    // Assuming there's at least one workspace folder open
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        console.error("No workspace folders are open.");
        return [];
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath; // Typically use the first workspace

    for (const source of sources) {
        try {
            // Resolve relative paths against the workspace root
            const fullSourcePath = path.resolve(workspaceRoot, source);
            const uri = vscode.Uri.file(fullSourcePath);
            const stat = await vscode.workspace.fs.stat(uri);

            if (stat.type === vscode.FileType.File) {
                console.log("uri!!!", source);
                fileSources.push(source);
            }
        } catch (error) {
            console.error(`Error accessing ${source}: ${error}`);
        }
    }
    console.log("fileSources@@@", fileSources);
    return fileSources;
}

export async function sendRepositoryData(context: vscode.ExtensionContext) {
    try {
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");

        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return;
        }

        const userRepo = await getRepoInfo()
        const response = await axios.post('https://api.greptile.com/v2/repositories', {
            remote: "github",
            repository: userRepo
        }, {
            headers: {
                'Authorization': `Bearer ${greptileToken}`,
                'X-Github-Token': githubToken,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
        vscode.window.showInformationMessage(response.data.response);
    } catch (error) {
        console.error("Failed to send repository data:", error);
        vscode.window.showErrorMessage("Failed to send repository data.");
    }
}

export async function sendQuery(context: vscode.ExtensionContext, messageContent: string) {
    try {
        const greptileToken = await context.secrets.get("greptile_api_key");
        const githubToken = await context.secrets.get("github_token");
        const userRepo = await getRepoInfo(); // Ensure getRepoInfo is implemented correctly to fetch the repo info

        if (!greptileToken || !githubToken) {
            vscode.window.showErrorMessage("API tokens are missing.");
            return;
        }

        const payload = {
            messages: [
                {
                    id: "some-id-1",
                    content: "List all files that is about " + messageContent,
                    role: "user"
                }
            ],
            repositories: [
                {
                    repository: userRepo,
                    branch: "main"
                }
            ],
            sessionId: "test-session-id"
        };

        // Display a loading message while sending the data
        const result = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Greptile: Sending query...",
            cancellable: false
        }, async (progress, token) => {
            // Make the HTTP request
            const response = await axios.post('https://api.greptile.com/v2/query', payload, {
                headers: {
                    'Authorization': `Bearer ${greptileToken}`,
                    'X-Github-Token': githubToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                vscode.window.showInformationMessage(response.data.message);
                const paths = response.data.sources.map(source => source.filepath)
                return paths;
            } else {
                throw new Error(response.statusText);  // Handle non-200 responses
            }
        });

        // Optionally process the result here if needed
        return result;
    } catch (error) {
        console.error("Failed to send query:", error);
        vscode.window.showErrorMessage("Failed to send query.");
    }
}