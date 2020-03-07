const _ = require("underscore")
const net = require("net")

function updateData() {
    const LIMIT = 10
    
    here.miniWindow.set({ title: "Updating…" })
    here.parseRSSFeed('https://www.qdaily.com/feed.xml')
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.miniWindow.set({ title: "No item found." })
        }
    
        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }
    
        feed.items = _.map(feed.items, (item) => { 
            item.title = item.title.trim()
            item.link = item.link.trim()
            return item
        })
    
        
        const topFeed = feed.items[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: "好奇心日报"
        })
        here.popover.set(_.map(feed.items, (item, index) => {
            return {
                title: `${index + 1}. ${item.title}`,
                onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } }
            }
        }))
    })
    .catch((error) => {
        console.error(`Error: ${JSON.stringify(error)}`)
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