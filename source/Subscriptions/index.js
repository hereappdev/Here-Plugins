const _ = require("underscore")
const fs = require("fs")
const process = require("process")

const rates = require('./openexchangerates.json')
const dataFilePath = './save.json'

const Currency = {
    "USD": "$",
    "CNY": "￥"
}

const defaultCurrency = "CNY"
const rateUSD2CNY = 6.9614

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

    item.priceDailyInDefault = 0
    item.priceMonthlyInDefault = 0
    item.priceAnnualInDefault = 0

    if (item.currency == defaultCurrency) {
        item.priceDailyInDefault = item.priceDaily
        item.priceMonthlyInDefault = item.priceMonthly
        item.priceAnnualInDefault = item.priceAnnual

    } else {
        if (rates == undefined || rates.rates == undefined || rates.base == undefined) {
            console.error("Invalid exchange rate.")
            return item
        }

        const defaultRate = rates.rates[defaultCurrency]
        const itemRate = rates.rates[item.currency]
        if (typeof(defaultRate) != 'number' || typeof(itemRate) != 'number') {
            console.error("No exchange rate found.")
            return item
        }

        const ratio = defaultRate / itemRate

        item.priceDailyInDefault = item.priceDaily * ratio
        item.priceMonthlyInDefault = item.priceMonthly * ratio
        item.priceAnnualInDefault = item.priceAnnual * ratio
    }

    return item
}

function hasData() {
    return fs.existsSync(dataFilePath)
}

function displayData() {
    const data = require(dataFilePath)
    let popovers = []
    let priceDaily = 0
    let priceMonthly = 0
    let priceAnnual = 0

    if (data != undefined && data.data != undefined) {
        const arr = data.data
        const items = _.map(arr, (item) => {
            let symbol = Currency[item.currency]
            if (symbol == undefined) {
                symbol = "￥"
            }

            item = handlePrices(item)
            item.symbol = symbol

            return item
        })

        _.each(items, (item) => { priceDaily += item.priceDailyInDefault })
        popovers.push({ title: `Daily costs`, accessory: { title: `￥${priceDaily.toFixed(2)}` } })

        _.each(items, (item) => { priceMonthly += item.priceMonthlyInDefault })
        popovers.push({ title: `Monthly costs`, accessory: { title: `￥${priceMonthly.toFixed(2)}` } })

        _.each(items, (item) => { priceAnnual += item.priceAnnualInDefault })
        popovers.push({ title: `Annual costs`, accessory: { title: `￥${priceAnnual.toFixed(2)}` } })

        popovers.push({ title: "------------------------------------------------------" })

        popovers = popovers.concat(_.map(items, (item) => {
            let title = `￥${item.priceMonthlyInDefault.toFixed(2)}/mo`
            if (item.currency != defaultCurrency) {
                title += ` (${item.currency} ${item.symbol}${item.priceMonthly.toFixed(2)}/mo)`
            }
            return { title: `${item.title}`, accessory: { title: title } }
        }))
    }
    here.miniWindow.set({ 
        title: "Subscriptions", 
        detail: `Monthly costs ￥${priceMonthly.toFixed(2)}`
    })
    here.popover.set(popovers)
}

here.on('load', () => {
    if (hasData()) {
        displayData()
    } else {
        here.miniWindow.set({ 
            title: "No save.json found.", 
            detail: "Please rename [example.json] to [save.json]. Click here.",
            onClick: () => {
                here.exec(`open "${process.cwd()}"`)
            }
        })
    }
})
