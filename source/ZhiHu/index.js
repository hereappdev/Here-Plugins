const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.miniWindow.set({ title: "Updating…" })
    http.get(`https://www.zhihu.com/api/v3/explore/guest/feeds?limit=${LIMIT}`)
    .then(function(response) {
        const json = response.data
        let entryList = json.data
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        entryList = _.map(entryList, (entry) => {
            entry.title = entry["target"]["question"]["title"]
            entry.url = entry["target"]["question"]["url"].replace("api.zhihu.com/questions", "www.zhihu.com/question")
            return entry
        })
    
        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: topFeed.title,
            detail: "知乎热榜"
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: (index + 1) + ". " + entry.title,
                onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
            }
        }))

        // Menu Bar
        here.menuBar.set({
            title: topFeed.title.substring(0,24) + "..."
        })
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000)
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})