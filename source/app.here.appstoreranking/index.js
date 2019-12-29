const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 100

    here.setMiniWindow({ title: "Updating…" })
    // API https://rss.itunes.apple.com/en-us
    http.get("https://rss.itunes.apple.com/api/v1/cn/ios-apps/top-free/all/100/explicit.json")
    .then(function(response) {
        const json = response.data
        let entryList = json.feed.results
        console.debug(JSON.stringify(entryList));
        if (entryList == undefined) {
            return here.returnErrror("Invalid data.")
        }

        if (entryList.length <= 0) {
            return here.returnErrror("Entrylist is empty.")
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        entryList = _.map(entryList, (entry, key) => {
            entry.title = entry["name"]
            entry.url = entry["artistUrl"]
            entry.rank = entry["genres"][0]["name"]
            return entry
        })

        const topFeed = entryList[0]
        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: "No.1 " + topFeed.title,
            detail: "App Store Top Grossing(CN)",
            accessory: {
                title: topFeed.rank 
            },
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.title,
                    accessory: {
                        title: entry.rank 
                    },
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
    // Update every 12 hours
    setInterval(updateData, 12*3600*1000);
})