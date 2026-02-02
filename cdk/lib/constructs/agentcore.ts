import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha';
import { BedrockFoundationModel } from '@aws-cdk/aws-bedrock-alpha';

export class AgentCore extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3にアップロードするアセットを定義
    const asset = new Asset(this, 'CodeAsset', {
      path: path.join(__dirname, '../../../agentcore/deployment_package'),
    });

    // AgentCore Runtime Artifact
    const artifact = agentcore.AgentRuntimeArtifact.fromS3(
      {
        bucketName: asset.s3BucketName,
        objectKey: asset.s3ObjectKey,
      },
      agentcore.AgentCoreRuntime.PYTHON_3_13,
      ['main.py']
    );

    // AgentCore Runtimeを定義
    const agentRuntime = new agentcore.Runtime(this, 'agent', {
      runtimeName: 'sample_agent',
      agentRuntimeArtifact: artifact,
      description: 'Sample agent',
    });

    // AgentCore Runtimeに対してBedrockへのアクセス権を付与
    const bedrockModel = BedrockFoundationModel.fromCdkFoundationModelId({
      modelId: 'openai.gpt-oss-120b-1:0',
    });
    bedrockModel.grantInvoke(agentRuntime);
  }
}
