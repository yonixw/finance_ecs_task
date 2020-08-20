const { createScraper } = require('israeli-bank-scrapers');
const timespanString = require("./timespan");
const {toKVArray, groupData} = require("./group_data")

const fs = require("fs");
const path = require("path");

require("dotenv").config({});


const all_options = [
    {
        creds: {
            userCode: process.env.POEL_USER,
            password: process.env.POEL_PASS
        },
        options: {
            companyId: "hapoalim",
            showBrowser: false
        }
    },
    {
        creds: {
            id: process.env.ISRA_ID,
            card6Digits: process.env.ISRA_CODE,
            password: process.env.ISRA_PASS
        },
        options: {
            companyId: "isracard",
            showBrowser: true
        }
    } 
]



async function main() {
    let group_data = {}
    for (let i = 0; i < all_options.length; i++) {
        const element = all_options[i];

        let startDate = Date.now();
        console.log("[START] scraping for site '" + element.options.companyId + "'");
        try {
            const scraper = createScraper(element.options);
            const scrapeResult = await scraper.scrape(element.creds);
         
            if (scrapeResult.success) {
              scrapeResult.accounts.forEach((account) => {
                 console.log(`found ${account.txns.length} transactions for account number 
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
               throw new Error(scrapeResult.errorType);
            }
        } catch(e) {
            console.error(`scraping failed for the following reason: ${e.message}\n Full Error:\n ${e}`);
        } 
        console.log("[END] scraping for site '" + element.options.companyId + "', took: "
            + timespanString(Date.now()-startDate));
    }

    console.log("[START] saving data");
    try {
        const group_data_array = toKVArray(group_data);
    
        for (let i = 0; i < group_data_array.length; i++) {
            const group_name = group_data_array[i][0];
            const group_array = group_data_array[i][1];
            
            let saveFolder = path.join(process.env.SAVE_PATH,group_name)

            if (!fs.existsSync(saveFolder)){
                fs.mkdirSync(saveFolder);
            }

            let savePath = path.join(saveFolder,"txns.json");
            let dataToSave = JSON.stringify(group_array);

            console.log(
                "Saving '" + group_name + "' to '" + savePath +
                "', Count: " + group_array.length + 
                ", KB:" + Math.round(dataToSave.length/1024));
            fs.writeFileSync(
                savePath,
                dataToSave
            );
        }
    } catch (e) {
        console.error(`saving failed for the following reason: ${e.message}\n Full Error:\n ${e}`);
    }
    console.log("[END] saving data");
}

main().then(()=>console.log("[DONE]"));