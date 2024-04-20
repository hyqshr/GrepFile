import * as vscode from 'vscode';

/**
 * Retrieves the GitHub user and repository name for the first local repository.
 * Assumes that the remote origin is configured and extracts the 'user/repo' format.
 * 
 * Example:
 * If the remote URL is 'https://github.com/panda-devs/pandas.git',
 * this function will return 'panda-devs/pandas'.
 * 
 * @returns {Promise<string | undefined>} The 'user/repo' string if successful, or undefined if an error occurs.
 */
export async function getRepoInfo(): Promise<string | undefined> {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
        vscode.window.showErrorMessage("GrepFile: Git extension is not available.");
        return;
    }
    const api = gitExtension.exports.getAPI(1);
    const repo = api.repositories[0];  // Assuming the first repository

    // Parse repository information
    const remote = await repo.getConfig('remote.origin.url');
    if (!remote) {
        vscode.window.showErrorMessage("GrepFile: No remote origin found.");
        return;
    }

    // Parse the user and repository from the GitHub URL
    const regex = /github\.com[\/:](.+?)\/(.+?)\.git$/;
    const match = remote.match(regex);
    if (!match) {
        vscode.window.showErrorMessage("GrepFile: Failed to parse repository URL.");
        return;
    }

    const userRepo = `${match[1]}/${match[2]}`;  // Concatenate to get "user_id/repo_name"
    console.log("User and repository:", userRepo);
    if (!userRepo) {
        vscode.window.showErrorMessage('GrepFile: No repository information found.');
        return;
    }
    return userRepo;
}