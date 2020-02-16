const pref = require("pref")
const _ = require("lodash")
const net = require("net")

function updateData() {
    const LIMIT = getFetchArticleNum()
    console.log("获取更新文章数:" + LIMIT)

    here.setMiniWindow({ title: "Fetching…" })
    here.parseRSSFeed('https://rsshub.app/sspai/matrix')
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.setMiniWindow({ title: "No item found." })
        }

        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }

        // console.log(JSON.stringify(feed.items[0]));

        const topFeed = feed.items[0]
        // Mini Window
        here.setMiniWindow({
            onClick: () => { if (topFeed.link != undefined)  { here.openURL(topFeed.link) } },
            title: topFeed.title,
            detail: "少数派文章更新",
            accessory: {
                badge: `${feed.items.length}`
            },
            popOvers: _.map(feed.items, (item, index) => {
                return {
                    title: `${index + 1}. ${item.title}`,
                    onClick: () => {
                        if (item.link != undefined) {
                            //TODO cache read item
                            here.openURL(item.link)
                        }
                    },
                }
            })
        })

        //dock TODO

        //menubar TODO
    })
    .catch((error) => {
        console.error(`Error: ${JSON.stringify(error)}`)
        //TODO 打断重试，暂时不支持
        here.setMiniWindow({ title: "Fetching Failed..." })
    })
}

function getUpdateFrequency() {
    const DEFAULT_MIN_FREQUENCY = 2
    const DEFAULT_MAX_FREQUENCY = 48

    let updateFenquency = _.toSafeInteger(pref.get("update-frequency"))
    if (!_.isNumber(updateFenquency) || updateFenquency <= 0 || updateFenquency > DEFAULT_MAX_FREQUENCY) {
        here.systemNotification("配置更新", "更新频率时间格式错误，将使用默认更新频率(" + DEFAULT_MIN_FREQUENCY +"h)")
        return DEFAULT_MIN_FREQUENCY
    }

    console.log("获取更新频率:" + updateFenquency + "h")
    return updateFenquency
}

function getFetchArticleNum() {
    const PAGE_MAP = [10, 15, 20]

    return PAGE_MAP[_.toSafeInteger(pref.get("article-num"))]
}

here.onLoad(() => {
    console.log("开始更新数据")
    updateData()
    setInterval(updateData, getUpdateFrequency() * 3600 * 1000);
})

let type = net.effectiveType;
net.onChange((currentType) => {
    console.log("Connection type changed from " + type + " to " + currentType);
    type = currentType;
    if (net.isReachable()) {
        console.log("网络恢复了，重新执行获取数据")
        updateData()
    }
})



