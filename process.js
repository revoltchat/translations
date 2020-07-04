const { readdirSync, readFileSync, existsSync, writeFileSync } = require('fs');

function recurseKeys(object, path = []) {
    let collected = [];
    let keys = Object.keys(object);

    for (let key of keys) {
        let item = object[key];
        let current = [ ...path, key ];

        if (typeof item === 'object') {
            collected = [ ...collected, ...recurseKeys(item, current) ];
        } else {
            collected.push(current.join('.'));
        }
    }

    return collected;
}

let en = JSON.parse(readFileSync('en.json'));
let keys = recurseKeys(en);

let output = [];
let language_files = readdirSync('.');
for (let file of language_files) {
    if (file.endsWith('.json')) {
        if (!existsSync(file + '.d.ts')) {
            writeFileSync(file + '.d.ts', 'export default any;\n');
        }

        let lang = JSON.parse(readFileSync(file));
        let lkey = recurseKeys(lang);

        let missing = keys.filter(x => !lkey.includes(x));
        let extraneous = lkey.filter(x => !keys.includes(x));

        output.push(`${file} | \`${((1 - missing.length / keys.length) * 100).toFixed(2)}%\` | ${missing.map(x => '`' + x + '`').join('<br>')} | ${extraneous.map(x => '`' + x + '`').join('<br>')}`);
    }
}

let s = `------|-----|--------------|-----------------`;
let inp = readFileSync('README.md').toString().split(s)[0];
writeFileSync('README.md', inp + s + '\n' + output.join('\n'));
