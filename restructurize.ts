// move stuff
// deno run --allow-read --allow-write restructurize.ts

for await (const entry of Deno.readDir('.')) {
    const fn = entry.name;
    if (fn.endsWith('.json')) {
        console.log('Processing', fn);

        const text = await Deno.readTextFile(fn);
        const data = JSON.parse(text);

        // [2022-04-21] Combine server / channel permissions.
        if (data?.permissions?.server) {
            Object.keys(data.permissions.server)
                .forEach(key => data.permissions[key] = data.permissions.server[key]);
        }

        if (data?.permissions?.channel) {
            Object.keys(data.permissions.channel)
                .forEach(key => data.permissions[key] = data.permissions.channel[key]);
        }

        delete data?.permissions?.server;
        delete data?.permissions?.channel;

        // * Commit
        await Deno.writeTextFile(fn, JSON.stringify(data, undefined, '\t'));
    }
}
