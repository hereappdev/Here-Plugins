const _ = require("underscore")
const http = require("http")

function updateData() {
    // 最多显示 20 列
    const LIMIT = 20

    here.setMiniWindow({ title: "Updating…" })

    http.get("https://bangumi.bilibili.com/web_api/timeline_global")
    .then(function(response) {
        const json = response.data
        const entryList = json.result[6]
        // 获取当前的新番，接口里第 6 天
        // console.verbose(entryList[6])

        if (entryList == undefined) {
            return here.returnErrror("Invalid data.")
        }

        if (entryList.length <= 0) {
            return here.returnErrror("Entrylist is empty.")
        }

        // 日期显示星期
        const today = new Date();
        const feedYear = today.getFullYear();
        const feedMon = today.getMonth() + 1;
        const feedDate = today.getDate();
        const feedDay = today.getDay();
        const weekday = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        const feedWeek = weekday[feedDay];
        
        // 去掉接口中繁体字的奇数条目
        function delTraditionalChinese(arr) {  
            var temp = [],  
                tempLen = 0;  
            for (var i = 0, len = arr.length; i < len; i++) {  
                if (i % 2 == 0) {  
                    temp[tempLen++] = arr[i];  
                }  
            }  
            return temp;  
        }  

        console.verbose(entryList)

        // Mini Window
        here.setMiniWindow({
            onClick: () => { here.openURL("https://www.bilibili.com/anime/timeline/") },
            title: "bilibili每日新番时间表",
            detail: feedYear + "-" + feedMon + "-" + feedDate + "日" + "(" + feedWeek + ")",
            accessory: {
                        title: entryList.seasons.length + "部"
                    },
                    // delTraditionalChinese(entryList.seasons)
            popOvers: _.map(entryList.seasons, (entry, index) => {
                
                return {
                    title: entry.title + " · " + entry.pub_index,
                    accessory: {
                        title: '🕓' + entry.pub_time
                    },
                    onClick: () => { here.openURL("https://www.bilibili.com/bangumi/play/ss" + entry.season_id) },
                }
            })
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