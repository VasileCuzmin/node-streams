import { chmod } from 'fs'
import { access, constants } from 'fs/promises'

// Function to check if a file has read, write, and execute permissions
export async function checkFilePermissions(filename) {
    try {
        await access(filename, constants.R_OK | constants.W_OK | constants.X_OK)


        //set permissions to read/write for owner only
        await chmod(filename, 0o600)
        //0o600 sets the file permissions to read/write for the owner only

        return true
    } catch (error) {
        console.error(`Error checking permissions for file ${filename}:`, error)
        return false
    }
}