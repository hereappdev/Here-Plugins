const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10
    
    here.setMiniWindow({ title: "Updating…" })
    
    http.request({
        url: "http://meirishici.com/getQuote",
        allowHTTPRequest: true
    })
    .then(function(response) {
        
        const json = response.data
        const entryList = json
    
        console.verbose(JSON.stringify(entryList))
    
        if (entryList == undefined) {
            return here.returnErrror("Invalid data.")
        }
    
        if (entryList.length <= 0) {
            return here.returnErrror("Entrylist is empty.")
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        // Menu Bar
        here.setMenuBar({ title: entryList.quote.replace(/\r\n/g,"，") })
    
        console.log(entryList.author.intro)
        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("http://meirishici.com") },
            title: entryList.quote.replace(/\r\n/g,"，"),
            detail: entryList.author.intro.replace(/\r\n/g,"，"),
            popOvers: [
                { title: entryList.poetry.content },
                { title: entryList.author.intro }
            ]
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
    setInterval(updateData, 12*3600*1000);
})