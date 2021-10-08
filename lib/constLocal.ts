import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export const bucketName = "clamav-opimpact-bucket-ca-central-1"

//  Create a Policy using the generic Construct
export const putLogEventsPolicyStmt = {
      statements: [
        new iam.PolicyStatement({
          actions: ['logs:PutLogEvents'],
          resources: ['*'],
        }),
      ],
    }
export const genericS3KMSPolicyStmts = {
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:*'],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          actions: ['kms:*'],
          resources: ['*'],
        }),
      ],
    }
