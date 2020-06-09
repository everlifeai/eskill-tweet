let util = require("./../util")

/**
 *       /outcome
 * Follow id 
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} followId 
 *  
 */
async function follow (userID, pwd,followId) {
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

    //To follow
    await page.goto(followId)
    const follow_people ='div.css-18t94o4.css-1dbjc4n.r-1niwhzg.r-p1n3y5.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg.r-lrvibr'
    await page.waitForSelector(follow_people)
    await page.click(follow_people)
    await browser.close()
    data['success']=true
    return data


    } catch (e) {
        await browser.close()
        console.log(e)
        throw new Error('Failed to follow..')
    }
}
module.exports = {
    follow
}
