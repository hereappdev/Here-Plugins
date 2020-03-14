const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10
    
    here.miniWindow.set({ title: "Updating…" })

    http.get('https://weixin.sogou.com/pcindex/pc/web/web.js')
    .then(function(response) {
        const json = response.data
        if (json == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        let entryList = json.topwords
        if (entryList.length <= 1) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        entryList = _.map(entryList, (entry) => {
            entry.word = entry.word
            return entry
        })
    
        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { here.openURL("https://news.sogou.com/news?query=" + topFeed.word) },
            title: topFeed.word,
            detail: "微信热搜"
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: (index + 1) + ". " + entry.word,
                onClick: () => { here.openURL("https://news.sogou.com/news?query=" + entry.word) },
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
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})