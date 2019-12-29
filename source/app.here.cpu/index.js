const os = require("os")
const _ = require("underscore")

function updateCPUInfo() {
    console.verbose("updateCPUInfo")

    os.cpuUsage()
    .then((usage) => {
        console.verbose(JSON.stringify(usage))

        var percentage = 0
        var inuse = 0
        var idle = 0

        if (usage.overAll.total > 0) {
            console.verbose(`in use: ${usage.overAll.inUse}`)
            // console.debug(`total: ${usage.overAll.total}`)
            inuse = usage.overAll.inUse + ""
            percentage = Math.round(usage.overAll.inUse / usage.overAll.total * 100)
            idle = Math.round(usage.overAll.idle / usage.overAll.total * 100)
            // console.debug(`percentage: ${percentage}`)
            if (percentage < 10) {
                percentage = "" + percentage
            }
        }

        // Menu Bar
        here.setMenuBar({ title: `CPU ${percentage}%` })

        // Mini Window
        here.setMiniWindow({
            title: `CPU Usage`,
            detail: "Use:" + inuse,
            accessory: {
                title: percentage + "%",
                detail: "idle:" + idle + "%"
            }
        })

        // Dock
        here.setDock({
            title: percentage + "%",
            detail: inuse
        })
    })
    .catch((err) => {
        console.error(err)
        here.returnError(err)
    })
}

here.onLoad(() => {
    // Update every 3 seconds
    setInterval(updateCPUInfo, 3000);
})
