const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.miniWindow.set({ title: "Updating…" })
    http.get(`https://api.producthunt.com/v1/posts?access_token=ebae349f8b26bb6a695e0aeda41075952142bb869db7c8a89fa7c48630d46988`)
    .then(function(response) {
        const json = response.data
        let entryList = json.posts
        // console.log(Object.entries(entryList))
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
            entry.title = entry["name"]
            entry.votes_count = entry["votes_count"]
            entry.url = entry["redirect_url"]
            return entry
        })

        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: topFeed.title,
            detail: "ProductHunt Hot",
            accessory: {
                title: '▲' + topFeed.votes_count 
            }
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: entry.title,
                accessory: {
                    title: '▲' + entry.votes_count 
                },
                onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } }
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