import { stat, mkdir, readFile, writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function readDocument(filename) {
    try {
        const filePath = join(__dirname, filename)
        const stats = await stat(filePath)
        console.log(`File stats for ${filename}:`, stats)
        if (!stats.isFile()) {
            throw new Error(`${filename} is not a file`)
        }

        if (stats.size > 10 * 1024 * 1024) {
            throw new Error(`${filename} exceeds the maximum allowed size of 10MB`)
        }

        const content = await readFile(filePath, "utf-8")
        return {
            content,
            size: stats.size,
            modified: stats.mtime
        }
    } catch (error) {
        console.error(`Error reading file ${filename}:`, error)
        throw error
    }
}

async function writeDocument(filename, content) {
    try {
        const filePath = dirname(filename)
        await mkdir(filePath, { recursive: true })

        await writeFile(filename, content);
        console.log(`File ${filename} written successfully`)

        return true;
    } catch (error) {
        console.error(`Error writing file ${filename}:`, error)
        throw error
    }
}

async function processDocument(inputFile, outputFile) {
    try {
        console.log(`Processing document from ${inputFile} to ${outputFile}`)
        const inputData = await readDocument(inputFile)
        const processedData = inputData.content.toUpperCase()
        const outputSuccesful = await writeDocument(outputFile, processedData)
        if (!outputSuccesful) {
            throw new Error(`Failed to write output file ${outputFile}`)
        }

        return outputSuccesful
    } catch (error) {
        console.error(`Error processing document from ${inputFile} to ${outputFile}:`, error)
        throw error
    }
}


await processDocument("input.txt", "output.txt")