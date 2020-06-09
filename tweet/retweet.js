let util = require("./../util")

/**
 *       /outcome
 * Tweet status id and returns retweet status id
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} tweetstatusId 
 *  
 */
async function reTweet (userID, pwd,tweetstatusId) {
  let data = {}
  let browser =await util.getBrowser()
  let page = await browser.newPage()
  
  try {
    await page.setViewport({ width: 1920, height: 1080 })
    let loggedin = await util.cookie_login(page)
    if(!loggedin) {
    await util.auth_login(userID, pwd, page)
    await util.save_login_cookie(page)
    }
   
    //For retweet
    await page.goto(tweetstatusId)
    const re_tweet = 'div[data-testid="retweet"]'
    const un_reTweet = 'div[data-testid="unretweet"]'
    await page.waitFor(3000);
    if(await page.$(un_reTweet)){
      await browser.close()
      return data
    }else if(await page.$(re_tweet)){
    await page.waitForSelector(re_tweet);
    await page.click(re_tweet);
    const confirmRetweet ='div[data-testid="retweetConfirm"]'
    await page.waitForSelector(confirmRetweet);
    await page.click(confirmRetweet);
    }
    await browser.close()
    data['success'] = true
    return data
  } catch (e) {
    data['success'] = false
    await browser.close()
    console.log(e)
    throw new Error('Failed to retweet..')
  }
}


module.exports = {
    reTweet,
}
