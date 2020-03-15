const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10

    here.miniWindow.set({ title: "Updating…" })

    // via 腾讯新闻 API：https://news.qq.com/zt2020/page/feiyan.htm
    http.request("https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5")
    .then(function(response) {
        const json = response.data
        // console.log(JSON.stringify(response.data.data))
        const entryList = JSON.parse(json.data)

        const chinaTotal = entryList.chinaTotal
        const lastUpdateTime = entryList.lastUpdateTime
        const areaTree = entryList.areaTree[0].children

        for (var key in entryList.areaTree) {
            if(key == 0) 
                areaTree.unshift(entryList.areaTree[key])
            else
                areaTree.push(entryList.areaTree[key])
        }
        

        if (response == undefined) {
            console.error("Invalid API data.")
            return here.miniWindow.set({ title: "Invalid API data." })
        }

        if (entryList.length <= 0) {
            console.error("API data is empty.")
            return here.miniWindow.set({ title: "API data is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        const topFeed = chinaTotal

        // console.log(JSON.stringify(topFeed))

        // Menu Bar
        here.menuBar.set({
            detail: "China",
            title: topFeed.confirm.toString()
        })

        // Dock
        here.dock.set({
            title: topFeed.confirm.toString(),
            detail: "全国确诊"
        })

        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.alt != undefined)  { here.openURL("https://news.qq.com/zt2020/page/feiyan.htm") } },
            title: "疑似" + topFeed.suspect + " / 治愈" + topFeed.heal + " / 死亡" + topFeed.dead,
            detail: "新型冠状病毒疫情追踪",
            accessory: {
                        title: "确诊" + topFeed.confirm,
                        detail: lastUpdateTime
                    }
        })

        // 直接调用 Webview
        here.setPopover({
            type: "webView",
            data: {
                url: "https://news.qq.com/zt2020/page/feiyan.htm",
                width: 375,
                height: 550,
                backgroundColor: "#ffffff",
                foregroundColor: rgba(0, 0, 0, 0.5),
                hideStatusBar: false
            }
        })

        // here.popover.set(_.map(areaTree, (entry, index) => {
        //     return {
        //         title: entry.name,
        //         accessory: {
        //             title: entry.total.confirm.toString()
        //         },
        //     }
        // }))

    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        return here.miniWindow.set({ title: JSON.stringify(error) })
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