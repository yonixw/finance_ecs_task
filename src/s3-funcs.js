//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
const aws = require("aws-sdk")
const s3 = new aws.S3();

const fs = require('fs')
const path = require("path")

function uploadFileIfBigger(filepath, bucket, s3RelPath) {
    return new Promise((ok, bad) => {
        try {
            let data = fs.readFileSync(filepath);

            var options_head = {
                Bucket: bucket,
                Key: s3RelPath,
            };

            s3.headObject(options_head, function (err, result) {
                let currentSize = 0;
                if (!err) {
                    // We dont care if some error, might be file not exist
                    currentSize = result.ContentLength
                }

                /*
                 Only update locally bigger files
                 We assume that "PREV_SCAN_MONTH" back:
                    * It is completed updating txns
                    * It will not miss too old txns (in case provider may truncate days and not months from old)
                */
                if (currentSize < data.length) {
                    console.log("Uploading - '" + options_head.Bucket + "', '" + options_head.Key + "'")

                    var options_get = {
                        Bucket: bucket,
                        Key: s3RelPath,
                        Body: data
                    };

                    s3.putObject(options_get, function (err, data) {
                        if (err) {
                            bad(err);
                        } else {
                            console.log('Successfully uploaded ' + filepath + ' to ' + bucket);
                            ok(true);
                        }
                    });
                }
                else {
                    console.log("Skipping upload, bigger\equal in size, '" + options_head.Bucket + "', '" + options_head.Key + "'")
                    ok(false);
                }
            });
        } catch (error) {
            bad(error)
        }
    })
}

const readdirSyncRec = (p, a = []) => {
    if (fs.statSync(p).isDirectory())
        fs.readdirSync(p).map(f => readdirSyncRec(a[a.push(path.join(p, f)) - 1], a))
    return a
}

async function uploadFolder(folderPath, bucket, bucketPath) {
    let toCompare = []
    var structure = readdirSyncRec(folderPath);
    console.log("Found files:")
    console.log(JSON.stringify(structure, null, 4))
    for (let i = 0; i < structure.length; i++) {
        const f = structure[i];
        if (!fs.lstatSync(f).isDirectory()) {
            console.log("uploading '" + f + "'");
            const localFullPath = f
            const s3FileFullPath = path.join(bucketPath, f.replace(folderPath, "")).replace(/\\/g, '/');
            const isBigger = await uploadFileIfBigger(
                localFullPath,
                bucket,
                s3FileFullPath
            )
            if (isBigger) {
                toCompare.push([localFullPath, s3FileFullPath])
            }
        }
    }
    return toCompare;
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