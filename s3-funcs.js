const aws = require("aws-sdk")
const s3 = new aws.S3();

const fs = require('fs')
const path = require("path")

function uploadFile(filepath, bucket, s3RelPath) {
    return new Promise((ok,bad)=>{
        try {
            var options = {
                Bucket: bucket,
                Key: s3RelPath,
                Body: fs.readFileSync(filepath)
            };

            console.log("Uploading - '" + options.Bucket + "', '" + options.Key + "'")
        
            s3.putObject(options, function(err, data) {
                if (err) {
                    bad(err);
                } else {
                    console.log('Successfully uploaded '+ filepath +' to ' + bucket);
                    ok();
                }
            });
        } catch (error) {
            bad(error)
        }
    })
}

async function uploadFolder(folderPath,bucket, bucketPath) {
    // - check if we get full path of relative - REL
    var filenames = fs.readdirSync(folderPath);
	console.log("Found files:")
	console.log(JSON.stringify(filenames,null,4))
    for (let i = 0; i < filenames.length; i++) {
        const f = filenames[i];
        console.log("uploading '" + f + "'");
        await uploadFile(path.join(folderPath,f),bucket,path.join(bucketPath,f))
    }
}

function getFileCount(downloadPath) {
    if (fs.existsSync(downloadPath))
        return fs.readdirSync(downloadPath).length
    else
        return -1;
}

function saveDownloadFile(filename, downloadPath,  content) {
    if (!fs.existsSync(downloadPath)){
        fs.mkdirSync(downloadPath);
    }

    fs.writeFileSync(path.join(downloadPath, filename),content);
}


module.exports = {uploadFile, uploadFolder, getFileCount,saveDownloadFile};