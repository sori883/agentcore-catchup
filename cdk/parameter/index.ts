import { RemovalPolicy } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

import type { EnvNameType } from './envname-type';
import { env } from './validate-dotenv';

export type ParameterType = ReturnType<typeof parameter>;

/**
 * .env、環境差分パラメータ、共通パラメータをまとめる
 * @param envName EnvNameType
 * @returns パラメータ
 */
export const parameter = (envName: EnvNameType) => ({
  prefix: envName,
  region: 'ap-northeast-1',
  owner: 'sori883',
  project: 'cdk-template',
  cost: `cdk-template-${envName}`,
  // .envパラメータ
  dotEnv: { ...env },
  // 環境差分パラメータ
  diffEnv: envDiffParameter(envName),
});

/**
 * 環境差分があるパラメータを定義する
 * 例：性能パラメータなど
 * @param envName EnvNameType
 * @returns 環境差分パラメータ
 */
const envDiffParameter = (envName: EnvNameType) => {
  const params = {
    prd: {
    },
    stg: {
    },
    dev: {
    },
  };
  return params[envName];
};
