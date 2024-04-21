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
    MISSING_TOKENS_MESSAGE: "GrepFile: API tokens are missing.",
    API_URLS: {
        REPOSITORIES: 'https://api.greptile.com/v2/repositories',
        QUERY: 'https://api.greptile.com/v2/query'
    },
    ERRORS: {
        TOKENS_MISSING: 'GrepFile: Authentication tokens are missing.',
        SEND_REPO_DATA_FAILED: 'GrepFile: Failed to send repository data.',
        SEND_QUERY_FAILED: 'GrepFile: Failed to send query.',
        CHECK_INDEX_FAILED: 'GrepFile: Failed to check repository indexing: '
    },
    HEADERS: {
        CONTENT_TYPE_JSON: 'application/json'
    },
    TITLES: {
        SENDING_REPO_DATA: 'GrepFile: Sending repository data...',
        SENDING_QUERY: 'Sending query...',
        CHECKING_REPO_INDEX: 'GrepFile: Checking if repository is indexed...'
    }
};