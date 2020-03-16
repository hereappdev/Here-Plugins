//請求位址
const queryAPI = "https://horriblesubs.info/rss.php?res=";
let quality;
let feedResult;
let popup = [];

//所需API
const net = require('net');
const pb = require('pasteboard');
const pr = require('pref');

//Functions
function updateRSS(){
    popup = [];
    let resolution = 2;
    let resolutionText;
    let splitNum;

    // console.log("Got reso;ution code: " + pr.get("resolution"));
    switch ( parseInt(pr.get("resolution"))) {
        case 0:
            resolutionText = "sd"
            splitNum = 11;
            break;

        case 1:
            resolutionText = "720"
            splitNum = 11;
            break;

        case 2:
            resolutionText = "1080"
            splitNum = 12;
            break;
    
        default:
            resolutionText = "1080";
            splitNum = 12;
            break;
    }
    here.miniWindow.set({
        title: "HorribleSubs",
        detail: "Checking....."
    })
    if(!net.isReachable()){
        console.log("No Connection, Stop");
        here.miniWindow.set({
            title: "HorribleSubs",
            detail: "No Connection.",
            onClick: () => {
                updateRSS();
            },
            
        })
    } else {
        let rssURL = queryAPI + resolutionText;
        here.parseRSSFeed(rssURL).then((feed) => {
            // console.log("feed: " + feed);
            feedResult = feed.items;
            // console.log(feed.items.length);
            let rank = 0;

            feedResult.forEach(item => {
                let title = "";
                let titleName = "";
                let episode = 0;
                let link = "";
                let titleArray = [];

                rank += 1;
                title = String(item['title']);
                link = String(item['link'])
                // console.log("Got " + title + " on " + link);
                let d = "r3r3r3";
                title = title.substring(15, title.length - splitNum);
                // console.log(title);
                titleArray = title.split(" - ");
                titleName = titleArray.slice(0, titleArray.length - 1).join(" ")
                episode = parseInt(titleArray[titleArray.length - 1]);
                
                popup.push({
                    title: String(rank) + ". " + titleName,
                    accessory: {
                        title: "Ep. " + String(episode)
                    },
                    onClick: (() => {
                        pb.setText(link);
                        here.postNotification("system", "Copied", titleName + "(Episode " + String(episode) + ", in " + resolutionText + " format) has copied.")
                    })
                })
            });
            here.miniWindow.set({
                title: "HorribleSubs",
                detail: "So bad yet so good!",
                popOvers: popup
            })
        })
    }
}

here.on('load', () => {
    updateRSS();
    setInterval(updateRSS, 30 * 60 * 1000);
})