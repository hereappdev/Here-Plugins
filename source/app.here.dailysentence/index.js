const _ = require("underscore")
const http = require("http")

function updateData() {
    const LIMIT = 10

    here.setMiniWindow({ title: "Updating…" })

    http.request({
        url: "https://sentence.iciba.com/index.php?m=newGetdetail&c=dailysentence&date=1&_=1572198581802",
        allowHTTPRequest: true
    })
    .then(function(response) {
        
        const json = response.data
        const entryList = json

        console.verbose(entryList)

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
        here.setMenuBar({ title: entryList.content })

        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("http://m.iciba.com/daily.html?daily=1&sid=%EF%BF%BC") },
            title: entryList.content,
            detail: entryList.note,
            popOvers: [
                { title: entryList.content },
                { title: entryList.note }
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
    setInterval(updateData, 2*3600*1000);
})