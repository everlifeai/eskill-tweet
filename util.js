const puppeteer = require('puppeteer')
var os = require("os")
const fs = require('fs').promises;

/**
 *      /outcome
 * Tweet given text and returns tweet id
 * @param {*} userID 
 * @param {*} pwd 
 * @param {*} tweetText 
 */
async function tweet (userID, pwd, tweetText) {
  
  let data = {}
  let browser = await getBrowser()	
  let page = await browser.newPage()
  
  try {
    await page.setViewport({ width: 1920, height: 1080 })
    
    // Logging in and Checking Cookies
    let loggedin = await cookie_login(page)
    if(!loggedin) {
    await auth_login(userID, pwd, page)
    await save_login_cookie(page)
    }

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
// Basically function identifies OS type & Version and check whether OS is Windows 7 or not.   		
function windows7_check(){		
  		
  var os_type = os.type()  		
  var os_version = os.release()		
  		
  // Convert variable os_version (from string to float) and takes first 3 digits for detecting OS.		
  let version_number= parseFloat(os_version.slice(0,3))		
  		
  const os_data = {"Operating System": os_type , "Version" : version_number }		
   		
// Table of various windows operating systems : 		
// https://docs.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-osversioninfoexw#remarks    		
// From above table we can know Version number of Windows 7 is '6.1'. 		
if (os_data.Version === 6.1)		
    return true		
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

async function cookie_login(page) {
  try {
      let cookie_s = await fs.readFile('./cookies.json')
      let cookies = JSON.parse(cookie_s)
      await page.setCookie(...cookies)
      await page.goto('https://twitter.com/home')
      await page.waitFor('div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci')
      return true
    }catch(e) {
      return false
    }
  }
  
async function save_login_cookie(page) {
  try {
  const cookies = await page.cookies();
  await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2))
  }catch(e) {
    console.error(e.message)
  }
}
  
async function auth_login(userID, pwd, page) {
  
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('https://twitter.com/login',{"waitUntil" : "networkidle0"})
  
  // Entering Credentials
  await page.type("[name='session[username_or_email]'",userID)
  await page.type("[name='session[password]'", pwd)
  
  // To click login button
  const submitButton = 'div.css-901oao.r-1awozwy.r-jwli3a.r-6koalj.r-18u37iz.r-16y2uox.r-1qd0xha.r-a023e6.r-vw2c0b.r-1777fci.r-eljoum.r-dnmrzs.r-bcqeeo.r-q4m81j.r-qvutc0'
  await page.waitForSelector(submitButton)
  await page.click(submitButton)
  await page.waitFor('div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci')
}

async function getBrowser(){		
  // Often when running on Windows 7,headless mode ignores the default proxy which will lead to Navigation Timeout Errors.  		
  // So For Windows 7 we are explicity bypassing all proxies. And for other operating systems,we are using no sandbox environment.		
  // You can find the details of issue on the following link : https://github.com/GoogleChrome/puppeteer/issues/2613  		
  if (windows7_check())		
    return browser = await puppeteer.launch({ headless: true, slowMo: 100, args: [ '--proxy-server="direct://"', '--proxy-bypass-list=*']})  		
  else		
    return browser = await puppeteer.launch({ headless: true, slowMo: 100, args: ['--no-sandbox'] })		
}

module.exports = {
  tweet,
  getTweetMsg,
  getData,
  getBrowser,
  save_login_cookie,
  auth_login,
  cookie_login
}
