#!/usr/bin/env ruby

# How to pack your plugins: https://github.com/hereappdev/Here-Plugins/wiki/How-to-pack-your-plugins

require 'optparse'
require 'logger'
require 'json'

$log = Logger.new(STDOUT)
$log.level = Logger::DEBUG
$log.datetime_format = "%Y-%m-%d %H:%M:%S"

def packPlugin(folder_path)
    if folder_path.empty?
        exit 1
    end
    folder_name = File.basename(folder_path)
    zip_file_path = folder_name + '.zip'
    plugin_file_path = folder_name + '.hereplugin'
    $log.info("Will pack plugin located at path: " + folder_path)

    # Check config.json file
    config_path = File.join(folder_path, "config.json")
    if !File.file?(config_path)
        $log.error("No config.json found at path: " + folder_path)
        exit 1
    end

    # Compress to zip file
    $log.info("Compressing to #{zip_file_path}")
    if system("cd #{folder_path}/../ && zip -r #{zip_file_path} #{folder_name} -x *.DS_Store*") != true
        $log.error("Failed to compress #{folder_name}")
        exit 1
    end

    # Change extension name to .hereplugin
    if system("cd #{folder_path}/../ && mv #{zip_file_path} #{plugin_file_path}") != true
        $log.error("Failed to change file extension.")
        exit 1
    end
end

plugins = Dir["./source/*"]
plugins.each do |plugin| 
    packPlugin(plugin)
end

if system("mv ./source/*.hereplugin ./downloads") != true
    $log.error("Failed to mv files to downloads.")
    exit 1
end