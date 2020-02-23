const http = require("http")
const pref = require("pref")
const fs = require("fs")

class Test {
    // global
    testRequire(module) {
        module = "underscore"
        return new Promise((res, rej) => {
            if (module == undefined) {
                res({
                    ret: false,
                    msg: "require(): module undefined"
                })
                return
            }
            // 测试去重
            require(module)
            require(module)
        
            // 测试引用
            res({
                ret: (_ != undefined),
                msg: "require()"
            })
        })
    }

    // here ========== START
    testGetPreferences() {
        return new Promise((res, rej) => {
            // callback
            let allPrefs = pref.all()
            if (allPrefs == undefined) {
                res({
                    ret: false,
                    msg: "pref.all(): allPrefs undefined"
                })
                return
            }

            if (typeof(allPrefs) != "object") {
                res({
                    ret: false,
                    msg: "pref.all(): Not an object."
                })
                return
            }
            res({
                ret: true,
                msg: "pref.all()"
            })
        })
    }

    testExec() {
        return new Promise((res, rej) => {
            let ret = ""
            // callback
            here.exec("ls")
            .then((stdOut) => {
                console.debug("stdOut:", stdOut)
                if (stdOut.includes("Test.js")) {
                    ret += 'here.exec("ls")\n'
                    return new Promise((aRes, aRej) => {
                        here.exec('>&2 echo "test stdErr output"')
                        .then((stdOut) => {
                            aRes(false)
                        })
                        .catch((stdErr) => {
                            aRes(true)
                        })
                    })

                } else {
                    return Promise.reject("Can't find Test.js")
                }
            })
            .then(() => {
                ret += ret += 'here.exec(">&2 echo "test stdErr output"")'
                res({
                    ret: true,
                    msg: ret
                })
            })
            .catch((err) => {
                res({
                    ret: false,
                    msg: `here.exec: err: ${err}`
                })
            })
        })
    }

    testPostNotification() {
        return new Promise((res, rej) => {
            here.postNotification("system", "Test Title", "Test Content")
            here.postNotification("hud", "Test Title", "Test Content")
            res({
                ret: true,
                msg: "here.postNotification()"
            })
        })
    }

    testParseRssFeed() {
        return new Promise((res, rej) => {
            here.parseRSSFeed("http://rss.cnn.com/rss/cnn_topstories.rss")
            .then((obj) => {
                if (typeof(obj) != "object") {
                    res({
                        ret: false,
                        msg: "here.parseRSSFeed(): Not an object."
                    })
                    return
                }

                res({
                    ret: true,
                    msg: "here.parseRSSFeed()"
                })
            })
            .catch((err) => {
                res({
                    ret: false,
                    msg: `here.parseRSSFeed(): ${err}`
                })
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
                    res({
                        ret: false,
                        msg: `http.get(): Status code: ${response.statusCode}`
                    })
                } else {
                    res({
                        ret: true,
                        msg: `http.get()`
                    })
                }
            })
            .catch((err) => {
                res({
                    ret: false,
                    msg: `http.get(): err: ${err}`
                })
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
                        res({
                            ret: true,
                            msg: ret
                        })
                        
                    } else {
                        return Promise.reject("Failed to parse json data.")
                    }

                } catch (error) {
                    return Promise.reject(error)
                }
            })
            .catch((error) => {
                res({
                    ret: false,
                    msg: `fs.readFile(): err: ${error}`
                })
            })
        })
    }
    // fs ========== END
}