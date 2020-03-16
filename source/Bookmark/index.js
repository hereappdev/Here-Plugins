const pref = require("pref")

const json = pref.all()

if (json == undefined) {
    console.log("No prefs found.")
}

here.on('load', () => {
    here.setMiniWindow({ 
        title: json["websiteName"],
        detail: json["websiteURL"]
    })

    here.setPopover({
        type: "webView",
        data: {
            url: json["websiteURL"],
            width: json["windowWidth"],
            height: json["windowHeight"],
            backgroundColor: json["backgroundColor"],
            foregroundColor: json["foregroundColor"],
            hideStatusBar: json["hideStatusBar"] == "true" ? 1 : 0
        }
    })
})