const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })
    http.request("https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=10&category=all")
    .then(function(response) {
        console.verbose(`data: ${response.data}`)
        const json = response.data
        const d = json.d
        if (d == undefined) {
            return here.returnErrror("Invalid data.")
        }
    
        let entryList = d.entrylist
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
            onClick: () => { if (topFeed.originalUrl != undefined)  { here.openURL(topFeed.originalUrl) } },
            title: topFeed.title,
            detail: "掘金热文",
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.title,
                    onClick: () => { if (entry.originalUrl != undefined)  { here.openURL(entry.originalUrl) } },
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