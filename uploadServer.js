import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import path from 'path';
import fsp from 'fs/promises';
import crypto from 'crypto';
import { pipeline } from 'node:stream/promises'; // Safely await stream completion
import { Transform } from 'stream';

const app = Fastify({ logger: true });
await app.register(multipart);

app.post('/upload', async (req, reply) => {
    const uploadDir = path.resolve('./uploads');
    await fsp.mkdir(uploadDir, { recursive: true });

    for await (const data of req.parts()) {
        let totalBytes = 0;

        if (data.type !== 'file') {
            continue;
        }
        const id = crypto.randomUUID();
        //ignore any file name that user gaves me 
        const filePath = path.join(uploadDir, `${id}-${data.filename}`);
        const fileStream = await fsp.open(filePath, 'w');

        const tap = createTapTransform(chunk => {
            totalBytes += chunk.length;
        });
        await pipeline(data.file, createMaxSizeStream(2 * 1024), tap, fileStream.createWriteStream());
        console.log(`Uploaded ${totalBytes} bytes for file ${data.filename}`);

        return reply.send({ filename: data.filename });
    }
    return reply.code(400).send({ error: 'No file uploaded' });
});

function createMaxSizeStream(maxSize) {
    let totalSize = 0;
    return new Transform({
        transform(chunk, encoding, callback) {
            totalSize += chunk.length;
            if (totalSize > maxSize) {
                callback(new Error('File size exceeds the maximum allowed size'));
            } else {
                callback(null, chunk);
            }
        }
    });
}

function createTapTransform(sideEffect) {
    return new Transform({
        transform(chunk, encoding, callback) {
            try {
                sideEffect(chunk);
                callback(null, chunk);
            } catch (error) {
                callback(error);
            }
        }
    });
}


app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});