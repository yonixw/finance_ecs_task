const fetch = require("node-fetch")

const WEBHOOK_EVENTS = {
    "error": process.env.WEBHOOK_ERROR,
    "diff": process.env.WEBHOOK_DIFF,
    "result": process.env.WEBHOOK_RESULT
}


function webhookDiffs(diff) {
    const event = "diff"
    const url = WEBHOOK_EVENTS[event];
    if (!url) return;

    const body = {
        diff, event
    }
    postAsync(event, url, body);
}

function webhookFileResult(name, txns) {
    const event = "result"
    const url = WEBHOOK_EVENTS[event];
    if (!url) return;

    const body = {
        name, txns, event
    }
    postAsync(event, url, body);
}

function webhookError(err) {
    console.error(err);

    const event = "error"
    const url = WEBHOOK_EVENTS[event];
    if (!url) return;

    const body = {
        "errormsg": `${err}`, event
    }
    postAsync(event, url, body);
}


async function webhookErrorWait(err) {
    console.error(err);

    const event = "error"
    const url = WEBHOOK_EVENTS[event];
    if (!url) return;

    const body = {
        "errormsg": `${err}`, event
    }
    await postWait(event, url, body);
}



async function postWait(event, url, obj) {
    const reqid = Math.floor((Math.random() * 0xFFFFFFF)).toString(16);
    console.log(`[WEBHOOK] ${reqid} - ${event} - start... `)
    try {
        await fetch(url + "?event=" + event, {
            method: "POST", headers: {
                "content-type": "application/json"
            }, body: JSON.stringify(obj)
        })
        console.log(`[WEBHOOK] ${reqid} - ${event} - Success `)
    }
    catch (e) {
        console.log(`[WEBHOOK] ${reqid} - ${event} - Error:`, e)
    }

}

function postAsync(event, url, obj) {
    const reqid = Math.floor((Math.random() * 0xFFFFFFF)).toString(16);
    console.log(`[WEBHOOK] ${reqid} - ${event} - start... `)
    fetch(url + "?event=" + event, {
        method: "POST", headers: {
            "content-type": "application/json"
        }, body: JSON.stringify(obj)
    })
        .then(() => {
            console.log(`[WEBHOOK] ${reqid} - ${event} - Success `)
        })
        .catch((e) => {
            console.log(`[WEBHOOK] ${reqid} - ${event} - Error:`, e)
        })
}

module.exports = { webhookError, webhookDiffs, webhookFileResult, webhookErrorWait }