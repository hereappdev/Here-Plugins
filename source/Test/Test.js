const http = require("http")
const pref = require("pref")
const fs = require("fs")

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

            res("require()")
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
            res("pref.all()")
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
                    res("here.exec()")
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
            res("here.postNotification()")
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
                res("here.parseRSSFeed()")    
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
                console.debug("response:", response.statusCode)
                if (response.statusCode > 400) {
                    rej(`Status code: ${response.statusCode}`)
                } else {
                    res("http.get()")  
                }
            })
            .catch((err) => {
                rej(err)
            })
        })
    }
    // http ========== END

    // fs ========== START
    testReadFile() {
        return new Promise((res, rej) => {
            var ret = ""
            fs.readFile("./test.json")
            .then((data) => {
                try {
                    let json = JSON.parse(data)
                    console.debug("json.data: ", json.data)
                    if (json.data && json.data == 200) {
                        ret += 'fs.readFile("./test.json")\n'
                        return fs.readFile("./test.json", "utf8")
                        
                    } else {
                        return Promise.reject("Failed to parse json data.")
                    }

                } catch (error) {
                    return Promise.reject(error)
                }
            })
            .then((data) => {
                console.log("data length: ", data.length)
                if (typeof(data) != "string") {
                    return Promise.reject("Not string.")
                }

                try {
                    let json = JSON.parse(data)
                    console.debug("json.data: ", json.data)
                    if (json.data && json.data == 200 && json.unicode && json.unicode == "如是我聞。壹時佛在舍衛國。") {
                        ret += 'fs.readFile("./test.json", "utf8")'
                        res(ret)
                        
                    } else {
                        return Promise.reject("Failed to parse json data.")
                    }

                } catch (error) {
                    return Promise.reject(error)
                }
            })
            .catch((error) => {
                rej(error)
            })
        })
    }
    // fs ========== END
}