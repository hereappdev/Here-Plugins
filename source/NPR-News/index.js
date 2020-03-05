const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })

    // API: https://www.npr.org/rss/rss.php
    // API Speedy: https://apispeedy.com/npr/

    http.request("https://www.npr.org/feeds/1001/feed.json")
    .then((response) => {
        var feed = response.data
        console.log(JSON.stringify(feed))

        if (response.data.length <= 0) {
            return here.setMiniWindow({ title: "No item found." })
        }

        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }

        const topFeed = feed.items[0]
        
        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: "NPR News",
            popOvers: _.map(feed.items, (item, index) => {
                return {
                    title: `${index + 1}. ${item.title}`,
                    onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } },
                    accessory: {
                        title: "",
                        imageURL: item.image,
                        imageCornerRadius: 4
                    }
                }
            })
        })
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