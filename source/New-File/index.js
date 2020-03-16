
here.on('load', () => {
    const fileName = "NewFile.txt"
    const filePath = `~/Desktop/${fileName}`

    // Mini Window
    here.miniWindow.set({
        title: "Create a New File",
        detail: filePath,
        onClick: () => {
            here.exec(`touch ${filePath}`)
            .then(() => {
                here.exec(`open ${filePath}`)
            })
        }
    })
})