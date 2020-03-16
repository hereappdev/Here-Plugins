const _ = require("underscore")
const pref = require("pref")
const net = require("net")

function updateData() {
    const LIMIT = 20
    
    var apiName = ""
    var apiUrl = ""
    var apiParameter = ""
    
    here.miniWindow.set({ title: "Updating…" })
    const prefs = pref.all()
    
    if (prefs == undefined) {
        console.error(apiUrl)
        return Promise.reject()
    }

    if (prefs.apiName == undefined) {
        console.debug("apiName is undefined.")
        return Promise.reject()
    }
    
    apiName = prefs.apiName

    if (prefs.apiUrl == undefined) {
        console.debug("apiUrl is undefined.")
        return Promise.reject()
    }
    
    apiUrl = prefs.apiUrl

    if (prefs.apiParameter == undefined) {
        console.error("apiUrl is undefined.")
        return Promise.reject()
    }

    apiParameter = prefs.apiParameter

    console.debug("api: " + apiUrl + apiParameter)
    
    here.parseRSSFeed(apiUrl + apiParameter)
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.miniWindow.set({ title: "No item found." })
        }
    
        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }
    
        const topFeed = feed.items[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: apiName + "(RSSHub)"
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