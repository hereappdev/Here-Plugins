here.onLoad(() => {
    here.setMiniWindow({ title: "🕹2048", detail: "Get to the 2048 Tile! (Keyboard: ↑↓← →)" })
    here.setMenuBar({ title: "🕹" })

    here.setPopover({
        type: "webView",
        data: {
            url: "./game/index.html",
            width: 300,
            height: 462,
            backgroundColor: "#FAF8EF",
            foregroundColor: rgba(133, 109, 0, 1)
        }
    })
})