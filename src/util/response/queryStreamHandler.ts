import { Readable } from 'stream';
import { Source, StreamResponse } from '../../types';
import * as vscode from 'vscode';

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

// Function to process buffer and resolve based on message type
export function processBuffer(buffer: string, resolve: (filePaths: string[]) => void): void {
    const parts = buffer.split('\n').filter(part => part.trim());

    parts.forEach(part => {
        try {
            const json: StreamResponse = JSON.parse(part);
            if (json.type === 'sources') {
                const filepaths = (json.message as Source[]).map(source => source.filepath);
                resolve(filepaths);  // Resolve promise with file paths
            } else {
                console.log("Streamed message:", json.message);
            }
        } catch (error) {
            console.error('Failed to parse part of the stream:', part);
        }
    });
}