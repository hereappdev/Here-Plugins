module.exports = {
    // format: https://sspai.com/post/58856
    getPostId: (postLink) => {
        return postLink == undefined ? '' : _.last(_.split(postLink, '/'))
    },

    getUnreadFeeds: (feeds, readIds) => {
        return _.filter(feeds, (item, index) => !_.includes(readIds, getPostId(item.link)))
    },



}



