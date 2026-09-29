import { Transform } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';

const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
        try {
            const out = chunk.toString('utf-8').toUpperCase();
            callback(null, out);
        } catch (err) {
            callback(err);
        }
    }
});

const readable = createReadStream('./src/input.txt');
readable.pipe(upperCaseTransform);

for await (const chunk of upperCaseTransform) {
    process.stdout.write(chunk);
}

const writable = createWriteStream('./src/output.txt');
// readable
//     .pipe(upperCaseTransform)
//     .pipe(writable);


await pipeline(
    readable,
    upperCaseTransform,
    writable,
    (err) => {
        if (err) {
            console.error('Pipeline failed.', err);
        } else {
            console.log('Pipeline succeeded.');
        }
    }
);