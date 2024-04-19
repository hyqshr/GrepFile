export interface QueryResponse {
    message: string;
    sources: Source[];
}

export interface IndexResponse {
    message: string;
}

interface Source {
    repository: string;
    remote: string;
    branch: string;
    filepath: string;
    linestart: number | null;
    lineend: number | null;
    summary: string;
}