export interface ApiResponse {
    message: string;
    sources: Source[];
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