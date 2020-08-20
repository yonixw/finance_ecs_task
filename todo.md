// enable-devtools-experiments
// C:\Users\Yoni\Desktop\2020\bank_pull_2\node_modules\israeli-bank-scrapers\lib\scrapers\base-scraper-with-browser.js

- encrypt tokens:
    - result will be unencrypted by key = hash(built in data + data in json + data in ENV)
    - pass new console object to protect it! (will be used to replace original console)

- excel to json utils

- google doc to json utils

- json to save:
    - Basic:
        - source: poalim\ isracard
        - date
        - store
        - delta (chargedAmount)
    - Extra info:
        - delta (originalAmount)
        - originalCurrency (to track outland spending)
        - type
        - memo
        - status (completed or ...)



- save jsons to TMP and sync with S3 SDK?
    - some HASH in filename to avoid wasted time?
        - will not cost any more money, in same region
        - need some sorting...
        - if hash in name, we can compare by name only ignoring date

    Ignored - per month is small enough
        per day:
            - not first day in result
            - all records
            - total of day
        per calendar week:
            - if not the week of first day in result
            - all records
            - total of week
    

    per year-month
        - if not the month of the first day in result
        - all records
        - total of month

    - NO PER YEAR
        - Data probably will always be incomplete

We know (or note for UI) that all latest (day,week, month)  totals are temporary...

UI: Allow to use ICAL import for holiday correlation