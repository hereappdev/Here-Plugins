const pasteboard = require('pasteboard')

here.on('load', () => {
    // Mini Window
    here.miniWindow.set({
        title: "Search on Google…",
        detail: "from Clipboard",
        onClick: () => {
            const q = escape(pasteboard.getText())
            here.exec(`open https://www.google.com/search?q=${q}`)
            .then(() => {
                console.log("Done.")
            })
        },
    })
})