'use strict'
const cote = require('cote')
const util = require('./util')

/*      understand/
 * This is the main entry point where we start.
 *
 *      outcome/
 * Start our microservice.
 */

let auth
/* microservice key (identity of the microservice) */
let msKey = 'eskill_tweet'

function main() {
    startMicroservice()
    registerWithCommMgr()
    loadCrediential()
}

const ssbClient = new cote.Requester({
    name: 'Ssb client ',
    key: 'everlife-ssb-svc',
  })

  const levelDBClient = new cote.Requester({
    name: 'level DB Client',
    key: 'everlife-db-svc',
  })
  
function loadCrediential(){
    levelDBClient.send({type:'get',  key: 'eskill-tweet'},(err, data) => {
        if(!err){
            ssbClient.send({type: 'decrypt-text', text: data },(err, data) => {
                if(!err) {
                    auth = JSON.parse(data)
                }
            })
        }  
    })
}



const commMgrClient = new cote.Requester({
    name: 'Eskill tweet -> CommMgr',
    key: 'everlife-communication-svc',
})

function sendReply(msg, req) {
    req.type = 'reply'
    req.msg = String(msg)
    commMgrClient.send(req, (err) => {
        if(err) u.showErr(err)
    })
}
function startMicroservice() {

    /*      understand/
     * The microservice (partitioned by key to prevent
     * conflicting with other services).
     */
    const svc = new cote.Responder({
        name: 'Eskill tweet',
        key: msKey,
    })

    /*      outcome/
     * Respond to user messages asking us to code/decode things
     */
    svc.on('msg', (req, cb) => {
        if(!req.msg) return cb()
        if(req.msg.startsWith('/tweet')){
            cb(null, true)
            util.tweet(auth.username, auth.password,'Hello')
                .then((result)=>{
                    sendReply(JSON.stringify(result), req)
                })
                .catch((err) => {
                    sendReply('Tweet failed..', req)
                })
        }
        
    })
    svc.on('task', (req, cb) => { 
        util.tweet(auth.username, auth.password, util.getTweetMsg(req.task))
            .then((result)=>{
                cb(null, req.task, result)
            })
            .catch((err) => {
                console.log(err)
                cb('Something went wrong.')
            })
    })
}

function registerWithCommMgr() {
    commMgrClient.send({
        type: 'register-msg-handler',
        mskey: msKey,
        mstype: 'msg',
        mshelp: [ 
            { cmd: '/tweet', txt: 'For tweeting in Twitter' }  ],
    }, (err) => {
        if(err) u.showErr(err)
    })
}
main()