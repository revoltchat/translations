// calculate % translated by looking at key counts
// deno run --allow-read --allow-write calculate.ts

function count(obj: any, acc = 0) {
    if (typeof obj === 'object') {
        for (const key in obj) {
            acc += count(obj[key]);
        }
    }

    return acc + 1;
}

const threshold = count(JSON.parse(await Deno.readTextFile('en.json'))) - 50;
const below_threshold = [];

for await (const entry of Deno.readDir('.')) {
    const fn = entry.name;
    if (fn.endsWith('.json')) {
        if (fn === 'contributors.json') continue;
        console.log('Processing', fn);

        const text = await Deno.readTextFile(fn);
        const data = JSON.parse(text);

        if (count(data) < threshold) {
            below_threshold.push(fn.split('.')[0]);
        }
    }
}

await Deno.writeTextFile("incomplete.js", 'export default ' + JSON.stringify(below_threshold, undefined, '\t'));
