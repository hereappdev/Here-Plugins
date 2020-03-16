const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    const LIMIT = 10
    
    here.miniWindow.set({ title: "Updating…" })
    
    http.request({
        url: "http://meirishici.com/getQuote",
        allowHTTPRequest: true
    })
    .then(function(response) {
        
        const json = response.data
        const entryList = json
    
        console.verbose(JSON.stringify(entryList))
    
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }
    
        // Menu Bar
        here.menuBar.set({ title: entryList.quote.replace(/\r\n/g,"，") })
        
        // console.log(entryList.author.intro)
        // Mini Window
        here.miniWindow.set({
            onClick: () => { here.openURL("http://meirishici.com/poetry/" + entryList.poetry.uuid) },
            title: entryList.quote.replace(/\r\n/g,"，"),
            detail: entryList.author.intro.replace(/\r\n/g,"，")
        })
        here.popover.set([
            { 
                onClick: () => { here.openURL("http://meirishici.com/poetry/" + entryList.poetry.uuid) },
                title: entryList.author.intro.replace(/\r\n/g,"，")
            },
            { 
                onClick: () => { here.openURL( entryList.author.wiki) },
                title: entryList.quote.replace(/\r\n/g,"，")
            }
        ])
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 12*3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})

