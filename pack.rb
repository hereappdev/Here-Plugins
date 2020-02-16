#!/usr/bin/env ruby

# How to pack your plugins: https://github.com/hereappdev/Here-Plugins/wiki/How-to-pack-your-plugins
require 'optparse'
require 'logger'
require 'json'
require 'optparse'

options = {}
OptionParser.new do |opts|
    opts.banner = "Usage: pack.rb"

    opts.on("-a", "--all", "Pack all plugins") do |a|
        options[:all] = a
    end

    opts.on("-p", "--Plugin path", Array, "Plugin path to be packed") do |input|
        options[:path] = input.first
    end

    opts.on( '-h', '--help', 'Display this screen' ) do
        puts opts
        exit
    end

    opts.on("-v", "--[no-]verbose", "Run verbosely") do |v|
        options[:verbose] = v
    end

end.parse!

# p options
# exit

$log = Logger.new(STDOUT)
$log.level = Logger::INFO
if options[:verbose]
    $log.level = Logger::DEBUG
end
$log.datetime_format = "%Y-%m-%d %H:%M:%S"

$log.debug("argv: #{options}")

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

if options[:all]
    $log.info("Will pack all plugins under ./source")
    plugins = Dir["./source/*"]
    plugins.each do |plugin|
        $log.debug("Packing #{plugin}")
        packPlugin(plugin)
    end

    if system("mv ./source/*.hereplugin ./downloads") != true
        $log.error("Failed to mv files to downloads.")
        exit 1
    end
else
    path = options[:path]
    if !path
        $log.info("No plugin path speicified. try pack.rb -p /path/to/the/plugin")
        exit 1
    end
    $log.info("Will pack plugin from #{path}")
    packPlugin(path)
    
    if system("mv ./source/*.hereplugin ./downloads") != true
        $log.error("Failed to mv files to downloads.")
        exit 1
    end
    
end