# BackKit

A powerful, lightweight command-line backup utility written in TypeScript. BackKit creates compressed backups of your files and directories, supports incremental backups, and provides easy restore functionality.

## Features

- ✅ **Full Directory Backups** - Backup entire directory structures with all files
- ✅ **Incremental Backups** - Only backup files that have changed (saves time and space)
- ✅ **Compressed Archives** - Creates `.tar.gz` archives to save disk space
- ✅ **Metadata Tracking** - Tracks file metadata (size, modification time, SHA256 hash)
- ✅ **Automatic Cleanup** - Removes old backups based on retention policy
- ✅ **Restore Functionality** - Easily restore files from backup archives
- ✅ **Permission Preservation** - Maintains file permissions and timestamps
- ✅ **Cross-Platform** - Works on Windows, Linux, and macOS

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/backkit.git
cd backkit
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Global Installation (Optional)

To use `backkit` as a global command:

1. Update `package.json` to include:
```json
{
  "bin": {
    "backkit": "./dist/cmd/main.js"
  }
}
```

2. Build and install globally:
```bash
npm run build
npm install -g .
```

Now you can use `backkit` from anywhere:
```bash
backkit -s "source" -d "destination"
```

## Usage

### Basic Backup

```bash
# Using npm script
npm run dev -- -s "path/to/source" -d "path/to/destination"

# Using compiled version
node ./dist/cmd/main.js -s "path/to/source" -d "path/to/destination"
```

### Incremental Backup

Only backs up files that have changed since the last backup:

```bash
npm run dev -- -s "source" -d "destination" -i
```

### Custom Retention Period

Set how many days to keep old backups (default: 30 days):

```bash
npm run dev -- -s "source" -d "destination" -r 7
```

### Restore from Backup

Restore files from a backup archive:

```bash
npm run dev -- --restore -s "backup-2025-01-15T10-30-00-000Z.tar.gz" -d "restore-folder"
```

## Command-Line Options

| Option | Short | Description | Required |
|--------|-------|-------------|----------|
| `--source <path>` | `-s` | Source directory to backup (or backup file for restore) | Yes |
| `--destination <path>` | `-d` | Destination folder for backups (or restore location) | Yes |
| `--incremental` | `-i` | Enable incremental backup mode | No |
| `--retention <days>` | `-r` | Number of days to keep old backups (default: 30) | No |
| `--restore` | | Restore from backup instead of creating backup | No |

## Examples

### Windows Examples

```powershell
# Basic backup
npm run dev -- -s "D:\MyDocuments" -d "D:\Backups"

# Incremental backup with 7-day retention
npm run dev -- -s "D:\Projects" -d "D:\Backups" -i -r 7

# Restore latest backup
npm run dev -- --restore -s "D:\Backups\backup-2025-01-15T10-30-00-000Z.tar.gz" -d "D:\Restored"
```

### Linux/macOS Examples

```bash
# Basic backup
npm run dev -- -s "/home/user/documents" -d "/home/user/backups"

# Incremental backup
npm run dev -- -s "/home/user/projects" -d "/home/user/backups" -i

# Restore
npm run dev -- --restore -s "/home/user/backups/backup-2025-01-15T10-30-00-000Z.tar.gz" -d "/home/user/restored"
```

## How It Works

### Backup Process

1. **Validation** - Validates source and destination paths
2. **Metadata Check** - Reads previous backup metadata (if incremental)
3. **Directory Traversal** - Recursively scans source directory
4. **Change Detection** - Compares file size and modification time
5. **Hashing** - Computes SHA256 hash for changed files
6. **Archive Creation** - Creates compressed `.tar.gz` archive
7. **Metadata Storage** - Saves metadata to `.goback-meta.json`
8. **Cleanup** - Removes old backups based on retention policy

### Restore Process

1. **Archive Reading** - Opens the `.tar.gz` backup file
2. **Decompression** - Decompresses the archive
3. **Extraction** - Extracts files to destination directory
4. **Permission Restoration** - Restores file permissions
5. **Timestamp Restoration** - Restores file modification times

## Project Structure

```
BackKit/
├── src/
│   ├── cmd/
│   │   └── main.ts          # CLI entry point
│   ├── cli/
│   │   └── args.ts          # Argument validation
│   ├── core/
│   │   ├── backup.ts        # Main backup logic
│   │   ├── restore.ts       # Restore functionality
│   │   ├── incremental.ts   # Change detection
│   │   ├── traversal.ts     # Directory walking
│   │   ├── archive.ts       # Archive utilities
│   │   └── types.ts         # TypeScript types
│   ├── storage/
│   │   └── metadataStore.ts # Metadata persistence
│   └── utils/
│       ├── hash.ts          # File hashing
│       ├── passThroughHash.ts # Streaming hash
│       └── progress.ts      # Progress tracking
├── dist/                    # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Build

```bash
npm run build
```

### Development Mode

Run directly with TypeScript (no build needed):

```bash
npm run dev -- -s "source" -d "destination"
```

### Linting

```bash
npm run lint
```

## Metadata File

BackKit creates a `.goback-meta.json` file in the destination directory that contains:

- Backup creation timestamp
- Version number
- File metadata (path, size, modification time, SHA256 hash, permissions)

This file is used for incremental backups to determine which files have changed.

## Backup File Format

Backups are stored as `.tar.gz` files with the naming convention:
```
backup-YYYY-MM-DDTHH-MM-SS-sssZ.tar.gz
```

Example: `backup-2025-01-15T10-30-00-000Z.tar.gz`

## Limitations

- Currently only supports `.tar.gz` format
- No encryption support (yet)
- No cloud storage integration (yet)
- No progress bar (yet)
- No file exclusion patterns (yet)

## Future Enhancements

- [ ] Progress bar for backup/restore operations
- [ ] File exclusion patterns (`.gitignore` style)
- [ ] Cloud storage integration (AWS S3, Google Drive, etc.)
- [ ] Backup encryption (AES-256)
- [ ] Scheduled backups
- [ ] Multiple backup format support (ZIP, 7z)
- [ ] Backup verification
- [ ] Resume interrupted backups
- [ ] Backup listing and management commands

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

This project is a TypeScript port of the [goback](https://github.com/ppriyankuu/goback) Go project.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Built with TypeScript and Node.js** 🚀
