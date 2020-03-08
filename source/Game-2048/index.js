here.onLoad(() => {
    here.miniWindow.set({ title: "🕹2048", detail: "Get to the 2048 Tile! (Keyboard: ↑↓← →)" })
    here.menuBar.set({ title: "🕹" })

    here.popover.set({
        type: "webView",
        data: {
            url: "./game/index.html",
            width: 300,
            height: 432,
            backgroundColor: "#FAF8EF",
            foregroundColor: rgba(133, 109, 0, 1),
            hideStatusBar: true
        }
    })
})