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
    let loggedin = await util.cookie_login(page)
    if(!loggedin) {
    await util.auth_login(userID, pwd, page)
    await util.save_login_cookie(page)
    }
    
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
