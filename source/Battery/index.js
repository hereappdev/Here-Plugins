const pm = require("pm")
const _ = require("underscore")

function updateBatteryInfo() {
    console.verbose("updateBatteryInfo")

    let basicInfo = {}
    let advancedInfo = {}
    let otherInfo = []
    let airPodsInfo = []

    pm.batteryInfo()
    .then((info) => {
        console.verbose(`basicInfo: ${info}`)
        basicInfo = JSON.parse(info)

        return pm.advancedBatteryInfo()

    }).then((info) => {
        console.verbose(`advanceded info: ${info}`)
        advancedInfo = JSON.parse(info)

        return pm.otherBatteryInfo()

    }).then((info) => {
        console.verbose(`other info: ${info}`)
        otherInfo = JSON.parse(info)

        return pm.privateAirPodsBatteryInfo()

    }).then((info) => {
        console.verbose(`private info: ${info}`)
        airPodsInfo = JSON.parse(info)

        let percentage = Math.round((Number(basicInfo["Current Capacity"]) / Number(basicInfo["Max Capacity"])) * 100)+ "%"
        let title = "Battery Health: " + basicInfo["BatteryHealth"]
        let state = Boolean(basicInfo["Is Charging"])? "🔋" : ""
        let detailText = state + "Cycle Count: " + advancedInfo["CycleCount"] + " (" + basicInfo["Power Source State"] + ")"
        if (basicInfo["Max Capacity"] == 0) {
            percentage = "100%"
            title = `Connected accessories (${otherInfo.length})`
            detailText = "Not charging"
        }

        let popovers = _.map(otherInfo, (aInfo, index) => {
            return {
                title: aInfo["name"],
                accessory: {
                    title: aInfo["batteryPercent"] + "%"
                }
            }
        })
        popovers = popovers.concat(_.map(airPodsInfo, (aInfo, index) => {
            return {
                title: `${aInfo["name"]} L: ${aInfo["batteryPercentLeft"]} R: ${aInfo["batteryPercentRight"]} Case: ${aInfo["batteryPercentCase"]}`
            }
        }))
        console.verbose(popovers)

        // Menu Bar
        here.menuBar.set({
            title: percentage,
            detail: "Battery"
        })

        // Mini Window
        here.miniWindow.set({
            title: "Battery Status",
            detail: detailText,
            accessory: {
                title: percentage,
                detail: title
            }
        })

        here.popover.set(popovers)

        // Dock
        here.dock.set({
            title: percentage,
            detail: title
        })
    })
    .catch((err) => {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: err })
    })
}

pm.watchPowerChange(() => {
    console.verbose("Power Changed")
    updateBatteryInfo()
})

here.on('load', () => {
    updateBatteryInfo()
})