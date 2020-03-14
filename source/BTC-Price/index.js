const _ = require("underscore")
const http = require("http")
const pref = require("pref")
const net = require("net")

const currencySymbol  = {
            AED: "\u062f.\u0625",
            AFN: "\u060b",
            ALL: "L",
            AMD: "\u0564\u0580",
            ANG: "\u0192",
            AOA: "",
            ARS: "$",
            AUD: "$",
            AWG: "\u0192",
            AZN: "\u20bc",
            BAM: "KM",
            BBD: "$",
            BDT: "",
            BGN: "\u043b\u0432",
            BHD: "",
            BIF: "",
            BMD: "$",
            BND: "$",
            BOB: "$b",
            BRL: "R$",
            BSD: "$",
            BTC: "\u0243",
            BTN: "",
            BWP: "P",
            BYR: "",
            BZD: "BZ$",
            CAD: "$",
            CDF: "",
            CHF: "CHF",
            CLF: "",
            CLP: "$",
            CNY: "\xa5",
            COP: "$",
            CRC: "\u20a1",
            CUP: "\u20b1",
            CVE: "",
            CZK: "K\u010d",
            DJF: "",
            DKK: "kr",
            DOP: "RD$",
            DZD: "",
            EEK: "",
            EGP: "\xa3",
            ERN: "",
            ETB: "",
            EUR: "\u20ac",
            FJD: "$",
            FKP: "\xa3",
            GBP: "\xa3",
            GEL: "",
            GHS: "\xa2",
            GIP: "\xa3",
            GMD: "",
            GNF: "",
            GTQ: "Q",
            GYD: "$",
            HKD: "$",
            HNL: "L",
            HRK: "kn",
            HTG: "",
            HUF: "Ft",
            IDR: "Rp",
            ILS: "\u20aa",
            INR: "",
            IQD: "",
            IRR: "\ufdfc",
            ISK: "kr",
            JEP: "\xa3",
            JMD: "J$",
            JOD: "",
            JPY: "\xa5",
            KES: "",
            KGS: "\u043b\u0432",
            KHR: "\u17db",
            KMF: "",
            KPW: "\u20a9",
            KRW: "\u20a9",
            KWD: "",
            KYD: "$",
            KZT: "\u043b\u0432",
            LAK: "\u20ad",
            LBP: "\xa3",
            LKR: "\u20a8",
            LRD: "$",
            LSL: "",
            LTL: "",
            LVL: "",
            LYD: "",
            MAD: "",
            MDL: "",
            MGA: "",
            MKD: "\u0434\u0435\u043d",
            MMK: "",
            MNT: "\u20ae",
            MOP: "",
            MRO: "",
            MTL: "",
            MUR: "\u20a8",
            MVR: "",
            MWK: "",
            MXN: "$",
            MYR: "RM",
            MZN: "MT",
            NAD: "$",
            NGN: "\u20a6",
            NIO: "C$",
            NOK: "kr",
            NPR: "\u20a8",
            NZD: "$",
            OMR: "\ufdfc",
            PAB: "B/.",
            PEN: "S/.",
            PGK: "",
            PHP: "\u20b1",
            PKR: "\u20a8",
            PLN: "z\u0142",
            PYG: "Gs",
            QAR: "\ufdfc",
            RON: "lei",
            RSD: "\u0414\u0438\u043d.",
            RUB: "Br",
            RWF: "",
            SAR: "\ufdfc",
            SBD: "$",
            SCR: "\u20a8",
            SDG: "",
            SEK: "kr",
            SGD: "$",
            SHP: "\xa3",
            SLL: "",
            SOS: "S",
            SRD: "$",
            STD: "",
            SVC: "$",
            SYP: "\xa3",
            SZL: "",
            THB: "\u0e3f",
            TJS: "",
            TMT: "",
            TND: "",
            TOP: "",
            TRY: "",
            TTD: "TT$",
            TWD: "NT$",
            TZS: "",
            UAH: "\u20b4",
            UGX: "",
            USD: "$",
            UYU: "$U",
            UZS: "\u043b\u0432",
            VEF: "Bs",
            VND: "\u20ab",
            VUV: "",
            WST: "",
            XAF: "",
            XAG: "",
            XAU: "",
            XBT: "\u0243",
            XCD: "$",
            XDR: "",
            XOF: "",
            XPF: "",
            YER: "\ufdfc",
            ZAR: "R",
            ZMK: "",
            ZMW: "",
            ZWL: "",
            ETH: ""
}

function updateData() {
    var coinName = "BTC Price"
    var coinCode = "BTC"
    var currencyUnit = "CNY"
    var rate = 1

    here.miniWindow.set({ title: "Updating…" })

    const json = pref.all()

    if (json == undefined) {
        console.log("No prefs found.")
    }
    
    if (json["coinCode"] != undefined) {
        coinCode = json["coinCode"].toUpperCase()
    }
    
    if (json["coinName"] != undefined) {
        coinName = json["coinName"].toUpperCase()
    }

    if (json["currencyUnit"] != undefined) {
        currencyUnit = json["currencyUnit"].toUpperCase()
    }

    http.get("https://production.api.coindesk.com/v2/exchange-rates")
    .then((response) => {

        // console.verbose(JSON.stringify(response.data["data"][currencyUnit]["rate"]))

        rate = response.data["data"][currencyUnit]["rate"]

        })
        .catch((error) => {
            console.error("Error: " + JSON.stringify(error))
        })


    http.get("https://production.api.coindesk.com/v1/currency/" + coinCode + "/ticker")
    .then((response) => {

        // console.verbose(data)

        const json = response.data

        if (!json.hasOwnProperty("data")) {
            console.error("JSON result undefined")
            here.miniWindow.set({
                onClick: () => { updateData() },
                title: "Please check options."
            })
            return
        }

        const usdPrice = json["data"]["currency"][coinCode]["quotes"]["USD"]

        // console.verbose(json["data"]["currency"][coinCode]["quotes"]["USD"])
        
        const unitSymbol = currencySymbol[currencyUnit]
        const curPrice = unitSymbol + ((usdPrice["price"]*rate) > 100 ? (usdPrice["price"]*rate).toFixed(0) : (usdPrice["price"]*rate).toFixed(2)) + ""
        const lowPrice = unitSymbol + (((usdPrice["low"]*rate) > 100) ? (usdPrice["low"]*rate).toFixed(0) : (usdPrice["low"]*rate).toFixed(2)) + ""
        const hightPrice = unitSymbol + (((usdPrice["high"]*rate) > 100) ? (usdPrice["high"]*rate).toFixed(0) : (usdPrice["high"]*rate).toFixed(2)) + ""
        const curRate = usdPrice["change24Hr"]["percent"].toFixed(2)
        const percentage = ((curRate < 0) ? curRate : "+" + curRate) + "%"

        // console.log(percentage)

        // Menu Bar
        here.menuBar.set({
            title: curPrice,
            detail: percentage
        })

        // Mini Window
        here.miniWindow.set({
            title: coinName,
            detail: "↓" + lowPrice + " · ↑" + hightPrice,
            accessory: {
                title: curPrice,
                detail: percentage
            }
        })

        // Dock
        here.dock.set({
            title: curPrice,
            detail: percentage
        })

        // Popover
        if (typeof(here.popover.set) == "function") {
            here.popover.set({
                type: "webView",
                data: {
                    url: "https://www.coindesk.com/price/bitcoin",
                    width: 375,
                    height: 500,
                    backgroundColor: "#161f36",
                    foregroundColor: rgba(255, 255, 255, 0.5),
                    hideStatusBar: true
                }
            })
        }
    })
    .catch((error) => {
        console.error("Error: " + JSON.stringify(error))
        here.miniWindow.set({
            onClick: () => { updateData() },
            title: "Click to refresh."
        })
    })
}

here.on('load', () => {
    updateData()
    // Update every 2 hours
    setInterval(updateData, 3600*1000);
})

net.onChange((type) => {
    console.verbose("Connection type changed:", type)
    if (net.isReachable()) {
        updateData()
    }
})

