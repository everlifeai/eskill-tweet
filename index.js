'use strict'
const cote = require('cote')
const util = require('./util')
const u = require('elife-utils')

/* microservice key (identity of the microservice) */
let msKey = 'eskill_tweet'

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Start our microservice.
 */
function main() {
    startMicroservice()
    registerWithCommMgr()
    loadCrediential()
}

const ssbClient = new cote.Requester({
    name: 'Tweet Job Skill -> SSB client ',
    key: 'everlife-ssb-svc',
})

const levelDBClient = new cote.Requester({
    name: 'Tweet Job Skill -> Level DB Client',
    key: 'everlife-db-svc',
})

let auth
const commonerr = 'Twitter Job will not work'
const errmsg = {
    LEVELERR: `Error retriving your twitter credentials! If you have not set them, please do so by clicking skill tab and eskill-tweet otherwise ${commonerr}`,
    DECRYPTERR: `Error decrypting your twitter credentials! ${commonerr}`,
    PARSEERR: `Error loading your twitter credentials! ${commonerr}`,
}

function loadCrediential(){
    levelDBClient.send({type:'get',  key: 'eskill-tweet'},(err, data) => {
        if(err) {
            u.showErr(err)
            sendReply(errmsg.LEVELERR, { USELASTCHAN: true })
        } else {
            ssbClient.send({type: 'decrypt-text', text: data },(err, data) => {
                if(err) {
                    u.showErr(err)
                    sendReply(errmsg.DECRYPTERR, { USELASTCHAN: true })
                } else {
                    try {
                        auth = JSON.parse(data)
                    } catch (e) {
                        u.showErr(e)
                        sendReply(errmsg.PARSEERR, { USELASTCHAN: true })
                    }
                }
            })
        }
    })
}


const commMgrClient = new cote.Requester({
    name: 'Tweet Job Skill -> CommMgr',
    key: 'everlife-communication-svc',
})

function sendReply(msg, req) {
    req.type = 'reply'
    req.msg = String(msg)
    commMgrClient.send(req, (err) => {
        if(err){
            u.showErr('eskill-tweet:')
            u.showErr(err)
        }
    })
}

function startMicroservice() {

    /*      understand/
     * The microservice (partitioned by key to prevent
     * conflicting with other services).
     */
    const svc = new cote.Responder({
        name: 'Tweet Job',
        key: msKey,
    })

    /*      outcome/
     * Respond to user messages asking us to code/decode things
     */
    svc.on('msg', (req, cb) => {
        if(!req.msg) return cb()
        if(!req.msg.startsWith('/tweet')) return cb()
        cb(null, true)
        if(!auth || !auth.username || !auth.password) sendReply(errmsg.LEVELERR, req)
        else {
            let tweet_msg = req.msg.substr('/tweet'.length).trim() 
            if(tweet_msg.length > 280) {
                sendReply('Tweet message character limit exists. Try with a different message.',req)
            }else {
                util.tweet(auth.username, auth.password, tweet_msg)
                    .then((result) => {
                        if(result && result.success)
                            sendReply("Tweeted successfully.", req)
                        else 
                            sendReply('Tweet failed.', req)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        sendReply('Tweet failed..', req)
                    })
            }
        }
        
    })

    svc.on('task', (req, cb) => { 
        if(!auth || !auth.username || !auth.password) cb('Twitter credentials missing.')
        else{
            util.tweet(auth.username, auth.password, util.getTweetMsg(req.task))
                .then((result)=>{
                    cb(null, req.task, result)
                })
                .catch((err) => {
                    u.showErr(err)
                    cb('Something went wrong.')
                })
        }
    })
}

function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [ 
            { cmd: '/tweet', txt: 'Send a Tweet' }  ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}
main()
