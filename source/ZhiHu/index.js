const _ = require("underscore")
const http = require("http")
const net = require("net")

function getDate(api, LIMIT = 15) {

    let entryList = []
    return http.get("https://www.zhihu.com/api/v3/feed/topstory/hot-lists/" + api + "?limit=" + LIMIT)
        .then(function (response) {

            const json = response.data
            entryList = json.data

            if (entryList == undefined) {
                return here.miniWindow.set({ title: "Invalid data." })
            }

            if (entryList.length <= 0) {
                return here.miniWindow.set({ title: "Entrylist is empty." })
            }

            if (entryList.length > LIMIT) {
                entryList = entryList.slice(0, LIMIT)
            }

            entryList = Object.keys(entryList).map(function (key, index) {
                entryList[key].title = entryList[key]["target"]["title"]
                entryList[key].url = entryList[key]["target"]["url"].replace("api.zhihu.com/questions", "www.zhihu.com/question")
                return entryList
            });

            return entryList
        })
}

function updateData() {

    here.miniWindow.set({ title: "Updating…" })

    Promise.all([
        getDate("total"),
        getDate("science"),
        getDate("digital"),
        getDate("sport"),
        getDate("fashion"),
        getDate("film")
    ]).then(function (values) {

        const topFeed = values[0][0][0]["target"]

        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + topFeed["id"]) } },
            title: topFeed["title"],
            detail: "知乎热榜"
        })

        here.menuBar.set({
            title: topFeed["title"]
        })

        let tabs = [
            {
                title: "全部",
                data: _.map(values[0], (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
                    }
                })
            },
            {
                title: "科学",
                data: _.map(values[1], (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
                    }
                })
            },
            {
                title: "数码",
                data: _.map(values[2], (entry, index) => {
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
                    }
                })
            },
            {
                title: "体育",
                data: _.map(values[3], (entry, index) => {
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
                    }
                })
            },
            {
                title: "时尚",
                data: _.map(values[4], (entry, index) => {
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
                    }
                })
            },
            {
                title: "影视",
                data: _.map(values[5], (entry, index) => {
                    return {
                        title: entry[index]["target"]["title"],
                        onClick: () => { if (entry[index]["target"]["id"] != undefined) { here.openURL("https://www.zhihu.com/question/" + entry[index]["target"]["id"]) } }
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
    setInterval(updateData, 2 * 3600 * 1000)
})

net.on('change', (type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})