# Finance Lambda.

## Environment used

```bash
S3_BUCKET=<bucket name (no url)>
SAVE_PATH=/tmp/bank-info/

CONFIG=<Base64 of the json config, see below>

# For local dev:
LOCAL=1
```

## Config
Example of the structure for `CONFIG` environment variable before base64 transform. `creds` info can be found in the [israeli-bank-scrapers README](https://github.com/eshaham/israeli-bank-scrapers#specific-definitions-per-scraper) and all supported bank codes [in this file](https://github.com/eshaham/israeli-bank-scrapers/blob/6badcdb1239773cb6af581c45a0f08a79d3ae929/src/definitions.ts#L5) 

```json
[
    {
        "creds": {
            "userCode": "??????",
            "password": "??????"
        },
        "options": {
            "companyId": "hapoalim",
            "showBrowser": false
        }
    },
    {
        "creds": {
            "id": "??????",
            "card6Digits": "??????",
            "password": "??????"
        },
        "options": {
            "companyId": "isracard",
            "showBrowser": false
        }
    }
]
```

## Results
The code will fetch data from all banks and will split them into year+month buckets and will upload them to S3 if not uploaded before.

The final structure inside S3 will look like:
```
├───2019-09
│     ├  txns.json
│
├───2019-10
│     ├  txns.json
│
├───2019-11
│     ├  txns.json
```

## Notes

### Delete chrome binaries
__Remember__ to remove all local chrome installation (except `chrome-aws-lambda`) before final zipping (after dev) or it will be too big (>250MB) for AWS lambda.


### Replace base-scraper-with-browser.js

This project will not work after `npm install` since the file  `node_modules\israeli-bank-scrapers\lib\scrapers\base-scraper-with-browser.js` rely on puppeteer while we need it to rely on `puppeteer-core` and `chrome-aws-lambda`

So I also commit a file with example how to replace (it's my copy but might not work in the future).

The main 2 changes:
1. Import `puppeteer-core` and `chrome-aws-lambda` 

```js
var _puppeteer = _interopRequireDefault(require("puppeteer-core"));
var _chrome_lambda = _interopRequireDefault(require("chrome-aws-lambda"));

```

2. Launch the browser with the lambda version

```js
this.browser = await _chrome_lambda.default.puppeteer._launcher.launch({
        env,
        headless: !this.options.showBrowser,
        devtools: false,
        
        // Take from chrome-aws-lambda:
        args: _chrome_lambda.default.args,
        defaultViewport: _chrome_lambda.default.defaultViewport,
        executablePath: await _chrome_lambda.default.executablePath,
});
```

### AWS Configuration

Checked with Node 12.x Runtime, 1600MB RAM, and 45sec timeout for each bank source.
