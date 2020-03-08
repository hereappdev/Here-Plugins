const hotkey = require('hotkey')

here.on('load', () => {
    // Mini Window
    here.miniWindow.set({
        title: "Screen Saver",
        detail: "Click to Start",
        onClick: () => {
            here.exec(`open -a ScreenSaverEngine`)
            .then(() => {
                console.log("Done.")
            })
        },
    })

    // Bind hotkey
    const aHotKey = ["cmd", "shift", "esc"]
    let aID = hotkey.bind(aHotKey, () => {
        // console.log("hot key fired!")
        here.exec(`open -a ScreenSaverEngine`)
    })

    if (aID == undefined) {
        console.error("Failed to register hotkey.")
    }
})