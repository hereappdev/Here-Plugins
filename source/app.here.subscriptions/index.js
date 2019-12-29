const _ = require("underscore")
const fs = require("fs")
const process = require("process")

const Currency = {
    "USD": "$",
    "CNY": "￥"
}

function handlePrices(item) {
    item.priceDaily = 0
    item.priceMonthly = 0
    item.priceAnnual = 0

    if (item.price == undefined) {
        return item
    }

    if (item.cycle) {
        if (item.cycle == "daily") {
            item.priceDaily = item.price

        } else if (item.cycle == "monthly") {
            item.priceDaily = item.price / 30.0

        } else if (item.cycle == "annual") {
            item.priceDaily = item.price / 365
        }

        item.priceMonthly = item.priceDaily * 30
        item.priceAnnual = item.priceDaily * 365
    }
    return item
}

function hasData() {
    return fs.existsSync("./data.json")
}

function displayData() {
    const data = require("./data.json")
    let popOvers = []
    let priceDaily = 0
    let priceMonthly = 0
    let priceAnnual = 0

    if (data != undefined && data.data != undefined) {
        const arr = data.data
        const items = _.map(arr, (item) => {
            let symbol = Currency["item.currency"]
            if (symbol == undefined) {
                symbol = "￥"
            }

            item = handlePrices(item)

            return item
        })

        _.each(items, (item) => { priceDaily += item.priceDaily })
        popOvers.push({ title: `Daily costs`, accessory: { title: `￥${priceDaily.toFixed(2)}` } })

        _.each(items, (item) => { priceMonthly += item.priceMonthly })
        popOvers.push({ title: `Monthly costs`, accessory: { title: `￥${priceMonthly.toFixed(2)}` } })

        _.each(items, (item) => { priceAnnual += item.priceAnnual })
        popOvers.push({ title: `Annual costs`, accessory: { title: `￥${priceAnnual.toFixed(2)}` } })

        popOvers.push({ title: "------------------------------------------------------" })

        popOvers = popOvers.concat(_.map(items, (item) => {
            return { title: `${item.title}`, accessory: { title: `￥${item.priceMonthly.toFixed(2)}/mo` } }
        }))
    }
    return { 
        title: "Subscriptions", 
        detail: `Monthly costs ￥${priceMonthly.toFixed(2)}`,
        popOvers: popOvers 
    }
}

here.onLoad(() => {
    if (hasData()) {
        here.setMiniWindow(displayData())    
    } else {
        here.setMiniWindow({ 
            title: "No data.json found.", 
            detail: "Please rename config.json.example to config.json. Click here.",
            onClick: () => {
                here.exec(`open "${process.cwd()}"`)
            }
        })
    }
})
