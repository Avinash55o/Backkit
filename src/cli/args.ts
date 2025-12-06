import { existsSync, statSync } from "fs";
import * as path from "path";

export interface ParsedArgs {
  source: string;
  destination: string;
  incremental: boolean;
  retentionDays: number;
  restore: boolean;
}

export function validateArgs(args: Partial<ParsedArgs>): ParsedArgs {
  if (!args.source) {
    throw new Error("Source path is required");
  }
  
  if (!args.destination) {
    throw new Error("Destination path is required");
  }
  
  // Ensure paths are absolute
  const source = path.resolve(args.source);
  const destination = path.resolve(args.destination);
  
  // For restore mode, source should be a backup file
  // For backup mode, source should be a directory
  if (args.restore) {
    if (!existsSync(source)) {
      throw new Error(`Backup file does not exist: ${source}`);
    }
    const stat = statSync(source);
    if (stat.isDirectory()) {
      throw new Error(`Source must be a backup file (.tar.gz) for restore mode, but got a directory: ${source}`);
    }
    if (!source.endsWith(".tar.gz")) {
      throw new Error(`Source must be a .tar.gz backup file for restore mode: ${source}`);
    }
  } else {
    // For backup mode, source must be a directory
    if (!existsSync(source)) {
      throw new Error(`Source path does not exist: ${source}`);
    }
    const stat = statSync(source);
    if (!stat.isDirectory()) {
      throw new Error(`Source must be a directory for backup mode: ${source}`);
    }
  }
  
  return {
    source,
    destination,
    incremental: args.incremental ?? false,
    retentionDays: args.retentionDays ?? 30,
    restore: args.restore ?? false
  };
}
