import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export class IAMStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 import existing IAM Role
    const importedAVScannerLambdaRole = iam.Role.fromRoleArn(
      this,
      'AVScannerLambdaRole',
      `arn:aws:iam::657887547478:role/AVScannerLambdaRole`,
      {mutable: true},
    );
    console.log('importedRole 👉', importedAVScannerLambdaRole.roleName);

    //Example how to add an inline policy
    //const ksPolicies = new iam.Policy(this, 'kms-s3', genericS3KMSPolicyStmts);
		//importedAVScannerLambdaRole.attachInlinePolicy(ksPolicies);

		new cdk.CfnOutput(this, 'importedAVScannerLambdaRole',{
    	description: 'importedAVScannerLambdaRole.roleName.',
      value: importedAVScannerLambdaRole.roleName
		})
    
  }
}


// 👇 Create a Policy using the generic Construct
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
