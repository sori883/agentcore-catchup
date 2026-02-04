# Code Style & Conventions

## TypeScript (CDK)

### フォーマット (Prettier)
- **インデント**: 2スペース
- **行幅**: 80文字
- **クォート**: シングルクォート (`'`)
- **セミコロン**: 必須
- **末尾カンマ**: ES5スタイル
- **改行**: LF

### ESLintルール
- `quotes`: シングルクォート必須
- `semi`: セミコロン必須
- `n/no-process-env`: `process.env`直接使用禁止（`parameter/validate-dotenv.ts`のみ許可）
- `@typescript-eslint/consistent-type-imports`: 型インポートは分離スタイル

### Import順序
1. 型インポート (`<TYPES>`)
2. aws-cdk-lib
3. parameter/
4. constructs/
5. サードパーティモジュール
6. 相対パスの型インポート
7. @/ プレフィックス
8. 相対インポート

### TypeScript設定
- **target**: ES2022
- **module**: NodeNext
- **strict**: true（すべてのstrictオプション有効）
- **noImplicitReturns**: true

## TypeScript (Frontend)

- Next.js 15 App Routerの規約に従う
- TailwindCSS 4のユーティリティクラスを使用
- conformを使ったフォームバリデーション

## Python (AgentCore)

- Python 3.14+
- uvによるパッケージ管理
- strands-agentsフレームワークの規約に従う
