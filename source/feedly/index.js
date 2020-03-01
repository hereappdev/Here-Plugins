here.onLoad(() => {
    here.setMiniWindow({ title: "feedly", detail: "Keep up with the topics and trends you care about, without the overwhelm" })
    here.setMenuBar({ title: "Feedly" })

    here.setPopover({
        type: "webView",
        data: {
            url: "https://feedly.com/",
            width: 768,
            height: 700
        }
    })
})