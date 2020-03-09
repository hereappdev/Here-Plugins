const os = require("os")
const _ = require("underscore")

function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0K';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
}

function updateMenuBar(deltain, deltaout) {
    const inStr = formatBytes(deltain) + '/s'
    const outStr = formatBytes(deltaout) + '/s'

    here.menuBar.set({
        title: {
            text: outStr.padStart(6, " ") + "⇡",
            useMonospaceFont: true
        },
        detail: {
            text: inStr.padStart(6, " ") + "⇣",
            useMonospaceFont: true
        }
    })
}

function netUsage() {
    // console.debug("netUsage")
    os.netStat()
    .then((json) => {
        console.verbose(json)

        const totalin = json["totalin_string"]

        // Menu Bar
        const deltain = Number(json["deltain"])
        const deltaout = Number(json["deltaout"])
        updateMenuBar(deltain, deltaout)

        // Mini Window
        here.miniWindow.set({
            title: "Network Speed",
            detail: "Total Download: " + totalin,
            accessory: {
                title: "⇣" + deltain,
                detail: "⇡" + deltaout
            }
        })

        // Dock
        here.dock.set({
            title: "⇣" + deltain,
            detail: "⇡" + deltaout
        })
    })
    .catch((error) => {
        console.error(`err: ${JSON.stringify(error)}`)
        updateMenuBar(0,0)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}


here.onLoad(() => {
    netUsage()
    setInterval(netUsage, 3000)
})