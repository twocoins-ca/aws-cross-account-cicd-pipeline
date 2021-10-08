'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION })
const  s3 = new AWS.S3({signatureVersion: 'v4'});

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 30000


exports.handler = async function(event) {
	  console.log("request:", JSON.stringify(event, undefined, 2));
    return await getUploadURL(event);
};

const getUploadURL = async function(event) {
  const randomID = parseInt(Math.random() * 10000000)
  const date = new Date();
  const Key = `${date}.pdf`

  // Get signed URL from S3
  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'application/pdf',

    // This ACL makes the uploaded object publicly readable. You must also uncomment
    // the extra permission for the Lambda function in the SAM template.

    // ACL: 'public-read'
  }

  console.log('Params: ', s3Params)
  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)
  console.log('uploadURL: ', uploadURL)
	return {
		statusCode: 200,
		headers: { "Content-Type": "application/json" },
		body: `{
			"uploadURL":"${uploadURL}",
			"Key":"${Key}"
		}`
  };
}
