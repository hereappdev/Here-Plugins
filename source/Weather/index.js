const _ = require("underscore")
const http = require("http")
const pref = require("pref")
const net = require("net")
const mt = require("moment.min.js")

function updateData() {
    var location = "newyork"
    var degreeUnits = "℉"
    var degreeUnitsCode = "f"

    here.miniWindow.set({ title: "Updating…" })

    const json = pref.all()

    if (json == undefined) {
        console.log("No prefs found.")
    }
    
    if (json["location"] != undefined) {
        location = json["location"]
    }

    // console.log(JSON.stringify(json))

    if (json["degreeUnits"] != undefined) {
        if(json["degreeUnits"] == 0) {
            degreeUnits = "℉"
            degreeUnitsCode = "f"
        }
        else {
            degreeUnits = "℃"
            degreeUnitsCode = "c"
        }
    }

    // console.log('degreeUnits:' + degreeUnits)

    http.get("https://apispeedy.com/weather/?location=" + location + "&u=" + degreeUnitsCode)
    .then((response) => {

        const json = response.data

        // console.log(json["forecasts"][0])

        if (json == undefined) {
            console.error("JSON result undefined")
            return
        }
        
        const weatherCity = json["location"]["city"]
        const weatherToday = json["current_observation"]["pubDate"] * 1000
        const weatherLow = json["forecasts"][0]["low"]
        const weatherHigh = json["forecasts"][0]["high"]
        const weatherText = json["current_observation"]["condition"]["text"]
        const weatherTemperature = json["current_observation"]["condition"]["temperature"] + degreeUnits

        const weatherForecasts = json["forecasts"]
        const keys = _.allKeys(weatherForecasts)

        let popovers = _.map(keys, (key) => {
            let value = weatherForecasts[key]
            return {
                title: moment(value["date"] * 1000).format("MMM DD, dddd") + " " + ( key == 0 ? "(Today)" : "" ),
                accessory: {
                    title: value["text"],
                    imageURL: "images/" + value["code"] + ".png",
                    imageCornerRadius: 4
                }
            }
        })

        // console.log(JSON.stringify(popovers))

        // Menu Bar
        here.menuBar.set({
            title: weatherText,
            detail: weatherTemperature
        })

        // Mini Window
        here.miniWindow.set({
            title: weatherCity,
            detail: "↑" + weatherHigh + degreeUnits + " · ↓" + weatherLow + degreeUnits + " (" + moment(weatherToday).format("dddd") + ")",
            accessory: {
                title: weatherText,
                detail: weatherTemperature
            },
            onClick: updateData
        })
        here.popover.set(popovers)

        // Dock
        here.dock.set({
            title: weatherTemperature,
            detail: weatherText
        })
    })
    .catch((error) => {
        console.error("Error: " + JSON.stringify(error))
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})