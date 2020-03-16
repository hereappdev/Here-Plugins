const _ = require("underscore")
const http = require("http")
const net = require("net")

function updateData() {
    here.miniWindow.set({ title: "Updating…" })
    
    http.get("https://stock.finance.sina.com.cn/forex/api/openapi.php/ForexService.getAllBankForex?ft=part")
    .then(function(response) {
    
        const json = response.data
        // boc 是中国人民银行的缩写
        const entryList = json.result.data.boc
    
        if (entryList == undefined) {
            return here.miniWindow.set({ title: "Invalid data." })
        }
    
        if (entryList.length <= 0) {
            return here.miniWindow.set({ title: "Entrylist is empty." })
        }
    
        const topFeed = entryList[0]
    
        // Menu Bar
        here.menuBar.set({
            title: Number(topFeed.xh_buy).toFixed(2),
            detail: "CNY/USD"
        })
    
        // Mini Window
        here.miniWindow.set({
            onClick: () => { here.openURL("https://finance.sina.com.cn/forex/") },
            title: "人民币牌价 (" + topFeed.name + ")",
            detail: "中国人民银行",
            accessory: {
                        title: topFeed.xh_buy
                    }
        })
        here.popover.set(_.map(entryList, (entry, index) => {
            return {
                title: entry.name,
                accessory: {
                    title: entry.xh_buy
                },
            }
        }))
    
        // Dock
        here.dock.set({
            title: Number(topFeed.xh_buy).toFixed(2),
            detail: "￥/$"
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