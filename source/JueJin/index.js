const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.miniWindow.set({ title: "Updating…" })
    http.request("https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&limit=10&category=all")
    .then(function(response) {
        console.verbose(`data: ${response.data}`)
        const json = response.data
        const d = json.d
        if (d == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        let entryList = d.entrylist
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }

        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.originalUrl != undefined)  { here.openURL(topFeed.originalUrl) } },
            title: topFeed.title,
            detail: "掘金热文"
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: entry.title,
                onClick: () => { if (entry.originalUrl != undefined)  { here.openURL(entry.originalUrl) } },
                accessory: {
                    title: "",
                    imageURL: entry.screenshot,
                    imageCornerRadius: 4
                }
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