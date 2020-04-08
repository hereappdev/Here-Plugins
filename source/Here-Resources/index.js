const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 100

    here.miniWindow.set({ title: "Updating…" })

    http.get("https://here.app/release-notes.json")
    .then(function(response) {
        const json = response.data
        let entryList = json.data
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        let nightlyLogs = []
        let betaLogs = []

        entryList = _.map(entryList, (entry, key) => {
            // console.log(entry["channel"] + entry["build"] + entry["logs"][0]["detail"])
            
            if(entry["channel"] == "beta"){
                betaLogs.push({
                    detail: "🔖 Version " + entry["version"] + " " + entry["build"] + " / "+ entry["date"]                })
                
                entry["logs"].forEach((item)=>{
                    betaLogs.push({
                        detail: item["detail"],
                        type: item["type"]
                    })
                })
            }else{
                nightlyLogs.push({
                    detail: "🔖 Version " + entry["version"] + " " + entry["build"] + " / "+ entry["date"]                })
                
                entry["logs"].forEach((item)=>{
                    nightlyLogs.push({
                        detail: item["detail"],
                        type: item["type"]
                    })
                })
            }
            
            return entry
        })

        let tabs = [
            {
                title: "Links",
                data: [
                    {
                        title: "🏠Homepage",
                        accessory: {
                            title: "here.app"
                        },
                        onClick: () => { here.openURL("https://here.app/") }
                    },
                    {
                        title: "📝Release Notes",
                        accessory: {
                            title: "here.app/release-notes"
                        },
                        onClick: () => { here.openURL("https://here.app/release-notes") }
                    },
                    {
                        title: "📦Plugin Store",
                        accessory: {
                            title: "hereappdev/Here-Plugins"
                        },
                        onClick: () => { here.openURL("https://github.com/hereappdev/Here-Plugins") }
                    },
                    {
                        title: "✈️Telegram Group",
                        accessory: {
                            title: "t.me/HereApp"
                        },
                        onClick: () => { here.openURL("https://t.me/HereApp") }
                    },
                    {
                        title: "💬WeChat Group",
                        accessory: {
                            title: ""
                        },
                        onClick: () => { here.openURL("https://res.here.app/img/wx.png") }
                    }
                ]
            },
            {
                title: "Beta Release",
                data: _.map(betaLogs, (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: ( entry["type"] != undefined ? "[" + entry["type"] + "] " : "" ) + entry["detail"]
                    }
                })
            },
            {
                title: "Nightly Release",
                data: _.map(nightlyLogs, (entry, index) => {
                    // console.log(entry[index]["target"]["title"])
                    return {
                        title: ( entry["type"] != undefined ? "[" + entry["type"] + "] " : "" ) + entry["detail"]
                    }
                })
            }
        ]

        // console.log(nightlyLogs)
        // console.log(betaLogs)
    
        const topFeed = entryList[0]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { here.openURL("https://here.app") },
            title: "Here Resources",
            detail: "Everything about Here"
        })
        here.menuBar.set({
            title: ""
        })

        here.popover.set(tabs)
        
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000)
})

net.on('change', (type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})