const http = require("http")
const pref = require("pref")

class Test {
    // global
    testRequire(module) {
        module = "underscore"
        return new Promise((res, rej) => {
            if (module == undefined) {
                rej("module undefined")
                return
            }
            // 测试去重
            require(module)
            require(module)
        
            // 测试引用
            if (_ == undefined) {
                rej("Failed to import")
                return
            }

            res("testRequire")
        })
    }

    // here ========== START
    testGetPreferences() {
        return new Promise((res, rej) => {
            // callback
            let allPrefs = pref.all()
            if (allPrefs == undefined) {
                rej("It's undefined.")
                return
            }

            if (typeof(allPrefs) != "object") {
                rej("Not an object.")
                return
            }
            res("testGetPreferences")
        })
    }

    testExec() {
        return new Promise((res, rej) => {
            // callback
            here.exec("ls", (err, obj) => {
                if (err) {
                    rej(err)
                    return
                }

                if (obj.includes("Test.js")) {
                    res("testExec")
                } else {
                    rej("Can't find Test.js")
                }
            })
        })
    }

    testPostNotification() {
        return new Promise((res, rej) => {
            here.postNotification("system", "Test Title", "Test Content")
            here.postNotification("hud", "Test Title", "Test Content")
            res("testPostNotification")
        })
    }

    testParseRssFeed() {
        return new Promise((res, rej) => {
            here.parseRSSFeed("http://rss.cnn.com/rss/cnn_topstories.rss")
            .then((obj) => {
                if (typeof(obj) != "object") {
                    rej("Not an object.")
                    return
                }
                res("testParseRssFeed")    
            })
            .catch((err) => {
                rej(err)
            })
        })
    }
    // here ========== END

    // http ========== START
    testGet() {
        return new Promise((res, rej) => {
            http.get("https://www.baidu.com/")
            .then((response) => {
                console.log("response:", response.statusCode)
                if (response.statusCode > 400) {
                    rej(`Status code: ${response.statusCode}`)
                } else {
                    res("testGet")  
                }
            })
            .catch((err) => {
                rej(err)
            })
        })
    }
    // http ========== END
}