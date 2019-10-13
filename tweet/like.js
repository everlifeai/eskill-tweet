let util = require("./../util")

/**
 *       /outcome
 * Tweet status id and returns like status id
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} likestatusId 
 *  
 */
async function likeButton (userID, pwd,likestatusId) {
  let data = {}
  let browser =await util.getBrowser()
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
    
    //To click favourite or like button
    await page.goto(likestatusId)
    const like_button = 'div[data-testid="like"]'
    const unlikeButton = 'div[data-testid="unlike"]'
    await page.waitFor(3000);
    if(await page.$(unlikeButton)){
      await browser.close()
      return data
      
    }else if(await page.$(like_button)){
    await page.waitForSelector(like_button);
    await page.click(like_button);
    }
    await browser.close()
    data['success'] = true
    return data
  } catch (e) {
    data['success'] = false
    await browser.close()
    console.log(e)
    throw new Error('Failed to like..')
  }
}
module.exports = {
    likeButton,
}
