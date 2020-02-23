const _ = require("underscore")
const http = require("http")
const pref = require("pref")
const net = require("net")
const mt = require("moment.min.js")

function updateData() {
    var location = "newyork"
    var degreeUnits = "°F"
    var degreeUnitsCode = "f"

    here.setMiniWindow({ title: "Updating…" })

    const json = pref.all()

    if (json == undefined) {
        console.log("No prefs found.")
    }
    
    if (json["location"] != undefined) {
        location = json["location"]
    }

    // console.debug(JSON.stringify(json))

    if (json["degreeUnits"] != undefined) {
        if(json["degreeUnits"] == 0) {
            degreeUnits = "°F"
            degreeUnitsCode = "f"
        }
        else {
            degreeUnits = "°C"
            degreeUnitsCode = "c"
        }
    }

    // console.debug('degreeUnits:' + degreeUnits)

    http.get("https://api.herecdn.com/weather/?location=" + location + "&u=" + degreeUnitsCode)
    .then((response) => {

        const json = response.data

        // console.debug(json["forecasts"][0])

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

        let popOvers = _.map(keys, (key) => {
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

        // console.debug(JSON.stringify(popOvers))

        // Menu Bar
        here.setMenuBar({ title: weatherText + " " + weatherTemperature })

        // Mini Window
        here.setMiniWindow({
            title: weatherCity,
            detail: "↑" + weatherHigh + degreeUnits + " · ↓" + weatherLow + degreeUnits + " (" + moment(weatherToday).format("dddd") + ")",
            popOvers: popOvers,
            accessory: {
                title: weatherText,
                detail: weatherTemperature
            },
            onClick: updateData
        })

        // Dock
        here.setDock({
            title: weatherTemperature,
            detail: weatherText
        })
    })
    .catch((error) => {
        console.error("Error: " + JSON.stringify(error))
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})