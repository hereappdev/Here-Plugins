const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 100

    console.log("Featching app store data…")
    here.miniWindow.set({ title: "Updating…" })
    // API https://rss.itunes.apple.com/en-us
    http.get("https://rss.itunes.apple.com/api/v1/cn/ios-apps/top-free/all/100/explicit.json")
    .then(function(response) {
        const json = response.data
        let entryList = json.feed.results
        // console.log(JSON.stringify(entryList));
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }

        // console.log("Updated. Entrylist count: ", entryList.length)
        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        entryList = _.map(entryList, (entry, key) => {
            entry.title = entry["name"]
            entry.url = entry["artistUrl"]
            entry.appIcon = entry["artworkUrl100"].replace("200x2002bb.png","100x100bb.png")
            entry.rank = entry["genres"][0]["name"]
            return entry
        })

        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: "No.1 " + topFeed.title,
            detail: "App Store Top Grossing(CN)",
            accessory: {
                badge: topFeed.rank 
            }
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: (index + 1) + ". " + entry.title,
                accessory: {
                    title: entry.rank,
                    imageURL: entry.appIcon,
                    imageCornerRadius: 4
                },
                onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
            }
        }))
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}

here.on('load', () => {
    updateData()
    // Update every 12 hours
    setInterval(updateData, 12*3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})