const _ = require("underscore")
const http = require("http")
const net = require("net")
const pref = require("pref")

const jsonPref = pref.all()

function getDate(api) {

    const LIMIT = 25

    let entryList = []
    return http.get(api)
        .then(function (response) {

            const json = response.data
            entryList = json.feed.results

            if (entryList == undefined) {
                return here.miniWindow.set({ title: "Invalid data." })
            }

            if (entryList.length <= 0) {
                return here.miniWindow.set({ title: "Entrylist is empty." })
            }

            if (entryList.length > LIMIT) {
                entryList = entryList.slice(0, LIMIT)
            }
            // console.log(entryList)
            entryList = _.map(entryList, (entry, key) => {

                // console.log(entry["name"])
                entry.title = entry["name"]
                entry.url = entry["artistUrl"]
                entry.appIcon = entry["artworkUrl100"].replace("200x2002bb.png","100x100bb.png")
                entry.rank = entry["genres"][0]["name"]
                return entry
            })

            return entryList
        })
}

function updateData() {

    here.miniWindow.set({ title: "Updating…" })

    Promise.all([
        getDate("https://rss.itunes.apple.com/api/v1/" + jsonPref["countryCode"] + "/ios-apps/top-free/all/25/explicit.json"),
        getDate("https://rss.itunes.apple.com/api/v1/" + jsonPref["countryCode"] + "/ios-apps/top-grossing/all/25/explicit.json"),
        getDate("https://rss.itunes.apple.com/api/v1/" + jsonPref["countryCode"] + "/ios-apps/top-paid/all/25/explicit.json")
    ]).then(function (values) {

        const topFeed = values[0][0]

        // console.log(topFeed)
        
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.url != undefined) { here.openURL(topFeed.url) } },
            title: "No.1 " + topFeed.title,
            detail: "App Store(" + jsonPref["countryCode"].toUpperCase() +")",
            accessory: {
                badge: topFeed.rank 
            }
        })

        here.menuBar.set({
            title: ""
        })

        let tabs = [
            {
                title: "免费榜",
                data: _.map(values[0], (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: (index + 1) + ". " + entry.title,
                        accessory: {
                            title: entry.rank,
                            imageURL: entry.appIcon,
                            imageCornerRadius: 4
                        },
                        onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } }
                    }
                })
            },
            {
                title: "畅销榜",
                data: _.map(values[1], (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: (index + 1) + ". " + entry.title,
                        accessory: {
                            title: entry.rank,
                            imageURL: entry.appIcon,
                            imageCornerRadius: 4
                        },
                        onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } }
                    }
                })
            },
            {
                title: "付费榜",
                data: _.map(values[2], (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: (index + 1) + ". " + entry.title,
                        accessory: {
                            title: entry.rank,
                            imageURL: entry.appIcon,
                            imageCornerRadius: 4
                        },
                        onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } }
                    }
                })
            }
        ]

        here.popover.set(tabs)

    });
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 12 * 3600 * 1000)
})

net.on('change', (type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})