const pb = require("pasteboard")
const process = require("process")
const _ = require("underscore")

function updateData() {
    const versions = process.versions
    const keys = _.allKeys(versions)
    if (keys.includes("uuid")) {
        keys.splice(keys.indexOf("uuid"), 1)
    }
    let popOvers = _.map(keys, (key) => {
        let val = versions[key]
        return {
            title: key,
            accessory: {
                title: val
            }
        }
    })
    popOvers.push({ 
        title: "Reveal Logs in Finder…",
        onClick: () => { process.openLogsFolder() }
    })
    popOvers.push({ 
        title: "Reveal Plugins in Finder…",
        onClick: () => { process.openPluginsFolder() }
    })
    if (typeof(process.checkForUpdates) === "function") { 
        // checkForUpdates function exists
        popOvers.push({
            title: "Check for Updates…",
            onClick: () => { process.checkForUpdates() }
        })
    }
    popOvers.push({ 
        title: `Toggle auto install preloaded plugins: ${process.installPreloadPluginsAtLaunch()}`,
        onClick: () => { 
            process.toggleInstallPreloadPluginsAtLaunch() 
            updateData()
        }
    })

    // Mini Window
    here.miniWindow.set({
        title: "Debug Info",
        detail: process.version,
        onClick: () => {
            pb.setText(JSON.stringify(process.versions))
            here.hudNotification("Debug info copied.")
        }
    })

    // Popovers
    if (typeof(here.popover.set) == "function") {
        here.popover.set(popOvers)
    }

    // Menu Bar
    here.menuBar.set({ title: process.version })

    // Dock
    here.dock.set({ 
        title: process.version,
        detail: "Here"
    })
}

here.onLoad(() => {
    updateData()
})
