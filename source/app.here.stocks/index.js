const _ = require("underscore")
const http = require("http")
const pref = require("pref")

function updateData() {
    var stockCode = "AAPL"
    var stockName = "Apple Inc."

    here.setMiniWindow({ title: "Updating…" })

    const json = pref.all()
    if (json == undefined) {
        console.log("No prefs found.")
    }
    
    if (json["stockCode"] != undefined) {
        stockCode = json["stockCode"]
    }
    if (json["stockName"] != undefined) {
        stockName = json["stockName"]
    }

    http.request(`https://query1.finance.yahoo.com/v8/finance/chart/${stockCode}`)
    .then((response) => {
        const json = response.data
        if (json == undefined) {
            console.error("JSON result undefined")
            return
        }

        console.verbose(json)
        const result = json.chart.result[0].meta
        const curPrice = result.regularMarketPrice.toFixed(2) + ""
        const prevPrice = result.chartPreviousClose
        const diff = ((curPrice - prevPrice) / prevPrice * 100).toFixed(2)
        // const secondaryTextColor = (diff < 0) ? "#27ae60" : "#e74c3c"
        const percentage = ((diff < 0) ? "" + diff : "+" + diff) + "%"

        // Menu Bar
        here.setMenuBar({ title: `${stockName} ${curPrice} (${percentage})` })

        // Mini Window
        here.setMiniWindow({
            title: stockName,
            detail: percentage,
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