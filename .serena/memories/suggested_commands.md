# Suggested Commands

## CDK (cdk/ ディレクトリで実行)

### CDK操作
```bash
pnpm cdk:dev -- deploy   # 開発環境にデプロイ
pnpm cdk:stg -- deploy   # ステージング環境にデプロイ
pnpm cdk:prd -- deploy   # 本番環境にデプロイ
pnpm cdk:dev -- diff     # 変更差分を確認
pnpm cdk:dev -- synth    # CloudFormation生成
```

### テスト
```bash
pnpm test:dev            # 開発環境設定でテスト
pnpm test:stg            # ステージング環境設定でテスト
pnpm test:prd            # 本番環境設定でテスト
```

### コード品質
```bash
pnpm lint                # ESLint実行
pnpm lint:fix            # ESLint自動修正
pnpm format              # Prettier チェック
pnpm format:fix          # Prettier 自動修正
pnpm typecheck           # TypeScript型チェック
```

### その他
```bash
pnpm agent:sync          # agentcore/main.py を deployment_package/ にコピー
pnpm clean               # node_modules削除
```

## Frontend (frontend/ ディレクトリで実行)

```bash
pnpm dev                 # 開発サーバー起動 (Turbopack)
pnpm build               # プロダクションビルド
pnpm start               # プロダクションサーバー起動
```

## AgentCore (agentcore/ ディレクトリで実行)

```bash
uv sync                  # 依存関係インストール
uv run python main.py    # ローカル実行（テスト用）
```

## Git

```bash
git status               # 変更確認
git add -p               # インタラクティブにステージング
git commit -m "msg"      # コミット
git push origin <branch> # プッシュ
```

## システムユーティリティ (macOS/Darwin)

```bash
ls -la                   # ファイル一覧
find . -name "*.ts"      # ファイル検索
grep -r "pattern" .      # パターン検索
```
