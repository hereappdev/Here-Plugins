here.on('load', () => {

    here.miniWindow.set({
        title: "Show Hidden Files",
        detail: "Click to switch.",
        onClick: () => {
            switchHiddenFiles()
        }
    })

})

function switchHiddenFiles() {
    var status = 0

    here.exec("defaults read com.apple.finder AppleShowAllFiles")
    .then((stdOut) => {
        if(stdOut == 0){
            here.miniWindow.set({
                title: "Show Hidden Files",
                detail: "Click to switch.",
                accessory: {
                    title: "Enabled"
                },
            })
            status = 0
            here.exec("defaults write com.apple.finder AppleShowAllFiles -boolean true;killall Finder")
        }else if(stdOut == 1) {
            here.miniWindow.set({
                title: "Show Hidden Files",
                detail: "Click to switch.",
                accessory: {
                    title: "Disabled"
                },
            })
            status = 1
            here.exec("defaults write com.apple.finder AppleShowAllFiles -boolean false;killall Finder")
        }
    })
}