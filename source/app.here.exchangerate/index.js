const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    here.setMiniWindow({ title: "Updating…" })
    
    http.get("https://stock.finance.sina.com.cn/forex/api/openapi.php/ForexService.getAllBankForex?ft=part")
    .then(function(response) {
    
        const json = response.data
        // boc 是中国人民银行的缩写
        const entryList = json.result.data.boc
    
        if (entryList == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }
    
        const topFeed = entryList[0]
    
        // Menu Bar
        here.setMenuBar({ title: "USD:" + topFeed.xh_buy })
    
        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("https://finance.sina.com.cn/forex/") },
            title: "人民币牌价 (" + topFeed.name + ")",
            detail: "中国人民银行",
            accessory: {
                        title: topFeed.xh_buy
                    },
            popOvers: _.map(entryList, (entry, index) => {
                return {
                    title: entry.name,
                    accessory: {
                        title: entry.xh_buy
                    },
                }
            })
        })
    
        // Dock
        here.setDock({
            title: topFeed.xh_buy,
            detail: "CNY/USD"
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