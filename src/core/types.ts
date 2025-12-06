export type BackupOptions = {
  source: string;
  destination: string;
  incremental?: boolean;
  retentionDays?: number;
  concurrency?: number;
};

export type FileMeta = {
  path: string;       // relative path
  size: number;
  mtimeMs: number;
  sha256: string;
  mode: number;
};

export type Metadata = {
  createdAt: string;
  files: Record<string, FileMeta>;
  version?: number;
};
