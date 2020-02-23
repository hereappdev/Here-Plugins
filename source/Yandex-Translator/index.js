//請求位址
const translateAPI = "https://translate.yandex.net/api/v1.5/tr.json/translate"
let APIKey = "";
let quality;
let feedResult;
let popup = [];

//所需API
const net = require('net');
const pb = require('pasteboard');
const pr = require('pref');
const http = require('http');


let original = {};

function loadGUI() {
    let languageCode = pr.get("language");
    console.log("Got language code: " + languageCode);
    switch ( parseInt(languageCode)) {
        case 0:
            //英語
            console.log("English Loaded.");
            require("en-US.js");
            break;
        
        case 1:
            //簡中
            console.log("Chinese Simplified Loaded.");
            require("zh-CN.js");
            break;

        case 2:
            //繁中
            console.log("Chinese Traditional Loaded.");
            require("zh-TW.js");
            break;
    
        default:
            require("en-US.js");
            break;
    }
    
    
    let popup = [];
    original = getText();
    here.setMiniWindow({
        title: String(original['translate']['loading'])
    });

    if (pr.get("apiKey") == "") {
        //沒有金鑰
        console.log("No key detected, stop.");
        popup.push({
            title: String(original['error']['nokey'])
        })
        popup.push({
            title: String(original['error']['tutorial']),
            onClick: () => {
                here.openURL("https://blog.csdn.net/chuzhou8495/article/details/100776788");
            }
        })
        here.setMiniWindow({
            title: String(original['translate']['title']),
            detail: String(original['translate']['detail']),
            popOvers: popup
        });
        return;
    } else {
        APIKey = pr.get("apiKey");
    }
    popup.push({
        title: String(original['languages']['english']),
        onClick: () => {
            translate(pb.getText(), 0);
        }
    })
    popup.push({
        title: String(original['languages']['japanese']),
        onClick: () => {
            translate(pb.getText(), 1);
        }
    });
    popup.push({
        title: String(original['languages']['french']),
        onClick: () => {
            translate(pb.getText(), 2);
        }
    });
    popup.push({
        title: String(original['languages']['german']),
        onClick: () => {
            translate(pb.getText(), 3);
        }
    });
    popup.push({
        title: String(original['languages']['russian']),
        onClick: () => {
            translate(pb.getText(), 4);
        }
    });
    popup.push({
        title: String(original['languages']['chinese']),
        onClick: () => {
            translate(pb.getText(), 5);
        }
    });
    
    here.setMiniWindow({
        title: String(original['translate']['title']),
        detail: String(original['translate']['detail']),
        popOvers: popup
    });
}
//Functions
function translate(text, language) {
    console.log("Receeive: "+ text + " with code " + String(language) );
    if (!net.isReachable()) {
        //無網路
        here.postNotification("hud", "No Connection", original['error']['nonetwork']);
        console.log("No Connection, stop.");
        return;
    }
    if (text == undefined || text == "" ) {
        console.log("Empty text, stop.");
        here.postNotification("hud", "Error - Yandex Translator", "No text detected.");
    } else if (language == undefined) {
        console.error("No Languages?");
    } else {
        here.postNotification("hud", original['translate']['translating'], );
        let targetLanguage;
        let result;
        let targetLanguageList = {
            0: "en",
            1: "ja",
            2: "fr",
            3: "de",
            4: "ru",
            5: "zh"
        };
        if ( language < 0 || language > 5 ) {
            targetLanguage = "en";
        } else {
            targetLanguage = targetLanguageList[language];
        }
        console.log("Translating text `" + text + "` to " + targetLanguageList[language] );
        let actualAddr = translateAPI + "?key=" + APIKey + "&text=" + encodeURIComponent(text) + "&lang=" + targetLanguage ;
        console.log("API address: " + actualAddr);
        http.get(actualAddr, (err, response) => {
            console.log(err);
            console.log(response);
            result = response.data;
            if (result['code'] == 401 && result['message'] == "API key is invalid") {
                //非法API Key
                console.log("Invaild key, stop.");
                here.postNotification("system", "Error - Yandex Translation", String(original['error']['keyerror']));
                return;
            } else {
                console.log("Got " + String(result['text'][0]) );
                pb.setText(String(result['text'][0]));
                here.postNotification("system", "Result", String(result['text'][0]));
                here.postNotification("hud", original['translate']['copyResult'], );
            }
            
        })
    }
}

pb.on("change" , () => {

})

here.onLoad(() => {
    console.log("Yandex Translate Loaded.");
    loadGUI();
    console.log("GUI Loaded.");
})