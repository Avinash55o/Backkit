#!/usr/bin/env node
import { Command } from "commander";
import { runBackup } from "../core/backup";
import { extractTarGz } from "../core/restore";
import { validateArgs } from "../cli/args";

const program = new Command();

program
  .name("goback-ts")
  .description("TypeScript backup CLI")
  .requiredOption("-s, --source <path>", "source directory")
  .requiredOption("-d, --destination <path>", "destination folder")
  .option("-i, --incremental", "use incremental checks", false)
  .option("-r, --retention <days>", "retention days to keep local archives", "30")
  .option("--restore", "restore from backup")
  .parse(process.argv);

const opts = program.opts();

try {
  const args = validateArgs({
    source: opts.source,
    destination: opts.destination,
    incremental: !!opts.incremental,
    retentionDays: Number(opts.retention),
    restore: !!opts.restore
  });

  if (args.restore) {
    extractTarGz(args.source, args.destination)
      .then(() => console.log("Restore completed"))
      .catch(err => {
        console.error("restore failed:", err);
        process.exit(2);
      });
  } else {
    runBackup({
      source: args.source,
      destination: args.destination,
      incremental: args.incremental,
      retentionDays: args.retentionDays
    }).catch(err => {
      console.error("backup failed:", err);
      process.exit(2);
    });
  }
} catch (err: any) {
  console.error("Error:", err.message);
  process.exit(1);
}