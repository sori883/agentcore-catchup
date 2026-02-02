import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import type { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib/core';

import type { ParameterType } from '../parameter';
import { AgentCore } from './constructs/agentcore';

interface StackProps extends cdk.StackProps {
  readonly parameter: ParameterType;
}

export class InfraStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly sgEc2: ec2.ISecurityGroup;
  public readonly sgRds: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const { parameter } = props;

    new AgentCore(scope, 'agentcore');
  }
}
