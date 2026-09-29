import { createReadStream } from 'fs';

const readStream = createReadStream("./src/largefile.txt", { highWaterMark: 64 * 1024 });

let chunkCount = 0;
let totalBytesRead = 0;

const LOG_EVERY = 1000; // Log every 1000 chunks read

for await (const chunk of readStream) {
    chunkCount++;
    totalBytesRead += chunk.length;
    if (chunkCount % LOG_EVERY === 0) {
        console.log(`Read ${chunkCount} chunks, total bytes read: ${totalBytesRead}`);

        const mem = process.memoryUsage();
        const processedMB = totalBytesRead / (1024 * 1024);
        const rssMB = mem.rss / (1024 * 1024);
        const heapTotalMB = mem.heapTotal / (1024 * 1024);
        const heapUsedMB = mem.heapUsed / (1024 * 1024);
        console.log(`Processed ${processedMB.toFixed(2)} MB, Memory usage: RSS=${rssMB.toFixed(2)} MB, HeapTotal=${heapTotalMB.toFixed(2)} MB, HeapUsed=${heapUsedMB.toFixed(2)} MB`);
    }
}