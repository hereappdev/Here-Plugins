const _ = require("underscore")
const http = require("http")
const pref = require("pref")

function updateData() {
    var coinName = "BTC Price"
    var coinCode = "BTC"

    here.setMiniWindow({ title: "Updating…" })

    const json = pref.all()

    if (json == undefined) {
        console.log("No prefs found.")
    }
    
    if (json["coinCode"] != undefined) {
        coinCode = json["coinCode"].toUpperCase()
    }
    
    if (json["coinName"] != undefined) {
        coinName = json["coinName"]
    }

    http.get("https://production.api.coindesk.com/v1/currency/" + coinCode + "/ticker")
    .then((response) => {

        // console.verbose(data)

        const json = response.data
        const usdPrice = json["data"]["currency"][coinCode]["quotes"]["USD"]

        console.verbose(json["data"]["currency"][coinCode]["quotes"]["USD"])

        if (json == undefined) {
            console.error("JSON result undefined")
            return
        }
        
        const curPrice = "$" + usdPrice["price"].toFixed(0) + ""
        const lowPrice = "$" + usdPrice["low"].toFixed(0) + ""
        const hightPrice = "$" + usdPrice["high"].toFixed(0) + ""
        const curRate = usdPrice["change24Hr"]["percent"].toFixed(2)
        const percentage = ((curRate < 0) ? curRate : "+" + curRate) + "%"

        // console.debug(percentage)

        // Menu Bar
        here.setMenuBar({ title: `${coinCode}:${curPrice}(${percentage})` })

        // Mini Window
        here.setMiniWindow({
            title: coinName,
            detail: "Low: " + lowPrice + " · High: " + hightPrice,
            accessory: {
                title: curPrice,
                detail: percentage
            }
        })

        // Dock
        here.setDock({
            title: curPrice,
            detail: percentage
        })
    })
    .catch((err) => {
        console.error("Error: " + err)
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})