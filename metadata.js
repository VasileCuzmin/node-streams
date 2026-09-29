import { stat } from 'fs/promises'

export async function getFileMetadata(filename) {
    try {
        const stats = await stat(filename)
        return {
            size: stats.size,
            modified: stats.mtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            accessed: stats.atime
        }
    } catch (error) {
        console.error(`Error getting metadata for file ${filename}:`, error)
        throw error
    }
}