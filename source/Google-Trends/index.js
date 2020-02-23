const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10
    
    here.setMiniWindow({ title: "Updating…" })

    // API: https://trends.google.com/trends/api/topdailytrends?tz=-480&geo=US
    // API Speedy: https://apispeedy.com/googletrends/

    http.request('https://apispeedy.com/googletrends/')
    .then(function(response) {
    
        // console.debug(`data: ${data}`)
        let data = response.data
        data = data.replace(")]}',\n", "")
        const json = JSON.parse(data)
        // console.debug(`json: ${json}`)
    
        if (json == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }
    
        let entryList = json.default.trendingSearches
        // console.debug(entryList)
        if (entryList.length <= 1) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
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
        here.setMiniWindow({
            onClick: () => { if (topFeed.url != undefined)  { here.openURL(topFeed.url) } },
            title: topFeed.title,
            detail: "Google Trends",
            accessory: {
                title: '🔥' + topFeed.formattedTraffic 
            },
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.title,
                    accessory: {
                        title: '🔥' + entry.formattedTraffic
                    },
                    onClick: () => { if (entry.url != undefined)  { here.openURL(entry.url) } },
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