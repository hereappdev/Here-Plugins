here.onLoad(() => {
    here.setMiniWindow({ title: "2048", detail: "Hover here to play" })
    here.setMenuBar({ title: "2048" })

    here.setPopover({
        type: "webView",
        data: {
            url: "./game/index.html",
            width: 320,
            height: 460,
            backgroundColor: "#FAF8EF",
            foregroundColor: rgba(255, 255, 255, 0.01)
        }
    })
})