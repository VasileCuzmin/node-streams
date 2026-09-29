import { join } from 'path'
import { writeFile, mkdir, rename, readdir, stat, unlink } from 'fs/promises'
import { chmod } from 'fs';
import fs from 'fs';

class FileLifecycleManager {
    constructor(basedir) {
        this.basedir = basedir;
        this.archiveDir = join(this.basedir, 'archive');
        this.tempDir = join(this.basedir, 'temp');
    }

    async createFile(filename, content) {
        try {
            const fullPath = join(this.basedir, filename);
            await writeFile(fullPath, content);
            await chmod(fullPath, 0o600);//0o600 sets the file permissions to read/write for the owner only
            return fullPath;
        } catch (error) {
            console.error(`Error creating file ${filename}:`, error);
            throw error;
        }
    }

    async archiveFile(filename) {
        try {
            const sourcePath = join(this.basedir, filename);
            const archivePath = join(this.archiveDir, `${filename}.${Date.now()}`);
            await mkdir(this.archiveDir, { recursive: true });
            await rename(sourcePath, archivePath);

            return archivePath;
        } catch (error) {
            console.error(`Error archiving file ${filename}:`, error);
            throw error;
        }
    }

    async cleanupTempFiles() {
        try {
            const tempFiles = await readdir(this.tempDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            for (const file of tempFiles) {
                const filePath = join(this.tempDir, file);
                const stats = await stat(filePath);
                if (now - stats.mtimeMs > maxAge) {// Delete files older than 24 hours
                    await unlink(filePath);
                }
            }

        } catch (error) {
            console.error(`Error cleaning up temp files:`, error);
            throw error;
        }
    }
}