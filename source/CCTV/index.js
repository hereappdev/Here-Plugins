const http = require("http")
const net = require("net")
const pref = require("pref")

const TvList = 'cctv1,cctv2,cctv3,cctv4,cctv5,cctv6,cctv7,cctv8,cctv9,cctv10,cctv11,cctv12,cctv13,cctv14,cctv15,cctv5plus,cctv17,cctveurope,cctvamerica'.split(',')
const selectTv = TvList[pref.get("tvName")];

console.log("tvName: " + selectTv)
console.log("skipOld: " + pref.get("skipOld"))

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function callHere(tvList) {
    let popList = []
    let popIndex = 0;
    for (var i = 0; i < tvList['list'].length; i++) {
        let entry = tvList['list'][i]
        let tvStartTime = new Date(entry.startTime * 1000)
        let tvEndTime = new Date(entry.endTime * 1000)
        if(pref.get("skipOld") == 'true' && new Date() > tvEndTime) {
            // console.log("跳过已结束项目：" + entry.title)
            // console.log(new Date(entry.endTime * 1000).Format("yyyy-MM-dd hh:mm"))
            continue
        }
        popIndex++

        popList.push({
            title: popIndex + ". " + entry.title,
            accessory: {
                title: entry.title == tvList['isLive'] ? "正在播放" : entry.showTime,
            }
        });
    }

    here.setMenuBar({ title: tvList['channelName'] })
    // here.setDock({
    //     title: tvList['isLive'],
    //     detail: tvList['channelName']
    // })

    let liveSt = "";
    if(tvList['isLive'] == null || tvList['liveSt'] == 0) {
        tvList['isLive'] = tvList['list'][0].title
        liveSt = new Date(tvList['list'][0].startTime * 1000).Format("hh:mm")
    } else {
        liveSt = new Date(tvList['liveSt'] * 1000).Format("hh:mm")
    }

    // Mini Window
    here.setMiniWindow({
        title: tvList['isLive'],
        detail: tvList['channelName'],
        accessory: {
            title: liveSt,
            detail: "开始时间"
        },
        popOvers: popList
    })
}

function updateData() {
    here.setMiniWindow({ title: "Updating…" })
    let currentDate = new Date().Format("yyyyMMdd");

    http.get(`https://api.cntv.cn/epg/getEpgInfoByChannelNew?c=${selectTv}&serviceId=tvcctv&d=${currentDate}&t=json`)
    .then(function(response) {
        if (response.data == undefined) {
            return here.setMiniWindow({ title: "Invalid data." })
        }

        let tvList = response.data['data'][selectTv];
        // console.log(JSON.stringify(tvList))

        if (tvList['list'].length <= 0) {
            return here.setMiniWindow({ title: "Entrylist is empty." })
        }

        callHere(tvList)
    })
    .catch(function(error) {
        console.error(`Error: ${JSON.stringify(error)}`)
        return here.setMiniWindow({ title: JSON.stringify(error) })
    })
}

here.onLoad(() => {
    updateData()
    setInterval(updateData, 5*60*1000);
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})