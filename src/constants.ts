// src/commands.ts
/**
 * 
 * - `AskToken`: Triggers a prompt to ask for necessary API tokens.
 * 
 * - `InitSearch`: Initiates a search operation based on user input.
 * 
 * - `OpenFile`: Opens a file in the editor when triggered from other parts of the extension.
 * 
 * - `SendRepoData`: Sends repository data to a configured endpoint.
 * 
 * - `CheckRepoIndex`: Checks if the repository index is up-to-date or needs refreshing.
 * 
 */

export const Commands = {
    AskToken: 'GrepFile.askToken',
    InitSearch: 'GrepFile.initSearch',
    OpenFile: 'GrepFile.openFile',
    SendRepoData: 'GrepFile.sendRepoData',
    CheckRepoIndex: 'GrepFile.checkRepoIndex'
};

// Constants used throughout the VSCode extension
export const CONSTANTS = {
    GREPTILE_KEY: "Greptile API Key",
    GITHUB_KEY: "GitHub Token",
    MISSING_TOKENS_MESSAGE: "API tokens are missing."
};