const _ = require("underscore")
const pasteboard = require('pasteboard')
const http = require("http")

const LIMIT = 10
var wordIn, wordCurrent = pasteboard.getText()

function onClick() {
    http.request("https://api.shanbay.com/bdc/search/?word=" + wordCurrent)
    .then(function(response) {
        const json = response.data
        const entryList = json.data

        console.debug(entryList.definition)

        if (entryList == undefined) {
            return here.returnErrror("Invalid data.")
        }

        if (entryList.length <= 0) {
            return here.returnErrror("Entrylist is empty.")
        }

        if (entryList.length > LIMIT) {
            entryList = entryList.slice(0, LIMIT)
        }

        // Mini Window
        here.setMiniWindow({
            onClick: onClick,
            title: (entryList.definition == undefined) ? '没有查到内容' : entryList.definition,
            detail: (entryList.definition == undefined) ? "" : ("[英]: " + entryList.pronunciations.uk) + ((entryList.definition == undefined) ? "" : ("   [美]: " + entryList.pronunciations.us))
        })
    })
    .catch(function(error) {
        // console.error(`Error: ${error}`)
        here.returnErrror(error)
    })
}

// Display
function updateData(){
    wordCurrent = pasteboard.getText()
    if(wordIn != wordCurrent){
        // Mini Window
        here.setMiniWindow({
            title: "扇贝词典查询：" + wordCurrent,
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