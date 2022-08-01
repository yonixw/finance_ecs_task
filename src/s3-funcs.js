//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
const aws = require("aws-sdk")
const s3 = new aws.S3();

const util = require('util')
const fs = require('fs')
const path = require('path')

const { deltaTxnObj } = require("./diff_txtns")

async function uploadFileIfBigger(filepath, bucket, s3RelPath) {
    let diffResult = [];


    let newReportData = fs.readFileSync(filepath);

    var options_get = {
        Bucket: bucket,
        Key: s3RelPath,
    };

    console.log(`Pre-Upload - get '${options_get.Key}'`)
    let currentSize = 0;
    try {
        let getResult = await s3.getObject(options_get).promise();
        currentSize = getResult.ContentLength;
        let oldReportData = JSON.parse(getResult.Body.toString('utf-8'))

        diffResult = deltaTxnObj(oldReportData, newReportData);

    } catch (error) {
        // We dont care if file not exist
        if (error.code === 'NotFound') {
            diffResult = [].concat(JSON.parse(newReportData));
        }
        else {
            //rethrow
            throw error;
        }
    }

    /*
    Only update locally bigger files
    We assume that "PREV_SCAN_MONTH" back:
    * It is completed updating txns
    * It will not miss too old txns (in case provider may truncate days and not months from old)
    */

    console.log("Uploading - '" + options_get.Bucket + "', '" + options_get.Key + "'")

    var options_put = {
        Bucket: bucket,
        Key: s3RelPath,
        Body: newReportData
    };

    await s3.putObject(options_put).promise();
    console.log('Successfully uploaded ' + filepath + ' to ' + bucket);
    return diffResult;
}

const readdirSyncRec = (p, a = []) => {
    if (fs.statSync(p).isDirectory())
        fs.readdirSync(p).map(f => readdirSyncRec(a[a.push(path.join(p, f)) - 1], a))
    return a
}

async function uploadFolder(folderPath, bucket, bucketPath) {
    let diffs = []
    var structure = readdirSyncRec(folderPath);
    console.log("Found files:")
    console.log(JSON.stringify(structure, null, 4))
    for (let i = 0; i < structure.length; i++) {
        const f = structure[i];
        if (!fs.lstatSync(f).isDirectory()) {
            console.log("Processing '" + f + "'");
            const localFullPath = f
            const s3FileFullPath = path.join(bucketPath, f.replace(folderPath, "")).replace(/\\/g, '/');
            const fileDiffs = await uploadFileIfBigger(
                localFullPath,
                bucket,
                s3FileFullPath
            )
            diffs = diffs.concat(fileDiffs)
        }
    }
    return diffs;
}

function getFileCount(downloadPath) {
    if (fs.existsSync(downloadPath))
        return fs.readdirSync(downloadPath).length
    else
        return -1;
}

function saveDownloadFile(filename, downloadPath, content) {
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    fs.writeFileSync(path.join(downloadPath, filename), content);
}


module.exports = { uploadFile: uploadFileIfBigger, uploadFolder, getFileCount, saveDownloadFile };