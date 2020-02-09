const _ = require("underscore")
const http = require("http")
const pref = require("pref")
const net = require("net")

function updateData() {

    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })
    
    var currencySymbols = "USD" 
    var displaySymbols = "CNY" 
    var currencyValue = 0 
    
    const json = pref.all()
    if (json == undefined) {
        console.Debug("No prefs found.")
    }

    // console.debug(`prefs: ${JSON.stringify(prefs)}`)

    currencySymbols = json.currencySymbols.toUpperCase()
    displaySymbols = json.displaySymbols.toUpperCase()

    here.setMiniWindow({ title: "Updating…" })
    http.request("https://openexchangerates.org/api/latest.json?app_id=48c5e363909e4a2bba48937790c365e7&show_alternative=1%27")
    .then(function(response) {
    
        const json = response.data
        const entryList = json.rates
    
        currencyValue = entryList[currencySymbols]
    
        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
        here.setMiniWindow({
            title: displaySymbols + "⇌" + currencySymbols,
            detail: currencySymbols + "⇌" + displaySymbols + ": " + (entryList[displaySymbols] / currencyValue).toFixed(3).toString(),
            accessory: {
                title: (currencyValue / entryList[displaySymbols]).toFixed(3).toString()
            },
            popOvers: _.map(entryList, (entry, key) => {
                return {
                    title: key.toString(),
                    accessory: {
                        title: (currencyValue/entry).toFixed(3).toString()
                    },
                }
            })
        })
    })
}

here.onLoad(() => {
    updateData()
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})