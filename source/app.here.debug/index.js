const pb = require("pasteboard")
const process = require("process")
const _ = require("underscore")

function updateData() {
    const versions = process.versions
    const keys = _.allKeys(versions)
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
        title: "Reveal Logs in Finder",
        onClick: () => { process.openLogsFolder() }
    })
    popOvers.push({ 
        title: "Reveal Plugins in Finder",
        onClick: () => { process.openPluginsFolder() }
    })
    popOvers.push({ 
        title: `Toggle auto install preloaded plugins: ${process.installPreloadPluginsAtLaunch()}`,
        onClick: () => { 
            process.toggleInstallPreloadPluginsAtLaunch() 
            updateData()
        }
    })

    // Mini Window
    here.setMiniWindow({
        title: "Debug Info",
        detail: process.version,
        popOvers: popOvers,
        onClick: () => {
            pb.setText(JSON.stringify(process.versions))
            here.hudNotification("Debug info copied.")
        }
    })

}

here.onLoad(() => {
    updateData()
})
