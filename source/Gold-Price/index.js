const _ = require("underscore")
const http = require("http")
const net = require("net")
    
function strToVar(str) {
    var json = (new Function("return " + str))();
    return json;
}

function updateData() {
    here.setMiniWindow({ title: "Updating…" })
    http.get("https://hq.sinajs.cn/?list=gds_AUTD")
    .then(function(response) {
        let goldPrice
        let goldDate
    
        let data = response.data
        if (data != undefined) {
            goldPrice = data.toString().split("=\"")[1].split(",")[0]
            goldDate = data.toString().split("=\"")[1].split(",")[12] + " " + data.toString().split("=\"")[1].split(",")[6]
        }
    
        // console.debug(goldPrice)
    
        // Menu Bar
        here.setMenuBar({ title: "金价:" + goldPrice })
    
        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("https://finance.sina.com.cn/nmetal/") },
            title: "黄金价格",
            detail: goldDate,
            accessory: {
                title: goldPrice
            }
        })
    
        // Dock
        here.setDock({
            title: goldPrice,
            detail: "金价"
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