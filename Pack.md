# Hwo to pack your plugins

1. Update version number in config.json file

    ```
    "version": "1.0.1"
    ```
1. Update version number in appcast.xml file

    ```
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <rss xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
    <channel>
        <item>
        <enclosure url="https://raw.githubusercontent.com/hereappdev/plugins/master/downloads/app.here.emptyTrash.js.hereplugin" sparkle:version="1.0.1"/>
        </item>
    </channel>
    </rss>
    ```

1. Run pack.rb script

    ```
    ./pack.rb
    ```

1. You're all set!