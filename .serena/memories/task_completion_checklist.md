# Task Completion Checklist

タスク完了時に以下を確認・実行してください。

## CDKコード変更時

1. **型チェック**
   ```bash
   cd cdk && pnpm typecheck
   ```

2. **Lintチェック**
   ```bash
   cd cdk && pnpm lint
   ```
   - エラーがあれば `pnpm lint:fix` で修正

3. **フォーマット**
   ```bash
   cd cdk && pnpm format
   ```
   - 差分があれば `pnpm format:fix` で修正

4. **テスト**
   ```bash
   cd cdk && pnpm test:dev
   ```

5. **CDK Diff（デプロイ前）**
   ```bash
   cd cdk && pnpm cdk:dev -- diff
   ```

## Frontendコード変更時

1. **ビルド確認**
   ```bash
   cd frontend && pnpm build
   ```

2. **開発サーバーで動作確認**
   ```bash
   cd frontend && pnpm dev
   ```

## AgentCoreコード変更時

1. **main.py をdeployment_package/にコピー**
   ```bash
   cd cdk && pnpm agent:sync
   ```
   - CDKデプロイ時に自動実行されるが、変更確認のため手動でも実行可能

## 共通

- [ ] 変更内容が意図通りか確認
- [ ] 不要なconsole.log/printを削除
- [ ] センシティブ情報（APIキー等）がコミットに含まれていないか確認
- [ ] 適切なコミットメッセージを作成
