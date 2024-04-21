# GrepFile for Visual Studio Code

***Feeling overwhelmed by a massive codebase?***

***Can't recall where that file is, but know what it does?***

***Prefer to search with human-friendly queries rather than exact text matches?***

**If so, **GrepFile** is here to help!**

<img src="https://github.com/hyqshr/GrepFile/assets/63976795/92e84b4f-c181-47d5-9868-12b0409e078a" width="30%" alt="logo">


**GrepFile** is a powerful extension for Visual Studio Code that integrates with the **Greptile API** to enhance your ability to navigate through large codebases quickly. By leveraging a Language Learning Model (LLM) that understands the context of your entire codebase, GrepFile makes finding the right files effortless.

https://marketplace.visualstudio.com/items?itemName=YiqiuHuang.grepfile

https://github.com/hyqshr/GrepFile/assets/63976795/df8802ba-e831-4296-90f0-3d9068b003a9


## Features

- **Contextual File Search**: Search for files with precision based on the context of the file

- **Stream Response Handling**: Handles streaming responses from the Greptile API and deliver file sources faster.

- **Comprehensive Codebase Context**: Always have the most current and complete context of your codebase.

## Prerequisites

Before you begin using GrepFile, ensure that you have the following:
- Visual Studio Code installed on your computer.
- Set up *Github token* and *Greptile API token*

## Setup
If you want to run this project locally, navigate to `extention.ts` and press `F5`.

Follow these steps to set up the GrepFile extension:

### Step 1: Upload GitHub and Greptile API Token

1. Open the Command Palette in Visual Studio Code with `Ctrl+Shift+P`.
2. Search and select `GrepFile: Enter GitHub token and Greptile API key` command.
3. Enter your GitHub token and Greptile API key as prompted.

### Step 2: Index Your Repository

If your repository has not been indexed yet, follow these steps:

1. Open the Command Palette with `Ctrl+Shift+P`.
2. Execute the `GrepFile: Send Repository Data` command to start the indexing process. 

Note: Indexing process may take 15-20 minutes the first time the repository is being indexed

### Step 3: Search for Files

Once the setup is complete, you can start searching for files in two easy ways:

1. Open the Command Palette using `Ctrl+Shift+P` and execute the `GrepFile: Find files` command.
2. Alternatively, simply press `Shift + Space`.

Then, type the context or the name of the file you're searching for.

## Commands

- `GrepFile: Enter Github Token and Greptile API Key`: Triggers a prompt to enter github token and Greptile API key.

- `GrepFile: Find files`: Initiates a search operation based on user input.

- `GrepFile: Send Repository Data`: Sends repository data to a configured endpoint.

- `GrepFile: Check Repository Index`: Checks if the repository index is up-to-date or needs refreshing.


## Support

If you encounter any issues or have feedback to improve GrepFile, please open an issue on our GitHub repository.
