import { createReadStream, createWriteStream } from 'fs';

const readStream = createReadStream("./src/largefile.txt");
const writeStream = createWriteStream("./src/output.txt");

let chunkCount = 0;
let totalBytesRead = 0;
let backpressureCount = 0; // Count the number of times backpressure occurs
//backpressure occurs when writeStream.write(chunk) returns false
//we should wait for the 'drain' event before continuing to write more chunks

//what is backpresure? 
// Backpressure is a mechanism to prevent a writable stream from being overwhelmed by too much data at once. 
// It occurs when writeStream.write(chunk) returns false, indicating that the internal buffer is full and the stream cannot handle more data until it drains.
// More details on backpressure can be found here:
// https://medium.com/@vloban/managing-back-pressure-in-node-js-streams-932587aae997

const waitForDrain = () => new Promise(resolve => writeStream.once('drain', resolve));

const LOG_EVERY = 1000; // Log every 1000 chunks read

for await (const chunk of readStream) {
    chunkCount++;
    totalBytesRead += chunk.length;

    // Write the chunk to the writable stream
    if (!writeStream.write(chunk)) {// write() returns false when the internal buffer
        // is full and the stream cannot handle more data until it drains
        backpressureCount++;
        await waitForDrain();
    }

    if (chunkCount % LOG_EVERY === 0) {
        console.log(`Read ${chunkCount} chunks, total bytes read: ${totalBytesRead}, backpressureCount: ${backpressureCount}`);

        const mem = process.memoryUsage();
        const processedMB = totalBytesRead / (1024 * 1024);
        const rssMB = mem.rss / (1024 * 1024);
        const heapTotalMB = mem.heapTotal / (1024 * 1024);
        const heapUsedMB = mem.heapUsed / (1024 * 1024);
        console.log(`Processed ${processedMB.toFixed(2)} MB, Memory usage: RSS=${rssMB.toFixed(2)} MB, HeapTotal=${heapTotalMB.toFixed(2)} MB, HeapUsed=${heapUsedMB.toFixed(2)} MB`);
    }
}

//why is this called in a promise? 
// The writeStream.end() method is asynchronous and takes a callback that is called when the stream has finished writing all data and has been closed. 
// Wrapping it in a Promise allows us to use await to ensure that the stream has fully ended before continuing execution.
await new Promise((resolve, reject) => {
    writeStream.end((err) => {
        if (err) {
            reject(new Error('Failed to end write stream'));
        } else {
            resolve();
        }
    });
});