# Finance Task.

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
      "companyId": "hapoalim"
    }
  },
  {
    "creds": {
      "id": "??????",
      "card6Digits": "??????",
      "password": "??????"
    },
    "options": {
      "companyId": "isracard"
    }
  }
]
```

## Environment Format

`.env` file example:

```bash
CONFIG=0000000FFFFFFFFFF # base64(JSON.stringify(creds_array))
SAVE_PATH=/tmp/ # in the docker

#SKIP_DOWNLOAD=1 # For developing

# S3 for saving latests version and to get diffs
S3_BUCKET=aws_s3_bucket
S3_FOLDER=bucker_folder # like a prefix

# webhooks for customiztions (Slack, Telegram, Google docs etc.)
# see src/webhooks.js for format
WEBHOOK_ERROR=https://requestbin.io/xxxxxxxxx
WEBHOOK_DIFF=https://requestbin.io/xxxxxxxxxx
WEBHOOK_RESULT=https://requestbin.io/xxxxxxxx # See results below

# Optional (aws sdk can take from few places)
# See IAM policy below
AWS_ACCESS_KEY_ID=AXXXX
AWS_SECRET_ACCESS_KEY=XXX/YYY/ZZZ
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

### IAM S3

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::BUCKET/*"
    }
  ]
}
```
