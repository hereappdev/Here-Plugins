const _ = require("underscore")
const http = require("http")
const net = require("net")
    
function strToVar(str) {
    var json = (new Function("return " + str))();
    return json;
}

function updateData() {
    here.miniWindow.set({ title: "Updating…" })
    http.get("https://hq.sinajs.cn/?list=gds_AUTD")
    .then(function(response) {
        let goldPrice
        let goldDate
    
        let data = response.data
        if (data != undefined) {
            goldPrice = data.toString().split("=\"")[1].split(",")[0]
            goldDate = data.toString().split("=\"")[1].split(",")[12] + " " + data.toString().split("=\"")[1].split(",")[6]
        }
    
        // console.log(goldPrice)
    
        // Menu Bar
        here.menuBar.set({
            title: goldPrice,
            detail: "Gold"
        })
    
        // Mini Window
        here.miniWindow.set({
            title: "黄金价格",
            detail: goldDate,
            accessory: {
                title: goldPrice
            }
        })
    
        // Dock
        here.dock.set({
            title: goldPrice,
            detail: "金价"
        })
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


net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})

here.setPopover({
    type: "webView",
    data: {
        url: "http://gu.sina.cn/m/?vt=4&cid=76613#/futures/month?symbol=AU0",
        width: 375,
        height: 500
    }
})