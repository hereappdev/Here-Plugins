const _ = require("underscore")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })

    here.parseRSSFeed("http://rss.cnn.com/rss/cnn_topstories.rss")
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.returnError("No item found.")
        }

        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }

        const topFeed = feed.items[0]

        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: "CNN News",
            // detail: topFeed.description.replace(/<(?:.|\n)*?>/gm, '').replace(/(^\s*)|(\s*$)/g, ""),
            popOvers: _.map(feed.items, (item, index) => {
                return {
                    title: `${index + 1}. ${item.title}`,
                    onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } },
                }
            })
        })
    })
    .catch((error) => {
        console.error(`Error: ${error}`)
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})