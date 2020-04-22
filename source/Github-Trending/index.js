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

            const entryList = response.data

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

            return entryList
        })
}

function updateData() {

    here.miniWindow.set({ title: "Updating…" })

    Promise.all([
        getDate("https://github-trending-api.now.sh/repositories?since=today"),
        getDate("https://github-trending-api.now.sh/repositories?since=weekly"),
        getDate("https://github-trending-api.now.sh/repositories?since=monthly")
    ]).then(function (values) {
        // console.log(values)
        const topFeed = values[0][0]

        // console.log(topFeed)
        
        // Mini Window
        here.miniWindow.set({
            title: topFeed.author + "/" + topFeed.name,
            detail: "Github Trending",
            accessory: { title: (Number(topFeed.stars) / 1000).toFixed(1) + "k⭐️" },
            onClick: () => { here.openURL(topFeed.url) }
        })

        here.menuBar.set({
            title: ""
        })

        let popovers = []

        values.forEach(function(element, index){
            popovers[index] = _.map(values[index], (feed, index) => {
                return {
                    title: feed.author + "/" + feed.name,
                    // detail: feed.description,
                    accessory: {
                        title: (Number(feed.stars) / 1000).toFixed(1) + "k⭐️"
                    },
                    onClick: () => { here.openURL(feed.url) }
                }
            })
            popovers[index].push({
                title: "View All…",
                onClick: () => { _.each(values[index], (feed) => { here.openURL(feed.url) }) }
            })
        });
        

        let tabs = [
            {
                title: "Today",
                data: popovers[0]
            },
            {
                title: "Weekly",
                data: popovers[1]
            },
            {
                title: "Monthly",
                data: popovers[2]
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