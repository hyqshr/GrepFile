export interface QueryResponse {
    message: string;
    sources: Source[];
}

export interface IndexResponse {
    message: string;
}

export interface Source {
    repository: string;
    remote: string;
    branch: string;
    filepath: string;
    linestart: number | null;
    lineend: number | null;
    summary: string;
}

export interface RepositoryInfo {
    repository: string;
    branch: string;
}

export interface StreamResponse {
    type: 'sources' | 'status';
    message: any;  // This will be dynamic based on the type
}