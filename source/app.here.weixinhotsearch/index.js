const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10
    
    here.setMiniWindow({ title: "Updating…" })

    http.get('https://weixin.sogou.com/pcindex/pc/web/web.js')
    .then(function(response) {
        const json = response.data
        if (json == undefined) {
            return here.returnErrror("Invalid data.")
        }
    
        let entryList = json.topwords
        if (entryList.length <= 1) {
            return here.returnErrror("Entrylist is empty.")
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        entryList = _.map(entryList, (entry) => {
            entry.word = entry.word
            return entry
        })
    
        const topFeed = entryList[0]
        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("https://news.sogou.com/news?query=" + topFeed.word) },
            title: topFeed.word,
            detail: "微信热搜",
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: (index + 1) + ". " + entry.word,
                    onClick: () => { here.openURL("https://news.sogou.com/news?query=" + entry.word) },
                }
            })
        })
    })
    .catch(function(error) {
        console.error(`Error: ${error}`)
        here.returnErrror(error)
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000);
})