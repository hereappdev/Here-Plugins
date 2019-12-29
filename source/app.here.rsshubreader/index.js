const _ = require("underscore")
const pref = require("pref")

function updateData() {
    const LIMIT = 20
    
    var apiName = ""
    var apiUrl = ""
    var apiParameter = ""
    
    here.setMiniWindow({ title: "Updating…" })
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
            detail: apiName + "(RSSHub)",
            popOvers: _.map(feed.items, (item, index) => {
                return {
                    title: `${index + 1}. ${item.title}`,
                    onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } }
                }
            })
        })
    })
    .catch((err) => {
        console.error("Error: " + err)
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})