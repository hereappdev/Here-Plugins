const http = require("http")
const pref = require("pref")
const fs = require("fs")
const pasteboard = require("pasteboard")
const crypto = require("crypto")
const cache = require("cache")

function _hashInputOutput(hashFunc, name, input, output) {
    return new Promise((res, rej) => {
        const str = input
        const hash = output
        const result = hashFunc(str)
        // console.log(`crypto.md5("here.app") result: ${result}`)
        if (result == hash) {
            return res({
                ret: true,
                msg: `${name}("here.app")`
            })
        } else {
            return res({
                ret: false,
                msg: `${name}("here.app")`
            })
        }
    })
}

function _someCallbackFunc(param, callback) {
    if (callback) {
        if (param == "error") {
            callback(param, undefined)
        } else {
            callback(undefined, true)
        }
    }
}

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


    // http ========== START
    testGet() {
        return new Promise((res, rej) => {
            var str = ""

            http.get("https://www.baidu.com/")
            .then((response) => {
                console.log("response:", response.statusCode)
                if (response.statusCode > 400) {
                    return Promise.reject(`http.get("https://www.baidu.com/"): status code - ${response.statusCode}`)

                } else {
                    str += 'http.get("https://www.baidu.com")\n'
                    return new Promise((aRes, aRej) => {
                        http.get("http://www.baidu.com")
                        .then(() => {
                            // 不允许 http
                            aRes(false)
                        })
                        .catch((err) => {
                            if (err.includes("No http request allowed by default")) {
                                aRes(true)
                            }
                        })
                    })
                }
            })
            .then((result) => {
                console.log("result:", result)
                if (result) {
                    str += 'http.get("http://www.baidu.com") not allowed\n'

                    return http.get({
                        url: "http://www.baidu.com",
                        allowHTTPRequest: true
                    })

                } else {
                    return Promise.reject("http not allowed")
                }
            })
            .then((response) => {
                if (response.statusCode < 400) {
                    str += 'http.get({ url: "http://www.baidu.com", allowHTTPRequest: true })'
                    res({
                        ret: true,
                        msg: str
                    })
                } else {
                    res({ ret: false, msg: "Test failed." })
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
                    console.log("json.data: ", json.data)
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
                    console.log("json.data: ", json.data)
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

    // pasteboard ========== START
    testSetGetText() {
        return new Promise((res, rej) => {
            let num = Math.random() * 100000
            pasteboard.setText(`${num}`)
            let pNum = Number(pasteboard.getText())
            if (num == pNum) {
                res({
                    ret: true,
                    msg: `pasteboard.setText(${num})\npasteboard.getText(${pNum})`
                })
            } else {
                res({
                    ret: false,
                    msg: "Failed to set/get text in pasteboard"
                })
            }
        })
    }
    
    testOnChage() {
        return new Promise((res, rej) => {
            let count = pasteboard.changeCount()
            let timeout = setTimeout(() => {
                res({
                    ret: false,
                    msg: `failed to listen on change event`
                })
            }, 2000)

            pasteboard.on("change", () => {
                let newCount = pasteboard.changeCount()
                clearTimeout(timeout)

                res({
                    ret: true,
                    msg: `pasteboard.on("change") newCount: ${newCount}`
                })
            })

            let num = Math.random() * 100000
            pasteboard.setText(`${num}`)
        })
    }
    // pasteboard ========== END

    // crypto ========== START
    testMD5() { return _hashInputOutput(crypto.md5, "crypto.md5", "here.app", "f83eab4c3f29db33f6789e4270a26fdf") }
    testSHA1() { return _hashInputOutput(crypto.sha1, "crypto.sha1", "here.app", "f4e076bd83e38ee45d25d4ff08e9611812bd3615") }
    testSHA224() { return _hashInputOutput(crypto.sha224, "crypto.sha224", "here.app", "f0782fc5ebd7abcf52119514de5723e418c986cf9ea752f98bfee8e3") }
    testSHA256() { return _hashInputOutput(crypto.sha256, "crypto.sha256", "here.app", "3d0ab8b8752d61af9d34ca51396c09686730a92b6a5ab44582d5b7feff0a7668") }
    testSHA384() { return _hashInputOutput(crypto.sha384, "crypto.sha384", "here.app", "ebe05004d00ef2e28a38815cd822cb73da9d3dd91885fc812220fd0d0ea34b6dca7230c991e84b5809869d84b3020bf8") }
    testSHA512() { return _hashInputOutput(crypto.sha512, "crypto.sha512", "here.app", "5ba597e54b1abd5d7fe56a4529218767dbeb0a05c54160c8d6251d5cc26c6b5cad652acf9f65603778334294720495679cb0ac244d47dca497a1180e9c12582b") }
    testBase64Encode() { return _hashInputOutput(crypto.base64Encode, "crypto.base64Encode", "here.app", "aGVyZS5hcHA=") }
    testBase64Decode() { return _hashInputOutput(crypto.base64Decode, "crypto.base64Decode", "aGVyZS5hcHA=", "here.app") }
    // crypto ========== END

    // cache ========== START
    testCache() {
        return new Promise((res, rej) => {
            // removeAll()
            cache.removeAll()

            // set
            let msg = ""
            const num = Math.random() * 1000000
            const aVal = `${num}`
            if (cache.set("test-key", aVal) == false) {
                return res({ ret: false, msg: `cache.set("test-key", ${aVal})` })
            }

            msg += `cache.set("test-key", ${aVal})\n`

            // get
            const aCachedVal = cache.get("test-key")
            if (aCachedVal != aVal) {
                return res({ ret: false, msg: `cache.get("test-key")` })
            }

            msg += `cache.get("test-key")\n`

            // all
            const arr = cache.all()
            console.log("arr: ", JSON.stringify(arr))
            if (arr.length != 1) {
                return res({ ret: false, msg: `cache.all()` })
            }
            if (arr[0].key != "test-key" || arr[0].value != aVal || arr[0].type != typeof(aVal)) {
                return res({ ret: false, msg: `cache.all()` })
            }

            msg += `cache.all()`
            return res({ ret: true, msg: msg })
        })
    }
    // cache ========== END

    // here ========== START
    testHereFormatBytes() {
        return new Promise((res, rej) => {
            let fmt1 = here.formatBytes(1024) // 1 KB
            console.log(fmt1)
            return res({ ret: (fmt1 == "1 KB"), msg: "here.formatBytes(1024)" })
        })
    }
    testHerePluginIdentifier() {
        return new Promise((res, rej) => {
            return res({ 
                ret: (here.pluginIdentifier() == "app.here.test"),
                msg: "here.pluginIdentifier()" 
            })
        })
    }
    // testHereOpenURL() {
    //     return new Promise((res, rej) => {
    //         return res({ 
    //             ret: (here.openURL("http://baidu.com") == true),
    //             msg: `here.openURL("http://baidu.com")`
    //         })
    //     })
    // }
    testRGB() {
        return new Promise((res, rej) => {
            console.log(rgb(255, 255, 255))
            return res({ 
                ret: (rgb(255, 255, 255) == "ffffff"),
                msg: `rgb(255, 255, 255)`
            })
        })
    }
    testRGBA() {
        return new Promise((res, rej) => {
            const color = rgba(255, 255, 255, 0.1)
            return res({ 
                ret: (color.hex == "ffffff" && color.alpha == 0.1),
                msg: `rgba(255, 255, 255, 0.1)`
            })
        })
    }

    testPromisify() {
        return new Promise((res, rej) => {
            let asyncFunc = here.promisify(_someCallbackFunc)
            asyncFunc("error")
            .catch((err) => {
                return res({ 
                    ret: true,
                    msg: `here.promisify(_someCallbackFunc)`
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
                console.log("stdOut:", stdOut)
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
            .then((result) => {
                ret += ret += 'here.exec(">&2 echo "test stdErr output"")'
                res({
                    ret: result,
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
    testAppleScript() {
        return new Promise((res, rej) => {
            let ret = ""
            // callback
            here.appleScript('beep')
            .then(() => {
                res({ ret: true, msg: `here.appleScript('beep').then(() => {})` })
            })
            .catch((err) => {
                console.error(`here.appleScript('beep'): ${err}`)
                res({ ret: false, msg: `here.appleScript('beep').then(() => {})` })
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
    testSetMiniWindow() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.miniWindow.set({ title: `${date}` })
            .then(() => {
                res({
                    ret: true,
                    msg: `promise: here.miniWindow.set({ title: ${date} }).then(() => {})`
                })
            })
        })
    }
    testSetMiniWindowCB() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.miniWindow.set({ title: `${date}` }, () => {
                res({
                    ret: true,
                    msg: `callback: here.miniWindow.set({ title: ${date} }, (err) => {})`
                })
            })
        })
    }
    testSetMenuBar() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.menuBar.set({ title: `${date}` })
            .then(() => {
                res({
                    ret: true,
                    msg: `promise: here.menuBar.set({ title: ${date} })`
                })
            })
        })
    }
    testSetMenuBarCB() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.menuBar.set({ title: `${date}` }, (err) => {
                res({
                    ret: true,
                    msg: `callback: here.menuBar.set({ title: ${date} })`
                })
            })
        })
    }
    testSetDock() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.dock.set({ title: `${date}` })
            .then(() => {
                res({
                    ret: true,
                    msg: `promise: here.dock.set({ title: ${date} })`
                })
            })
        })
    }
    testSetDockCB() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.dock.set({ title: `${date}` }, (err) => {
                res({
                    ret: true,
                    msg: `callback: here.dock.set({ title: ${date} })`
                })
            })
        })
    }
    testPopoverSet() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.popover.set([{ title: `${date}` }])
            .then(() => {
                res({
                    ret: true,
                    msg: `promise: here.popover.set([{ title: ${date} }])`
                })
            })
        })
    }
    testPopoverSetCB() {
        return new Promise((res, rej) => {
            let date = new Date()
            here.popover.set([{ title: `${date}` }], (err) => {
                res({
                    ret: true,
                    msg: `callback: here.popover.set([{ title: ${date} }])`
                })
            })
        })
    }
    testPreferencesConfig() {
        return new Promise((res, rej) => {
            let prefs = pref.all()
            let msg = ''
            let ret = true

            console.log("prefs: ", prefs["textType"])
            if (typeof(prefs["textType"]) == 'string',
                prefs["textType"] == "textType") {
                msg += `prefs["textType"]: ${prefs["textType"]}\n`
            } else {
                msg = `prefs["textType"] ${prefs["textType"]}`
                ret = false
            }

            if (typeof(prefs["checkboxType"]) == 'boolean') {
                msg += `prefs["checkboxType"]: ${prefs["checkboxType"]}\n`

            } else {
                msg = `prefs["checkboxType"] ${prefs["checkboxType"]}`
                ret = false
            }

            if (typeof(prefs["popupType"]) == 'number') {
                msg += `prefs["popupType"]: ${prefs["popupType"]}\n`

            } else {
                msg = `prefs["popupType"] ${prefs["popupType"]}`
                ret = false
            }
            res({ ret: ret, msg: msg })
        })
    }
    // here ========== END
}