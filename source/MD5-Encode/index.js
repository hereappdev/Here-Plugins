const crypto = require('crypto')
const pasteboard = require('pasteboard')

here.on('load', () => {
    // Mini Window
    here.miniWindow.set({
        title: "MD5 Encode",
        detail: "Encode clipboard",
        onClick: () => {
            const text = pasteboard.getText()
            const encoded = crypto.md5(text)
            // console.log(`encoded: ${encoded}`)
            pasteboard.setText(encoded)
            here.postNotification("HUD", `String encoded: ${encoded}`)
        }
    })
})