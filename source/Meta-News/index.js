/*
 * This file is part of app.here.meta-news.
 *
 * Copyright (c) 2020 Lifesign.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

const _ = require("lodash")
const net = require("net")
const pref = require("pref")

function updateData() {

    const LIMIT = 20
    const identifier = here.pluginIdentifier()
    const DEFAULT_FOH_FEED = 'https://rsshub.app/github/repos/FriendsOfHere'

    let feedUrl = ""
    let pluginName = ""
    let pluginIdentifier = ""
    let miniDetail = ""
    let pluginDescription = ""
    let logoPath = ""

    here.setMiniWindow({ title: "Updating…" })

    const prefs = pref.all()
    if (prefs == undefined) {
        here.setMiniWindow({ title: "Get Pref Failed..." })
        return Promise.reject()
    }

    if (prefs.feedUrl == undefined || prefs.feedUrl == "") {
        here.systemNotification(`${identifier} 配置错误`, "Feed 地址不能为空")
        here.setMiniWindow({ title: "Get FeedUrl Failed..." })
        return Promise.reject()
    }
    if (prefs.pluginName == undefined || prefs.pluginName == "") {
        here.systemNotification(`${identifier} 配置错误`, "插件名不能为空")
        here.setMiniWindow({ title: "Get PluginName Failed..." })
        return Promise.reject()
    }
    if (prefs.pluginIdentifier == undefined || prefs.pluginIdentifier == "") {
        here.systemNotification(`${identifier} 配置错误`, "插件标识不能为空")
        here.setMiniWindow({ title: "Get PluginIdentifier Failed..." })
        return Promise.reject()
    }

    feedUrl = prefs.feedUrl
    pluginName = prefs.pluginName
    pluginIdentifier = prefs.pluginIdentifier
    pluginDescription = prefs.pluginDescription
    miniDetail = prefs.miniDetail
    logoPath = prefs.logoPath

    here.parseRSSFeed(feedUrl)
    .then((feed) => {
        if (feed.items.length <= 0) {
            return here.setMiniWindow({ title: "No item found." })
        }

        if (feed.items.length > LIMIT) {
            feed.items = feed.items.slice(0, LIMIT)
        }

        const topFeed = feed.items[0]
        const defaultDesktop = '/Users/$(whoami)/Desktop'
        const defaultDestDir = `/Users/$(whoami)/Desktop/${pluginIdentifier}`

        let popOvers = [
            {title: "💖 欢迎关注 FriendsOfHere 🥰",
            onClick: () => {here.openURL("https://github.com/FriendsOfHere")}},
            {title: feedUrl == DEFAULT_FOH_FEED ? "以下是 FOH 正在维护的项目，欢迎 Star ⭐️" : "↓以下为预览的新闻内容↓",
            onClick: () => {here.openURL("https://github.com/FriendsOfHere")}}
        ]
        popOvers = popOvers.concat(_.map(feed.items, (item, index) => {
            return {
                title: `${index + 1}. ${item.title}`,
                onClick: () => { if (item.link != undefined)  { here.openURL(item.link) } }
            }
        }))

        // Mini Window
        here.setMiniWindow({
            onClick: () => {
                console.log(`
                    ======== Meta Config =======
                    ==== FeedUrl: ${feedUrl} ====
                    ==== PluginName: ${pluginName} ====
                    ==== Identifier: ${pluginIdentifier} ====
                    ==== PluginDescription: ${pluginDescription} ====
                    ==== MiniDetail: ${miniDetail} ====
                `)

                //cp template && replace && zip to .hereplugin
                /**
                 * replace origin sed version with perl, due to BSD、GNU version of sed on mac
                 * sed -i '' 's/{{pluginName}}/${pluginName}/g' ${defaultDestDir}/config.json;
                   sed -i '' 's/{{pluginIdentifier}}/${pluginIdentifier}/g' ${defaultDestDir}/config.json;
                   sed -i '' 's/{{pluginDescription}}/${pluginDescription}/g' ${defaultDestDir}/config.json;
                   sed -i '' 's|{{rssFeedUrl}}|${feedUrl}|g' ${defaultDestDir}/index.js;
                   sed -i '' 's/{{miniDetail}}/${miniDetail}/g' ${defaultDestDir}/index.js;
                 */
                here.exec(`
mkdir -p ${defaultDestDir};
/bin/cp -rf ./template/* ${defaultDestDir};
[ -f ${logoPath} ] && cp ${logoPath} ${defaultDestDir}/icon.png;
perl -pi -e 's/{{pluginName}}/${pluginName}/g' ${defaultDestDir}/config.json;
perl -pi -e 's/{{pluginIdentifier}}/${pluginIdentifier}/g' ${defaultDestDir}/config.json;
perl -pi -e 's/{{pluginDescription}}/${pluginDescription}/g' ${defaultDestDir}/config.json;
perl -pi -e 's|{{rssFeedUrl}}|${feedUrl}|g' ${defaultDestDir}/index.js;
perl -pi -e 's/{{miniDetail}}/${miniDetail}/g' ${defaultDestDir}/index.js;
cd ${defaultDesktop} && zip -rm ${pluginIdentifier}.zip ${pluginIdentifier} -x *.DS_Store* && cd -;
mv ${defaultDesktop}/${pluginIdentifier}.zip ${defaultDesktop}/${pluginIdentifier}.hereplugin;
`)
                .then((output) => {
                    console.log(output)
                    //generate notification
                    here.systemNotification(`${pluginName} 生成成功🤗`, `插件已生成至桌面，双击 ${pluginIdentifier}.hereplugin 安装吧`)
                    //open desktop
                    _.delay(() => {
                        here.exec('open ~/Desktop', (output) => {console.log(output)})
                    }, 1000);

                })
            },
            title: `👓生成标题预览->${topFeed.title}`,
            detail: "点击此处将在桌面生成插件，移动可查看 popup 效果",
            popOvers: popOvers
        })
    })
    .catch((error) => {
        console.error("Error: " + JSON.stringify(error))
    })
}

here.onLoad(() => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 2*3600*1000)
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})
