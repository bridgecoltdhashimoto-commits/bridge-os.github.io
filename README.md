# BRIDGE Revenue Assurance 4.0

Squareの適格なFAILED決済を、購入者本人の意思による再決済で回収支援する限定pilotサイトです。

## 方針
- 白基調・国内BtoBサービス向けの信頼性重視デザイン
- 株式会社BRIDGEの運営表示をファーストビューで明示
- Square公式サービスと誤認させない
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
- `app.js`：申込み内容の確認・コピー・メール作成
- `_headers`：Cloudflare Pages向けセキュリティヘッダー

## 運用
- GitHub `main` を正本とする
- Cloudflare Pagesで公開する
- Square本体Worker、D1、OAuth、Webhookとは分離する
