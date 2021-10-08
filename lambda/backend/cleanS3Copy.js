const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = async (event, context) => {
    console.log('Lambda function CLEAN_COPY');
    // Get the object from the event and show its content 
    console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = event.requestPayload.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.requestPayload.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };

    function getKeyByValue(object, value) {
        console.log('keys: ' + Object.keys(object));
        return Object.keys(object).find(key => object[key] === value);
    }


    async function getS3File(bucketname, filename) {
        const params = {
            Bucket: bucketname,
            Key: filename,
        };

        const response = await s3.getObject(params, (err) => {
            if (err) {
                console.log("Error detected : ${err}");
            }
        });
    }

    try {
        const objectTagging = await s3.getObjectTagging({
            Bucket: bucket,
            Key: key
        }).promise();

        var tagsetList = objectTagging.TagSet;
        console.log("TagSet List: ", tagsetList);


        var avStatusSet = tagsetList.find(score => score['Key'] === "av-status")
        var avStatus = avStatusSet['Value'];

        if (avStatus && typeof avStatus === 'string' && avStatus === "CLEAN") {
            console.log(key + ': ' + avStatusSet['Value']);

            await s3.copyObject({
                Bucket: `${bucket}-out`,
                CopySource: `${bucket}/${key}`,
                Key: `out/${key}`,
            }).promise();
            console.log(key + ' has been copied into ' + `${bucket}-out/` + `${key}`);

        } else {
            const message = `Error on the file: key ${key}, bucket ${bucket}, avStatus: ${avStatus}.`;
            console.log(message);
            throw new Error(message);
        }


    } catch (err) {
        console.log("Error detected in the labmda fucntion: ${err}");
        const message = `Error on the file: object ${key} from bucket ${bucket}: ${err}`;
        console.log(message);
        throw new Error(message);
    }
};
