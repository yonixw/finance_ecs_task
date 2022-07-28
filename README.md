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
