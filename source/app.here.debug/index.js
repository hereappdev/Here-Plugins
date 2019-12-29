const pb = require("pasteboard")
const process = require("process")
const _ = require("underscore")

here.onLoad(() => {
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
})
