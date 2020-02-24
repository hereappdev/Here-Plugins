const _ = require("lodash")
const cache = require('cache')
const hotkey = require('hotkey')
const net = require("net")
const pref = require("pref")

const {getPostId, getUnreadFeeds} = require('./sspai.js')
const {getUpdateFrequency, getFetchArticleNum, isDebugMode, isUnreadNotifyOpen, getDebugHotkey, debug} = require('./tool.js')

function updateData() {
    debug("开始更新数据", true)

    const LIMIT = getFetchArticleNum()
    debug(`[Read PREF] 更新文章数:${LIMIT}`)

    here.setMiniWindow({ title: "Fetching…" })
    here.parseRSSFeed('https://rsshub.app/sspai/matrix')
    .then((feed) => {
        //basic check
        if (feed.items.length <= 0) {
            return here.setMiniWindow({ title: "No item found." })
        }
        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }

        //init read list cache
        let cachedPostIds = cache.get('readIds');
        if (cachedPostIds == undefined) {
            debug("🚀 已读列表初始化缓存")
            cache.set('readIds', []);
        } else {
            cachedPostIds = JSON.parse(cachedPostIds);
            const checkUnreadFeedsNum = getUnreadFeeds(feed.items, cachedPostIds).length

            //unread notify
            if (checkUnreadFeedsNum > 0 && isUnreadNotifyOpen()) {
                //when in debug mode, system notifications will be conflicted
                //delay the unread notification for seconds later
                _.delay((unreadNum) => {
                    here.systemNotification("【少数派有新的文章更新啦】", `未读数 ${checkUnreadFeedsNum}`)
                }, isDebugMode() ? 5000 : 1000);
            }
        }

        // render component
        let renderComponent = () => {
            let readIds = JSON.parse(cache.get('readIds'));
            debug("cachedIDs:" + JSON.stringify(readIds))

            let unreadFeeds = getUnreadFeeds(feed.items, readIds)
            let topFeed = _.head(unreadFeeds)

            debug(`topFeed: ${topFeed != undefined ? topFeed.title : ""}`)

            here.setMiniWindow({
                onClick: () => {
                    if (topFeed != undefined && topFeed.link != undefined)  { here.openURL(topFeed.link) }
                },
                title: topFeed == undefined ? '暂无最新文章' : `${isDebugMode() ? "🐞" : ""}${topFeed.title}`,
                detail: "少数派文章更新",
                accessory: {
                    badge: unreadFeeds.length + ""
                },
                popOvers: _.map(unreadFeeds,(item, index) => {
                    return {
                        title: isDebugMode() ? `${index + 1}. ${item.title} PID:${getPostId(item.link)}` : `${index + 1}. ${item.title}`,
                        onClick: () => {
                            if (item.link != undefined) {
                                let postId = getPostId(item.link)
                                //filter cached postId
                                if (_.indexOf(readIds, postId) == -1) {
                                    debug(`cache postId:${postId}`)
                                    readIds.push(postId)
                                    debug(JSON.stringify(readIds))
                                    cache.set('readIds', readIds);
                                } else {
                                    debug(`cacheExists:${postId} skip`)
                                }

                                if (!isDebugMode()) {
                                    here.openURL(item.link)
                                }
                            }
                        },
                    }
                })
            })

            // menu bar component display
            here.setMenuBar({
              title: `SSPAI 未读数(${unreadFeeds.length})`
            })

            //dock component display
            here.setDock({
                title: unreadFeeds.length.toString(),
                detail: "少数派更新"
            })
        }

        debug("Render component start...")
        renderComponent()

        //rerender component display, partial render is not supported for now
        here.onPopOverDisappear(() => {
            debug("onPopOverDisappear")
            debug("____Rerender component start")
            renderComponent()
        })
    })
    .catch((error) => {
        console.error(`Error: ${JSON.stringify(error)}`)
        //TODO interrupt retry ，api not supported
        here.setMiniWindow({ title: "Fetching Failed..." })
    })
}

function initDebugHotKey() {
    //ensure debug switch was initialized closed on every onLoad
    cache.set('debug-hotkey-switch', 0)

    let hotkeySetting = getDebugHotkey();
    if (hotkeySetting == "") return

    debug(`[Read PREF] Hotkey: ${hotkeySetting}`)

    if (!hotkey.assignable(hotkeySetting.split("+"))) {
        here.systemNotification(`【🐞DEBUG热键{${hotkeySetting}} 已绑定其他快捷键】`, "请重新设定或者清空绑定")
        return
    }

    let bindResult = hotkey.bind(hotkeySetting.split("+"), () => {
        debug('|DEBUG_MODE CHANGED|', false, true)
        debug(`Before: ${cache.get('debug-hotkey-switch')}`)
        //Toggle Debug hotkey, implement use a simple cache switch
        const debugSwitch = cache.get('debug-hotkey-switch')
        const identifier = here.pluginIdentifier()
        if (debugSwitch != undefined && _.toSafeInteger(debugSwitch) == 1) {
            here.systemNotification("【🐞DEBUG模式】", `当前 ${identifier} 已关闭 DEBUG 模式`)
            cache.set('debug-hotkey-switch', 0)
            debug('After: 0')
        } else {
        here.systemNotification("【🐞DEBUG模式】", `当前 ${identifier} 处于 DEBUG 模式
1. 每次重启或者 reload，缓存会清空
2. 帖子标题增加 POST_ID 方便追溯
`)
            cache.removeAll()
            //ensure debug switch exists
            cache.set('debug-hotkey-switch', 1)
            debug('After: 1')
        }
        //rerender
        debug('Rerender component start')
        updateData()
    })

    debug(`Debug hotkey bindResult: ${bindResult}`)
}


/**
 * onLoad will be called in below scenes
 * - restart here
 * - save plugin pref
 * - reload plugin in Debug Console
 */
here.onLoad(() => {
    debug("========== Plugin Debug Info Start ==========", false, true)
    debug("↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓", false, true)
    //main flow
    debug(`init debug feature`, true)
    initDebugHotKey();
    debug(`[DEBUG_MODE] ${isDebugMode()}`)

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



