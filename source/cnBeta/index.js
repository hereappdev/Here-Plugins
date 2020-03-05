const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10
    let indexNum = 0

    here.setMiniWindow({ title: "Updating…" })
    http.get("https://m.cnbeta.com/touch/default/timeline.json?page=1")
    .then(function(response) {
        const json = response.data
        let entryList = json.result.list
        console.debug(entryList);
        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }

        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        entryList = _.map(entryList, (entry) => {
            entry.title = entry["title"]
            entry.url = entry["url_show"]
            return entry
        })

        
        let adNum = 0 // 计算广告条数
        let popOvers = _.map(entryList, (entry, index) => {
            if(entry.title.indexOf("<span") !=-1 ){
                adNum++;
            }else{
                indexNum++;
            }
            console.log(adNum + "-" + indexNum)
            return {
                title: indexNum + ". " + entry.title,
                accessory: {
                    title: "",
                    imageURL: entry.thumb,
                    imageCornerRadius: 4
                },
                onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
            }
        })

        const topFeed = entryList[adNum]
        let popOversNew = popOvers.splice(adNum, popOvers.length)

        console.log(popOversNew)

        // Mini Window
        here.setMiniWindow({
            title: topFeed.title,
            detail: "cnBeta",
            popOvers: popOversNew
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