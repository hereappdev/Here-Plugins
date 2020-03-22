const pb = require("pasteboard")
const process = require("process")
const _ = require("underscore")

function updateData() {
    const versions = process.versions
    const keys = _.allKeys(versions)
    if (keys.includes("uuid")) {
        keys.splice(keys.indexOf("uuid"), 1)
    }
    let versionData = _.map(keys, (key) => {
        let val = versions[key]
        return {
            title: key,
            accessory: {
                title: val
            }
        }
    })
    let debug = []
    debug.push({ 
        title: "Reveal Logs in Finder…",
        onClick: () => { process.openLogsFolder() }
    })
    debug.push({ 
        title: "Reveal Plugins in Finder…",
        onClick: () => { process.openPluginsFolder() }
    })
    if (typeof(process.checkForUpdates) === "function") { 
        // checkForUpdates function exists
        debug.push({
            title: "Check for Updates…",
            onClick: () => { process.checkForUpdates() }
        })
    }
    debug.push({ 
        title: `Toggle auto install preloaded plugins: ${process.installPreloadPluginsAtLaunch()}`,
        onClick: () => { 
            process.toggleInstallPreloadPluginsAtLaunch() 
            updateData()
        }
    })

    // console.log(JSON.stringify(process.versions.shortVersion))
    // Mini Window
    here.miniWindow.set({
        title: "Debug Info",
        detail: "Here " + process.versions.stage,
        accessory: {
                title: "v" + process.versions.shortVersion,
                detail: "(" + process.versions.buildNumber + ")"
            },
        onClick: () => {
            pb.setText(JSON.stringify(process.versions))
            here.hudNotification("Debug info copied.")
        }
    })

    // Popovers
    if (typeof(here.popover.set) == "function") {
        here.popover.set([
            {
                title: "Version",
                data: versionData
            },
            {
                title: "Debug",
                data: debug
            }
        ])
    }

    // Menu Bar
    here.menuBar.set({
        title: "v" + process.versions.shortVersion,
        detail: process.versions.buildNumber
    })

    // Dock
    here.dock.set({
        title: "v" + process.versions.shortVersion,
        detail: process.versions.buildNumber
    })
}

here.on('load', () => {
    updateData()
})
