const puppeteer = require('puppeteer')
/**
 *      /outcome
 * Tweet given text and returns tweet id
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} tweetText 
 */
async function tweet (userID, pwd, tweetText) {
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

    // For clicking tweetbox

    await page.waitFor(3000)
    const tweetButton = 'div.css-901oao.r-1awozwy.r-jwli3a.r-6koalj.r-18u37iz.r-16y2uox.r-1qd0xha.r-a023e6.r-vw2c0b.r-1777fci.r-eljoum.r-dnmrzs.r-bcqeeo.r-q4m81j.r-qvutc0'
    await page.waitForSelector(tweetButton)
    await page.click(tweetButton)
    await page.waitForSelector('div.DraftEditor-editorContainer')

    const wait = 'div.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr'
    await page.waitForSelector(wait)
    await page.click(wait)
    await page.type(wait, tweetText)

    const status = 'div.css-18t94o4.css-1dbjc4n.r-urgr8i.r-42olwf.r-sdzlij.r-1phboty.r-rs99b7.r-1w2pmg,r-1n0xq6e.r-1vuscfd.r-1dhvaqw.r-1fneopy.r-o7ynqc.r-6416eg .r-lrvibr'
    await page.click(status)
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
    throw new Error('Failed to tweet..')
  }
}


function getTweetMsg(task){
    let variables = task.variables
    for(let i=0; i < variables.length; i++){
        if(variables[i].name==='tweet_msg'){
            return variables[i].value
        }
    }
}
function getData(task){
  let variables = task.variables
  for(let i=0; i < variables.length; i++){
      if(variables[i].name==='data'){
          return variables[i].value
      }
  }
}
module.exports = {
  tweet,
  getTweetMsg,
  getData,
}
