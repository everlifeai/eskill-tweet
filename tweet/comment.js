let util = require("./../util")

/**
 *      /outcome
 * Tweet given comment and returns comment id
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} statusId 
 * @param {*} tweetComment 
 */
async function commentTweet (userID, pwd,statusId,tweetComment) {
  let data = {}
  let browser = await util.getBrowser() 
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
   
    //for adding a comment
    await page.goto(statusId)
    const comment ="div.css-1dbjc4n.r-sdzlij.r-1p0dtai.r-xoduu5.r-1d2f490.r-xf4iuw.r-u8s1d.r-zchlnj.r-ipm5af.r-o7ynqc.r-6416eg"
    await page.waitForSelector(comment)
    await page.click(comment)

    const add_comment ='div.notranslate.public-DraftEditor-content'
    await page.waitForSelector(add_comment)
    await page.click(add_comment)
    await page.type(add_comment,tweetComment)

    const status = 'div.css-901oao.r-1awozwy.r-jwli3a.r-6koalj.r-18u37iz.r-16y2uox.r-1qd0xha.r-a023e6.r-vw2c0b.r-1777fci.r-eljoum.r-dnmrzs.r-bcqeeo.r-q4m81j.r-qvutc0'
    await page.click(status);
    await page.waitFor(1000 * 12)
    data['success'] = true

    // For getting status_Id
    data = await page.waitFor('div.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0', { timeout: 175000
    }).then(async () => {
      await page.click('div.css-901oao.r-hkyrab.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0')
      await page.waitFor(1000 * 15)
      await page.evaluate(() => window.location.href)
      data['uri'] = await page.evaluate(() => window.location.href)
      await browser.close()
      return data
    })
    return data
  } catch (e) {
    data['success'] = false
    await browser.close()
    console.log(e)
    throw new Error('Failed to comment..')
  }
}



module.exports = {
  commentTweet
}
