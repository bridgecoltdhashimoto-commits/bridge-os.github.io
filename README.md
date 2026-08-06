# BRIDGE Revenue Assurance 4.0

Squareの適格なFAILED決済を、購入者本人の意思による再決済で回収支援する限定pilotサイトです。

## 構成
- `index.html`：サービス説明LP
- `apply.html`：限定pilot申込み
- `terms.html`：利用条件
- `privacy.html`：プライバシーポリシー
- `security.html`：安全性・連携解除
- `legal.html`：事業者表示
- `style.css`：共通デザイン
- `app.js`：申込み内容のメール作成（サーバー保存なし）
- `_headers`：Cloudflare Pages向けセキュリティヘッダー

## 運用
- GitHub `main` を正本とする
- Cloudflare Pagesで公開する
- Square本体Worker、D1、OAuth、Webhookとは分離する
- 実績のない回収率・売上保証は表示しない
