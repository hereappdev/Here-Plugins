const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10
    
    here.miniWindow.set({ title: "Updating…" })

    // API: https://trends.google.com/trends/api/topdailytrends?tz=-480&geo=US
    // API Speedy: https://apispeedy.com/googletrends/

    http.request('https://apispeedy.com/googletrends/')
    .then(function(response) {
    
        // console.log(`data: ${data}`)
        let data = response.data
        data = data.replace(")]}',\n", "")
        const json = JSON.parse(data)
        // console.log(`json: ${json}`)
    
        if (json == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        let entryList = json.default.trendingSearches
        // console.log(entryList)
        if (entryList.length <= 1) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        entryList = _.map(entryList, (entry) => {
            entry.title = entry.title
            entry.formattedTraffic = entry.formattedTraffic
            entry.url = "https://trends.google.com" + entry.trendingSearchUrl
            return entry
        })
    
        const topFeed = entryList[1]
        // Mini Window
        here.miniWindow.set({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: topFeed.title,
            detail: "Google Trends",
            accessory: {
                title: '🔥' + topFeed.formattedTraffic 
            }
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: entry.title,
                accessory: {
                    title: '🔥' + entry.formattedTraffic
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