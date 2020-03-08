const _ = require("underscore")
const pasteboard = require('pasteboard')
const http = require("http")

const LIMIT = 10
var wordIn, wordCurrent

function onClick() {
    wordCurrent = pasteboard.getText()
    http.request("https://api.shanbay.com/bdc/search/?word=" + wordCurrent)
    .then(function(response) {
        // console.log(response.data)

        const json = response.data
        const entryList = json.data

        console.debug(entryList.definition)

        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }

        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        // Mini Window
        here.miniWindow.set({
            onClick: onClick,
            title: (entryList.definition == undefined) ? '没有查到内容' : entryList.definition,
            detail: (entryList.definition == undefined) ? "" : ("[英]: " + entryList.pronunciations.uk) + ((entryList.definition == undefined) ? "" : ("   [美]: " + entryList.pronunciations.us))
        })
    })
    .catch(function(error) {
        // console.error(`Error: ${JSON.stringify(error)}`)
        here.miniWindow.set({ title: JSON.stringify(error) })
    })
}

// Display
function updateData(){
    wordCurrent = pasteboard.getText()
    if(wordIn != wordCurrent){
        // Mini Window
        here.miniWindow.set({
            title: "扇贝词典查询",
            detail: "点击立即查询剪切板中的单词",
            onClick: onClick
        })
    }
    
    // console.debug(wordIn + wordCurrent)
    wordIn = wordCurrent
}

here.onLoad(() => {
    updateData()

    // // Update every 2 hours
    // setInterval(updateData, 2000);

    // Observing pasteboard changes
    pasteboard.on('change', updateData)
})