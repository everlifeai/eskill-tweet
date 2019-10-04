const puppeteer = require('puppeteer')
/**
 *       /outcome
 * unfollow id 
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} unfollowId 
 *  
 */
async function unfollow (userID, pwd,unfollowId) {
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

    //To click unfollow
    await page.goto(unfollowId)
    const unfollow ='div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr'
    await page.waitFor(unfollow)
    await page.hover('div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr')
    await page.waitFor(2000)
   
    const clickbutton ='div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr'
    await page.waitForSelector(clickbutton)
    await page.click(clickbutton)
    const unfollow_button = 'div[data-testid="confirmationSheetConfirm"]'
    await page.waitForSelector(unfollow_button);
    await page.waitFor(1000)
    await page.click(unfollow_button);
    await browser.close()
    data['success']=true
    return data

    } catch (e) {
    data['success'] = false
    await browser.close()
    console.log(e)
    throw new Error('Failed to unfollow..')
    }
}
module.exports = {
    unfollow
}
