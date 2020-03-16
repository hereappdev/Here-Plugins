const _ = require("underscore")
const net = require("net")

function updateData() {
    var apiUrl = "https://www.solidot.org/index.rss"
    
    here.miniWindow.set({ title: "Updating…" })
    console.debug("api: " + apiUrl)
    
    here.parseRSSFeed(apiUrl)
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.miniWindow.set({ title: "No item found." })
        }
    
        const topFeed = feed.items[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: "Solidot: 奇客的资讯，重要的东西"
        })
        here.popover.set(_.map(feed.items, (item, index) => {
            return {
                title: item.title,
                onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } }
            }
        }))
    })
    .catch((error) => {
        console.error("Error: " + JSON.stringify(error))
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})