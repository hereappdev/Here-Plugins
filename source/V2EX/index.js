const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10
    
    here.setMiniWindow({ title: "Updating…" })
    http.get('https://www.v2ex.com/api/topics/hot.json')
    .then(function(response) {
        // console.verbose(JSON.stringify(response.data))
        const entryList = response.data
        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        const topFeed = entryList
        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed[0].url != undefined)  { here.openURL(topFeed[0].url) } },
            title: topFeed[0].title,
            detail: "V2EX",
            popOvers: _.map(entryList, (entry, index) => {
                console.log(JSON.stringify(entry.member.avatar_large))
                return {
                    title: (index + 1) + ". " + entry.title,
                    accessory: {
                        title: "",
                        imageURL: "http:" + entry.member.avatar_large,
                        imageCornerRadius: 4
                    },
                    onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
                }
            })
        })
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.setMiniWindow({ title: JSON.stringify(error) })
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