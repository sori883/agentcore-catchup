---
description: GitHub Issueを作成して作業を開始する。すべての開発作業はこのコマンドから始める。
---

# Issue作成コマンド

このコマンドは新しいGitHub Issueを作成し、Issue駆動開発ワークフローを開始します。

## 使用方法

```
/create-issue [タイプ] [タイトル]
```

### タイプ

| タイプ | 説明 | 例 |
|--------|------|-----|
| `feat` | 新機能 | `/create-issue feat ユーザー認証機能` |
| `fix` | バグ修正 | `/create-issue fix ログインエラー` |
| `refactor` | リファクタリング | `/create-issue refactor APIクライアント` |
| `docs` | ドキュメント | `/create-issue docs API仕様書` |
| `test` | テスト追加 | `/create-issue test 認証モジュール` |
| `chore` | 雑務 | `/create-issue chore 依存関係更新` |

## 実行手順

### 1. リポジトリ情報の取得

```bash
# リモートURLからowner/repoを取得
git remote get-url origin
```

### 2. Issue本文の作成

ユーザーから以下の情報を収集：

**機能追加（feat）の場合：**
- 概要
- 背景・目的
- 要件（チェックリスト形式）
- 受け入れ条件
- 技術的な検討事項（あれば）

**バグ修正（fix）の場合：**
- 概要
- 再現手順
- 期待される動作
- 実際の動作
- 環境情報

### 3. GitHub APIでIssue作成

```bash
# GitHub CLIでIssue作成
gh issue create \
  --title "[type]: タイトル（日本語）" \
  --body "Issue本文" \
  --label "type,priority:medium"
```

### 4. 作成後の確認

- Issue URLを表示
- 次のステップ（設計 or TDD）を案内

## Issue テンプレート

### 機能追加テンプレート

```markdown
## 概要
<!-- 機能の簡潔な説明 -->

## 背景・目的
<!-- なぜこの機能が必要か -->

## 要件
- [ ] 要件1
- [ ] 要件2

## 受け入れ条件
- [ ] 条件1
- [ ] 条件2

## 技術的な検討事項
<!-- アーキテクチャ、依存関係、パフォーマンスなど -->

## 関連Issue/PR
<!-- 関連するIssueやPRがあれば -->
```

### バグ修正テンプレート

```markdown
## 概要
<!-- バグの簡潔な説明 -->

## 再現手順
1. ステップ1
2. ステップ2

## 期待される動作
<!-- 本来どうなるべきか -->

## 実際の動作
<!-- 実際に何が起きているか -->

## 環境
- OS:
- バージョン:

## 関連Issue/PR
<!-- 関連するIssueやPRがあれば -->
```

## 次のステップ

Issue作成後：

1. **複雑な機能** → `planner` エージェントで設計
2. **シンプルな機能/バグ修正** → `tdd-guide` エージェントでTDD開始
3. **アーキテクチャ変更** → `architect` エージェントで設計

## 注意事項

- Issueタイトルは日本語で記述
- Issue本文も日本語で記述
- 適切なラベルを付与
- 作業開始前に必ずこのコマンドを実行すること
