here.on('load', () => {
    here.setMiniWindow({ title: "Apple Service Coverage", detail: "Check the Status of your Apple Devices" })
    
    here.setPopover({
        type: "webView",
        data: {
            url: "https://checkcoverage.apple.com",
            width: 375,
            height: 580,
            backgroundColor: "#ffffff",
            foregroundColor: rgba(0, 0, 0, 0.5),
            hideStatusBar: false
        }
    })
})