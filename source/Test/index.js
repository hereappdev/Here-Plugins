const _ = require("underscore")

require('./Test.js')

// Promise.delay = function(t, val) {
//     return new Promise(resolve => {
//         setTimeout(resolve.bind(null, val), t);
//     });
// }

// Promise.raceAll = function(promises, timeoutTime, timeoutVal) {
//     return Promise.all(promises.map(p => {
//         return Promise.race([p, Promise.delay(timeoutTime, timeoutVal)])
//     }));
// }

function getAllFuncNames(module) {
    let funcs = []
    const names = Object.getOwnPropertyNames(module)
    console.verbose(names)
    for (let index = 0; index < names.length; index++) {
        const name = names[index]
        const obj = module[name]
        if (typeof(obj) == "function") {
            funcs.push(name)
        }
    }
    return funcs
}

function testRequire(module) {
    if (module == undefined) {
        return false
    }
    // 测试去重
    require(module)
    require(module)

    // 测试引用
    if (_ == undefined) {
        console.error("Failed to import underscore.")
        return false
    }
    return true
}

function coverage(module) {
    // Funcs to be tested
    let names = _.map(getAllFuncNames(module), (n) => { return n.toLowerCase() })

    // The unit test funcs
    let aTest = new Test()
    let testNames = _.map(getAllFuncNames(Object.getPrototypeOf(aTest)), (n) => { return n.toLowerCase() })

    let count = 0
    _.each(names, (name) => {
        // Check if they had testFunc function
        const testName = "test" + name
        if (_.find(testNames, (tName) => { return tName == testName })) {
            count++
        }
    })

    return { covered: count, total: names.length}
}

here.on('load', () => {
    here.miniWindow.set({ title: "Testing…" })
    
    let cv_global = coverage(global)
    console.info(`Coverage for global: ${cv_global.covered}/${cv_global.total}`)
    
    // Here
    let cv_here = coverage(here)
    console.info(`Coverage for here: ${cv_here.covered}/${cv_here.total}`)
    // http
    let cv = coverage(http)
    console.info(`Coverage for http: ${cv.covered}/${cv.total}`)
    
    // Start testing
    let aTest = new Test()
    
    // 所有 functions
    let testNames = getAllFuncNames(Object.getPrototypeOf(aTest))
    // 取 test 开头s
    testNames = _.filter(testNames, (n) => { return n.startsWith("test") })
    // 变成 Promise
    testNames = _.map(testNames, (n) => { return aTest[n].apply() })
    
    // 取结果
    Promise.all(testNames)
    .then((results) => {
        console.info(_.map(results, (result) => {
            let str = ""
            let arr = result.msg.split("\n")
            _.each(arr, (item, i) => {
                let sym = result.ret ? "✅" : "❌"
                if (i > 0) {
                    str += "\n"
                }
                str += `${sym}${item}`
            })
            return str
        }).join("\n"))
        console.info("All done.")
    })
    .catch((err) => {
        console.error(err)
    })
})

here.popover.on('willShow', () => {
    console.info("✅here.popoer.on('willShow')")
})
here.popover.on('show', () => {
    console.info("✅here.popoer.on('show')")
})
here.popover.on('close', () => {
    console.info("✅here.popoer.on('close')")
})
here.popover.on('willClose', () => {
    console.info("✅here.popoer.on('willClose')")
})