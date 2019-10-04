const puppeteer = require('puppeteer')
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

  let browser = await puppeteer.launch({ headless: true, slowMo: 100, args: [
    '--proxy-server="direct://"',
    '--proxy-bypass-list=*'
  ] })
  let page = await browser.newPage()
  try {
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto('https://twitter.com/login')
   
    // For fetching username
    const mainInput = 'input.js-username-field.email-input.js-initial-focus'
    await page.waitForSelector(mainInput, { timeout: 300000 })
    await page.type(mainInput, userID)

    // For fetching password
    const passInput = 'input.js-password-field'
    await page.waitForSelector(passInput, { timeout: 300000 })
    await page.type(passInput, pwd)

    // To click login button
    const submitButton = 'button.submit.EdgeButton.EdgeButton--primary.EdgeButtom--medium'
    await page.waitForSelector(submitButton)
    await page.click(submitButton)
    await page.waitFor(1000 * 12)
   
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
