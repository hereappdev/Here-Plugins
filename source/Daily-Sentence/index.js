const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })

    http.request({
        url: "https://sentence.iciba.com/index.php?c=dailysentence&m=getTodaySentence&_=1547327206019",
        allowHTTPRequest: true
    })
    .then(function(response) {
        
        const json = response.data
        const entryList = json

        // console.verbose(JSON.stringify(entryList))

        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }

        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        // Menu Bar
        here.setMenuBar({ title: entryList.content })

        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("http://m.iciba.com/daily.html?daily=1&sid=%EF%BF%BC") },
            title: entryList.content,
            detail: entryList.note,
            popOvers: [
                { title: entryList.content },
                { title: entryList.note }
            ]
        })
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.setMiniWindow({ title: JSON.stringify(error) })
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