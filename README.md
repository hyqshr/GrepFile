# GrepFile for Visual Studio Code

Lost in a large codebase? 

Forget the location of files but remembering what they're about? 

Lazy to navigate through the codebase manually? 

Want to search file by more than hard-coded text match?

If so, **GrepFile** is here to help!

**GrepFile** is a powerful extension for Visual Studio Code that integrates with the Greptile API to enhance your ability to navigate through large codebases quickly. By leveraging a Language Learning Model (LLM) that understands the context of your entire codebase, GrepFile makes finding the right files effortless.

## Features

- **Fast File Searching**
- **Easy Repository Indexing**
- **Seamless Integration**
- **Context to the whole codebase**

## Prerequisites

Before you begin using GrepFile, ensure that you have the following:
- Visual Studio Code installed on your computer.
- Set up Github token and Greptile API token

## Setup

Follow these steps to set up the GrepFile extension:

### Step 1: Upload GitHub and Greptile API Token

1. Open the Command Palette in Visual Studio Code with `Ctrl+Shift+P`.
2. Type and select `GrepFile: Enter GitHub token and Greptile API key` command.
3. Enter your GitHub token and Greptile API key as prompted.

### Step 2: Index Your Repository

If your repository has not been indexed yet, follow these steps to index it:

1. Open the Command Palette with `Ctrl+Shift+P`.
2. Execute the `GrepFile: Send Repository Data` command to start the indexing process.

### Step 3: Search for Files

Once the setup is complete, you can begin searching for files:

1. Open the Command Palette with `Ctrl+Shift+P`.
2. Execute the `GrepFile: Find files` command.
3. Type the context or the name of the file you are looking for.

## Commands

- `GrepFile: Enter Github Token and Greptile API Key`: Triggers a prompt to ask for github token and Greptile API key.

- `GrepFile: Find files`: Initiates a search operation based on user input.

- `GrepFile: Send Repository Data`: Sends repository data to a configured endpoint.

- `GrepFile: Check Repository Index`: Checks if the repository index is up-to-date or needs refreshing.


## Support

If you encounter any issues or have feedback to improve GrepFile, please open an issue on our GitHub repository.

## Contributing

Contributions to the GrepFile extension are welcome! Please refer to our contribution guidelines on GitHub for more information on how to contribute.
