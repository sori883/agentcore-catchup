# Project Overview

## プロジェクト名
agentcore-catchup

## 概要
AWS Bedrock AgentCoreを使用したAIエージェントアプリケーション。インフラ（CDK）、フロントエンド（Next.js）、エージェントコア（Python）の3コンポーネントで構成。

## アーキテクチャ

```
agentcore-catchup/
├── cdk/                  # AWS CDK インフラコード (TypeScript)
│   ├── lib/
│   │   ├── constructs/   # CDK Constructs
│   │   │   ├── agentcore.ts      # AgentCore設定
│   │   │   ├── cloudfront.ts     # CloudFront
│   │   │   ├── edge-function.ts  # Lambda@Edge
│   │   │   ├── lambda-frontend.ts # Frontend Lambda
│   │   │   └── network.ts        # VPC等ネットワーク
│   │   ├── edge-function-stack.ts
│   │   └── main-stack.ts
│   └── parameter/        # 環境パラメータ
├── frontend/             # Next.js フロントエンド
│   └── app/              # App Router
│       ├── api/agent.ts  # Bedrock Agent API
│       ├── layout.tsx
│       └── page.tsx
└── agentcore/            # Python AgentCore
    ├── main.py           # エントリーポイント
    └── deployment_package/
```

## 技術スタック

### CDK (Infrastructure)
- **言語**: TypeScript
- **フレームワーク**: AWS CDK 2.236
- **パッケージマネージャー**: pnpm 10.28.2
- **Node.js**: 24.11.0+
- **主要依存**:
  - @aws-cdk/aws-bedrock-agentcore-alpha
  - @aws-cdk/aws-bedrock-alpha

### Frontend
- **フレームワーク**: Next.js 15.5.5 (App Router, Turbopack)
- **UI**: React 19.1.0
- **スタイリング**: TailwindCSS 4
- **AWS SDK**: @aws-sdk/client-bedrock-*
- **フォーム**: @conform-to/react + zod

### AgentCore (Python)
- **Python**: 3.14+
- **パッケージマネージャー**: uv
- **主要依存**:
  - bedrock-agentcore >= 1.2.0
  - strands-agents >= 1.24.0

## 環境
- 開発(dev) / ステージング(stg) / 本番(prd) の3環境をサポート
- 各環境は `.env.dev`, `.env.stg`, `.env.prd` で設定
