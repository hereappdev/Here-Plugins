here.onLoad(() => {
    here.miniWindow.set({ title: "Feedly", detail: "Keep up with the topics and trends you care about, without the overwhelm" })
    here.menuBar.set({ title: "Feedly" })

    here.popover.set({
        type: "webView",
        data: {
            url: "https://feedly.com/",
            width: 768,
            height: 700
        }
    })
})