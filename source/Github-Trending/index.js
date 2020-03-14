const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    here.miniWindow.set({ title: "Updating…" })

    http.request("https://github-trending-api.now.sh/repositories?since=weekly")
    .then(function(response) {
        let feeds = response.data
        if (feeds == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }

        if (feeds.length == 0) {
            return here.miniWindow.set({ title: "Empty result." })
        }

        const topFeed = feeds[0]

        let popovers = _.map(feeds, (feed, index) => {
            return {
                title: (index + 1) + ". " + feed.author + "/" + feed.name,
                // detail: feed.description,
                accessory: {
                    title: (Number(feed.stars) / 1000).toFixed(1) + "k⭐️"
                },
                onClick: () => { here.openURL(feed.url) }
            }
        })
        popovers.push({
            title: "View All…",
            onClick: () => { _.each(feeds, (feed) => { here.openURL(feed.url) }) }
        })

        here.miniWindow.set({
            title: topFeed.author + "/" + topFeed.name,
            detail: "Github Trending Weekly",
            accessory: { title: (Number(topFeed.stars) / 1000).toFixed(1) + "k⭐️" },
            onClick: () => { here.openURL(topFeed.url) }
        })
        here.popover.set(popovers)
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
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