const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10
    
    here.setMiniWindow({ title: "Updating…" })
    http.get('https://www.v2ex.com/api/topics/hot.json')
    .then(function(response) {
        console.verbose(`data: ${response.data}`)
        const entryList = response.data
        if (entryList == undefined) {
            return here.returnErrror("Invalid data.")
        }
    
        if (entryList.length <= 0) {
            return here.returnErrror("Entrylist is empty.")
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        const topFeed = entryList[0]
        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: topFeed.title,
            detail: "V2EX",
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.title,
                    onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
                }
            })
        })
    })
    .catch(function(error) {
        console.error(`Error: ${error}`)
        here.returnErrror(error)
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})