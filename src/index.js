const { createScraper } = require('israeli-bank-scrapers');
const timespanString = require("./timespan");
const { toKVArray, groupData } = require("./group_data")

const fs = require("fs");
const path = require("path");
const { webhookDiffs, webhookErrorWait, webhookError } = require('./webhooks');

require("dotenv").config({});

const PREV_SCAN_MONTH = 2

const all_options = JSON.parse(Buffer.from(process.env.CONFIG || "", 'base64').toString()) || [];
const saveBasePath = path.resolve(process.env.SAVE_PATH)

process.on('unhandledRejection', error => {
    console.error('*** unhandledRejection', error);
});

process.on('uncaughtException', error => {
    console.error('*** uncaughtException', error);
});

const sleepSec = (sec) => new Promise((ok, _) => setTimeout(ok, 1000 * sec))

async function main() {
    if (process.env.SKIP_DOWNLOAD !== '1') {
        let group_data = {}
        for (let i = 0; i < all_options.length; i++) {
            const element = all_options[i];

            let fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - PREV_SCAN_MONTH);
            fromDate.setDate(1)
            fromDate.setHours(0, 0, 0, 0)
            console.log("Searching data from: " + fromDate.toString())

            // override options
            element.options = {
                ...element.options, ...{
                    args: ['--no-sandbox'],
                    showBrowser: false,
                    verbose: true,
                    startDate: fromDate,
                    futureMonthsToScrape: 1, // Due date, not Purchase date which always <= now()
                }
            };

            let startRunDate = Date.now();
            console.log("[START] scraping for site '" + element.options.companyId + "'");
            try {
                const scraper = createScraper(element.options);
                scraper.onProgress((companyId, payload) => {
                    console.log(`[PROGRESS] '${companyId}' -  ${payload.type}`);
                });
                const scrapeResult = await scraper.scrape(element.creds);

                if (scrapeResult.success) {
                    scrapeResult.accounts.forEach((account) => {
                        console.log(`[SUCESS] found ${account.txns.length} transactions for account number 
                  ${account.accountNumber}`);

                        console.log("Grouping data...")
                        groupData(
                            element.options.companyId,
                            account.accountNumber,
                            account.txns,
                            group_data)
                    });
                }
                else {
                    await webhookErrorWait(`[ERROR-SCRAPE-LOGIC] - ${element.options?.companyId} - ${scrapeResult.errorType}`)
                    // Stop process. Need all to work!
                    process.exit(1);
                }

                scraper.terminate();

            } catch (e) {
                await webhookErrorWait(`[ERROR-SCRAPE-FATAL] - ${element.options?.companyId} - scraping failed for the following reason: ${e.message}\n Full Error:\n ${JSON.stringify(e)}`)

                // Stop process. Need all to work!
                process.exit(1);
            }
            console.log("[END] scraping for site '" + element.options.companyId + "', took: "
                + timespanString(Date.now() - startRunDate));
        }

        console.log("[START] saving data");
        try {
            const group_data_array = toKVArray(group_data);

            for (let i = 0; i < group_data_array.length; i++) {
                const group_name = group_data_array[i][0];
                const group_array = group_data_array[i][1];

                let saveFolder = path.join(saveBasePath, group_name)

                if (!fs.existsSync(saveFolder)) {
                    fs.mkdirSync(saveFolder, { recursive: true });
                }

                let savePath = path.join(saveFolder, "txns.json");
                let dataToSave = JSON.stringify(group_array);

                console.log(
                    "Saving '" + group_name + "' to '" + savePath +
                    "', Count: " + group_array.length +
                    ", KB:" + Math.round(dataToSave.length / 1024));
                fs.writeFileSync(
                    savePath,
                    dataToSave
                );
            }
        } catch (e) {
            await webhookErrorWait(`saving failed for the following reason: ${e.message}\n Full Error:\n ${JSON.stringify(e)}`);
        }
        console.log("[END] saving data");
    }

    let diffsTXNs = [];

    console.log("[START] uploading to s3");
    try {
        console.log("Uploading to s3...");
        const { uploadFolder } = require("./s3-funcs");

        if (fs.existsSync(saveBasePath)) {
            diffsTXNs = await uploadFolder(saveBasePath, process.env.S3_BUCKET, process.env.S3_FOLDER || "bank-scrape")
        }
        else {
            console.log("Can't find any folder in '" + saveBasePath + "' !");
        }

    } catch (e) {
        await webhookErrorWait("[ERROR_UPLOAD_S3] " + e + ", " + JSON.stringify(e), e);
    }
    console.log("[END] uploading to s3");


    console.log(`[DIFF] found ${diffsTXNs.length} diffs`)
    webhookDiffs(diffsTXNs)

    await sleepSec(30); // Wait for all webhooks to complete
}

main().then(
    () => console.log("[DONE]")
).catch(
    (e) => webhookError("ERROR_LOCAL " + e + "," + JSON.stringify(e))
)