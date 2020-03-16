here.on('load', () => {
    here.setMiniWindow({
        title: "ToDoMVC",
        detail: "Double-click to edit a todo." })
    
    here.setPopover({
        type: "webView",
        data: {
            url: "./vue/index.html",
            width: 375,
            height: 500,
            backgroundColor: "#f5f5f5",
            foregroundColor: rgba(0, 0, 0, 0.5),
            hideStatusBar: true
        }
    })
})