const os = require("os")
const _ = require("underscore")

function updateMemoryInfo() {
    console.verbose("updateMemoryInfo")

    os.memoryStats()
    .then((usage) => {
        console.verbose(usage)

        // Physical Memory Size
        const mem_size = usage["mem_size_string"].replace(/\s+/g, '')

        //===== Memory Usaed =====
        // Just like data showing on Activity Monitor.app
        // App Memory
        const app_memory = usage["app_memory_string"].replace(/\s+/g, '')
        // Wired Memory
        const wired = usage["wired_string"].replace(/\s+/g, '')
        // Compressed Memory
        const compressed = usage["compressed_string"].replace(/\s+/g, '')

        // Used = App Memory + Wired Memory + Compressed Memory
        const used = usage["used_string"].replace(/\s+/g, '')

        // Free = mem_size - used
        const free = usage["free_string"].replace(/\s+/g, '')

        // Active
        const active = usage["active_count_string"].replace(/\s+/g, '')
        //===== Memory Usaed =====

        // Cached Files
        const cached = usage["cached_string"].replace(/\s+/g, '')

        // Swap
        const swapUsed = usage["swap_used_string"].replace(/\s+/g, '')

        // Menu Bar
        here.menuBar.set({
            title: (used.slice(0,-2)/mem_size.slice(0,-2)*100).toFixed(0) + "%",
            detail: "MEM"
        })

        // Mini Window
        here.miniWindow.set({
            title: `Memory Usage`,
            // detail: `wired: ${wired} active: ${active} compressed: ${compressed} free: ${free}`,
            detail: `wire`,
            accessory: {
                title: used,
                detail: mem_size
            }
        })
        here.popover.set([
            { title: `Physical Memory`, accessory: { title : mem_size } },
            { title: `Memory Used`, accessory: { title : used } },
            { title: `Physical Memory`, accessory: { title : cached } },
            { title: `Cached`, accessory: { title : wired } },
            { title: `compressed`, accessory: { title : compressed } },
            { title: `free`, accessory: { title : free } },
            { title: `active`, accessory: { title : active } }
        ])

        // Dock
        here.dock.set({
            title: (Number(used.slice(0,-2)/mem_size.slice(0,-2))*100).toFixed(0) + "%",
            detail: "MEM"
        })

        // Menu Bar
        here.setMenuBar({
            title: (Number(used.slice(0,-2)/mem_size.slice(0,-2))*100).toFixed(0) + "%",
            detail: "MEM"
        })

    })
    .catch((error) => {
        console.error(JSON.stringify(error))
        here.miniWindow.set({ title: error })
    })
}

here.on('load', () => {
    updateMemoryInfo()
    // Update every 3sec
    setInterval(updateMemoryInfo, 3000);
})