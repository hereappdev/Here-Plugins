
//聲明所需API
const http = require('http');
const net = require('net');
const pr = require('pref');

let serverLocat;
let timeCD;
//const serverLocat = "tunnels.xygu.cn:20000"
const queryApi = "https://api.mcsrvstat.us/2/"
const searchAPI = "https://namemc.com/search?q="
let URL;
let playerPopup = []
let reqBody;
let pingTest;
let playerList;
let onlinePlayerQuantity;
let maxinumPlayers;
let motd;
let version;

function updateSite() {
    playerPopup = []
    here.setMiniWindow({
        title: "Checking..."
    })
    here.setMenuBar({
        title: "Checking..."
    })
    if (URL == queryApi) {
        // 沒有地址
        console.log("No address, stop.")
        here.setMiniWindow({
            title: "Minecraft Server Check - No Address",
            detail: "Please check your input."
        })
        here.setMenuBar({
            title: "No Connection"
        })
        return 0;
    }
    if (!net.isReachable) {
        console.log("Network connection is currently offline, stop.")
        here.setMiniWindow({
            title: "Minecraft Server Check - No Connection",
            detail: "Please check your Internet connection and wait for reload."
        })
        here.setMenuBar({
            title: "🌍❌"
        })
    } else {
        console.log(URL)
        http.get(URL, (err, response) => {
            //console.log(JSON.stringify(response.data))
            if (response.data != undefined) {
                reqBody = response.data
                pingTest = reqBody['debug']['ping']
                if (pingTest) {
                    motd = reqBody['motd']['clean']
                    console.log("got motd: "+ motd)
                    onlinePlayerQuantity = reqBody['players']['online']
                    maxinumPlayers = reqBody['players']['max']
                    version = reqBody['version']
                    playerList = reqBody['players']['list']
                    playerPopup.push({
                        title: "Online Players (click on their name to search)"
                    })
                    if (playerList != undefined) {
                        //玩家列表可被檢測到
                        playerList.forEach(addPlayerList)
                        here.setMiniWindow({
                            title: "Minecraft Server Check",
                            detail: String(motd),
                            accessory: {
                                title: onlinePlayerQuantity + "/" + maxinumPlayers,
                                detail: "Currently on " + String(version)
                            },
                            popOvers: playerPopup
                        })
                    } else {
                        if (!pingTest) {
                            here.setMiniWindow({
                                title: "Minecraft Server Check",
                                detail: "Server is offline",
                                accessory: {
                                    title: "OFFLINE"
                                }
                            })
                        } else {
                            if(onlinePlayerQuantity == 0){
                                playerPopup.push({
                                    title: "There are currently no player online."
                                })
                            } else {
                                playerPopup.push({
                                    title: "There are plenty of players online,"
                                })
                                playerPopup.push({
                                    title: "we cannot get them from the API now."
                                })
                            }
                            here.setMiniWindow({
                                title: "Minecraft Server Check",
                                detail: String(motd),
                                accessory: {
                                    title: onlinePlayerQuantity + "/" + maxinumPlayers,
                                    detail: "Currently on " + String(version)
                                },
                                popOvers: playerPopup
                            })
                        }
                    }
                    here.setMenuBar({
                        title: "🌍✅ " + String(onlinePlayerQuantity) + "/" + String(maxinumPlayers)
                    })
                } else {
                    console.log("Ping Test returns false, maybe the server is not online now.")
                    here.setMiniWindow({
                        title: "Minecraft Server Check",
                        detail: "Server is offline",
                        accessory: {
                            title: "OFFLINE"
                        }
                    })
                    here.setMenuBar({
                        title: "🌍❌??"
                    })
                }
            }
        })
    }
}

here.onLoad(() => {
    serverLocat = pr.get("srvLocat")
    URL = queryApi + serverLocat
    //console.log(serverLocat)
    timeCD = parseInt(pr.get("coolDown")) * 1000
    updateSite()
    setInterval(updateSite,60 * 1000)
})

function addPlayerList(playerName, playerList){
    playerPopup.push({
        title: String(playerName),
        onClick: function () {
            here.openURL(searchAPI + playerName)
        }
    })
}