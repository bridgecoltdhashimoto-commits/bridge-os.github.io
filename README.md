# BRIDGE Revenue Assurance 4.0

Squareの適格な支払い失敗を自動検知し、購入者へ再決済案内を自動送信して、購入者本人の意思による再決済につなげる限定pilotサイトです。

## 公開URL

https://bridgecoltdhashimoto-commits.github.io/bridge-os.github.io/

## 方針
- 白基調・国内BtoBサービス向けの信頼性重視デザイン
- 株式会社BRIDGEの運営表示をファーストビューで明示
- Square公式サービスと誤認させない
- 自動検知・自動案内と、保存カードへの無断再請求を明確に区別する
- 技術検証済み事項と未確認の商用実績を分けて表示
- 実績のない回収率・売上保証は表示しない
- 申込み情報は静的ページ側で保存しない

## 構成
- `index.html`：サービス説明LP
- `apply.html`：限定pilot対象確認
- `terms.html`：利用条件
- `privacy.html`：プライバシーポリシー
- `security.html`：安全性・検証状況・連携解除
- `legal.html`：事業者表示
- `style.css`：共通デザイン
- `app.js`：利用対象の自動判定・メール作成
- `.github/workflows/deploy-pages.yml`：GitHub Pages自動公開
- `.nojekyll`：静的ファイルをそのまま公開

## 運用
- GitHub `main` を正本とする
- `main` 更新時にGitHub Pagesへ自動公開する
- Square本体Worker、D1、OAuth、Webhookとは分離する
