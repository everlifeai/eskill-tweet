'use strict'
const cote = require('cote')
const util = require('./util')
const u = require('elife-utils')
const comment = require('./tweet/comment')
const retweet = require('./tweet/retweet')
const like = require('./tweet/like')
const follow = require('./tweet/follow')
const unfollow = require('./tweet/unfollow')


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
        if(req.msg.startsWith('/tweet')){
            cb(null, true)	
            if(!auth || !auth.username || !auth.password){
                sendReply(errmsg.LEVELERR, req)
            } 
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

        } else if(req.msg.startsWith('/retweet')){
            
            cb(null, true)
            if(!auth || !auth.username || !auth.password){
                sendReply(errmsg.LEVELERR, req)
            }else {
                let tweet_statusId = req.msg.substr('/retweet'.length).trim()
                retweet.reTweet(auth.username,auth.password,tweet_statusId)
                .then((result)=>{
                    if(result && result.success)
                        sendReply("Retweeted successfully.",req)
                    else
                        sendReply('Retweet failed.',req)
                })
                .catch((err) =>{
                    u.showErr(err)
                    sendReply('Retweet failed..',req)
                
                }) 
            }
        }else if(req.msg.startsWith('/like')){
            cb(null, true)
            if(!auth || !auth.username || !auth.password){
                sendReply(errmsg.LEVELERR, req)
            }else {
                let like_statusId = req.msg.substr('/like'.length).trim()
                like.likeButton(auth.username,auth.password,like_statusId)
                    .then((result)=>{
                        if(result && result.success)
                            sendReply("Liked successfully.",req)
                        else
                            sendReply('Like failed.',req)
                    })
                    .catch((err) =>{
                        u.showErr(err)
                        sendReply('Like failed..',req)
                    })
                }
        }else if(req.msg.startsWith('/comment')){
                cb(null, true)
                if(!auth || !auth.username || !auth.password){
                    sendReply(errmsg.LEVELERR, req)
                }else {
                let  x= req.msg.substr('/comment'.length).trim()
                let status_Id=x.substr(0,x.indexOf(' '))
                let tweet_comment=x.substr(x.indexOf(' ')+1);
                comment.commentTweet(auth.username,auth.password,status_Id,tweet_comment)
                    .then((result)=>{
                        if(result && result.success)
                            sendReply("Commented tweet successfully.",req)
                        else
                            sendReply('Comment failed.',req)
                    })
                    .catch((err) =>{
                        u.showErr(err)
                        sendReply('failed..',req)
                    })
                }
                
        }else if(req.msg.startsWith('/following')){
                cb(null, true)
                if(!auth || !auth.username || !auth.password){
                    sendReply(errmsg.LEVELERR, req)
                }else {
                let follow_Id = req.msg.substr('/following'.length).trim()
                follow.follow(auth.username,auth.password,follow_Id)
                    .then((result)=>{
                        if(result && result.success)
                            sendReply("Followed successfully.",req)
                        else
                            sendReply('Follow failed.',req)
                    })
                    .catch((err) =>{
                        u.showErr(err)
                        sendReply('Follow failed..',req)
                    })
                }
            
        }else if(req.msg.startsWith('/unfollowing')){
                cb(null, true)
                if(!auth || !auth.username || !auth.password){
                    sendReply(errmsg.LEVELERR, req)
                }else {
                let unfollow_Id = req.msg.substr('/unfollowing'.length).trim()
                unfollow.unfollow(auth.username,auth.password,unfollow_Id)
                    .then((result)=>{
                        if(result && result.success)
                            sendReply("Unfollowed successfully.",req)
                        else
                            sendReply('Unfollow failed.',req)
                    })
                    .catch((err) =>{
                        u.showErr(err)
                        sendReply('Unfollow failed..',req)
                    })

                }
            }
            else{
                cb()
            }
            
        
        
        })
    svc.on('task', (req, cb) => { 
        
        try{
            
            let data = JSON.parse(util.getData(req.task)); 
            console.log(data)
            if(!auth || !auth.username || !auth.password) cb('Twitter credentials missing.')
            else if(data.type == 'tweet'){
                util.tweet(auth.username, auth.password, data.message)
                    .then((result)=>{
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
            
            else if(data.type == 'retweet'){
                console.log(data.uri)
                retweet.reTweet(auth.username, auth.password, data.uri)
                    .then((result)=>{
                        console.log(result)
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
            else if(data.type == 'comment'){
                comment.commentTweet(auth.username, auth.password,data.uri,data.comment)
                    .then((result)=>{
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
            
            else if(data.type == 'like'){
                like.likeButton(auth.username, auth.password, data.uri)
                    .then((result)=>{
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
            
            else if(data.type == 'follow'){
                follow.follow(auth.username, auth.password, data.uri)
                    .then((result)=>{
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
            else if(data.type == 'unfollow'){
                unfollow.unfollow(auth.username, auth.password, data.uri)
                    .then((result)=>{
                        cb(null, req.task, result)
                    })
                    .catch((err) => {
                        u.showErr(err)
                        cb('Something went wrong.')
                    })
                    
            }
        }catch(e){
            console.log(e)
            cb('Something went wrong')
        }
    })
}

function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [ 
            {cmd: '/tweet', txt: 'Send a Tweet' },
            {cmd: '/retweet', txt: 'For retweet'},
            {cmd: '/comment', txt: 'For commenting a tweet'},
            {cmd: '/like', txt: 'For like a tweet'},
            {cmd: '/following', txt: 'For following '},
            {cmd: '/unfollowing', txt: 'For unfollowing '},
        ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}
main()
