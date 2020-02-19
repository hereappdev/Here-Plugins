const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })

    http.request("https://api.douban.com/v2/movie/in_theaters?apikey=0b2bdeda43b5688921839c8ecb20399b&city=%E5%8C%97%E4%BA%AC&start=0&count=10&client=&udid=")
    .then(function(response) {
        const json = response.data
        const entryList = json.subjects
        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }

        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        const topFeed = entryList[0]

        // console.debug(JSON.stringify(topFeed))

        // Menu Bar
        here.setMenuBar({ title: topFeed.title })

        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.alt != undefined)  { here.openURL(topFeed.alt) } },
            title: "🎬《" + topFeed.title + "》",
            detail: "上映" + topFeed["mainland_pubdate"],
            accessory: {
                        badge: topFeed["rating"]["average"].toString()
                    },
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.title,
                    accessory: {
                        title: entry.rating.average + "️️️⭐️"
                    },
                    onClick: () => { if (entry.alt != undefined)  { here.openURL(entry.alt) } },
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