const _ = require("underscore")
const http = require("http")
const pasteboard = require('pasteboard')
const net = require("net")

var isIp = function (){
    var regexp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;     
    return function(value){
        var valid = regexp.test(value);
        if(!valid){//首先必须是 xxx.xxx.xxx.xxx 类型的数字，如果不是，返回false
            return false;
        }
        return value.split('.').every(function(num){
            //切割开来，每个都做对比，可以为0，可以小于等于255，但是不可以0开头的俩位数
            //只要有一个不符合就返回false
            if(num.length > 1 && num.charAt(0) === '0'){
                //大于1位的，开头都不可以是‘0’
                return false;
            }else if(parseInt(num , 10) > 255){
                //大于255的不能通过
                return false;
            }
            return true;
        });
    }
}();

function updateData() {
    let aIP = ""

    http.get("https://api.ip.sb/jsonip")
    .then((response) => {
        if (response.data && response.data.ip) {
            console.log(response.data.ip)
            aIP = response.data.ip
            return http.get({
                url: "http://ip.taobao.com/service/getIpInfo.php?ip=" + aIP,
                allowHTTPRequest: true
            })
        }
        return Promise.reject("Can't get current IP.")
    })
    .then(function(response) {
        // console.debug("getIP---" + data)
        const json = response.data
        console.log(json)
        const ipInfo = json.data
        // Mini Window
        here.setMiniWindow({
            title: "IP Address: " + aIP,
            detail: ipInfo.country + "/" + ipInfo.city + "/" + ipInfo.isp + " (Click to check IP from clipboard)",
            onClick: () => {
                var getIP = pasteboard.getText()

                if (isIp(getIP)) {
                    showIP(getIP)
                } else {
                    showIP(myIP)
                    here.hudNotification("Copy an IP Address to Check!")
                }
            }
        })
    })
    .catch((error) => {
        console.error(JSON.stringify(error))
        here.setMiniWindow({ title: "Failed to get IP address.", detail: "Copy IP firstly" })
    })
}

here.onLoad(() => {
    updateData()
})

net.onChange((type) => {
    console.log("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})