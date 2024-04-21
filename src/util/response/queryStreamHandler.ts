import { Readable } from 'stream';
import { Source, StreamResponse } from '../../types';
import * as vscode from 'vscode';

/**
 * Processes data from a stream and resolves with an array of file paths if sources are received.
 * The function listens for data events and parses them to extract file paths,
 * 
 * @param stream A Readable stream from which data is received.
 * @param cancellationToken A cancellation token to handle the cancellation of the stream processing.
 * @returns A promise that resolves to an array of file paths, or rejects with an empty array in case of errors.
 */
export function processQueryStream(stream: Readable, cancellationToken: vscode.CancellationToken): Promise<string[]> {
    let buffer = '';

    return new Promise<string[]>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            processBuffer(buffer, resolve);
            buffer = buffer.substring(buffer.lastIndexOf('\n') + 1);
        });

        stream.on('end', () => {
            console.log("Streaming ended without finding sources.");
            resolve([]);  // No sources found
        });

        stream.on('error', (error: Error) => {
            console.error('Stream error:', error);
            reject([]);
        });

        cancellationToken.onCancellationRequested(() => {
            stream.destroy();
            console.log("Streaming cancelled by the user.");
            reject([]);
        });
    });
}

/**
 * Processes buffered data from the stream and extracts source, resolving the promise if sources are found.
 * 
 * @param buffer The current string buffer containing the streamed data.
 * @param resolve The resolve function of the promise, called with the array of file paths if found.
 */
export function processBuffer(buffer: string, resolve: (filePaths: string[]) => void): void {
    const parts = buffer.split('\n').filter(part => part.trim());

    parts.forEach(part => {
        try {
            const json: StreamResponse = JSON.parse(part);
            if (json.type === 'sources') {
                const filepaths = (json.message as Source[]).map(source => source.filepath);
                resolve(filepaths);  // Resolve promise with file paths
            } else {
                // TODO: Handle other types of messages from stream
                console.log("Streamed message:", json.message);
            }
        } catch (error) {
            console.error('Failed to parse part of the stream:', part);
        }
    });
}