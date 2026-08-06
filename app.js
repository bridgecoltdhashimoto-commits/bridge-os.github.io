(function(){
  "use strict";
  const form=document.getElementById("pilot-form");
  if(!form) return;
  const status=document.getElementById("form-status");
  const preview=document.getElementById("application-preview");
  const previewText=document.getElementById("preview-text");
  const copyButton=document.getElementById("copy-application");
  const mailLink=document.getElementById("open-mail");
  let applicationText="";

  function buildApplication(){
    const d=new FormData(form);
    return [
      "Square 支払い失敗 回収サポート｜無料対象確認",
      "",
      "会社・店舗名: "+String(d.get("company")||""),
      "担当者名: "+String(d.get("name")||""),
      "メール: "+String(d.get("email")||""),
      "毎月のSquare売上: "+String(d.get("volume")||""),
      "主な支払い方法: "+String(d.get("payment_type")||""),
      "支払い失敗の状況: "+String(d.get("failed")||""),
      "お客様への連絡可否: "+String(d.get("contactability")||""),
      "補足: "+String(d.get("note")||"なし"),
      "",
      "確認事項:",
      "- 利用条件と個人情報の取扱いを確認済み",
      "- 回収できた場合だけ、回収額の8％が費用となることを確認済み",
      "- 勝手な再請求なし・回収保証なしを確認済み"
    ].join("\n");
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(!form.reportValidity()) return;
    applicationText=buildApplication();
    previewText.textContent=applicationText;
    const subject=encodeURIComponent("Square 支払い失敗 回収サポート｜無料対象確認");
    mailLink.href="mailto:bridge.co.ltd.hashimoto@gmail.com?subject="+subject+"&body="+encodeURIComponent(applicationText);
    preview.classList.add("is-visible");
    status.textContent="入力内容を作成しました。内容を確認してメールを送信してください。";
    preview.scrollIntoView({behavior:"smooth",block:"start"});
  });

  copyButton.addEventListener("click",async function(){
    if(!applicationText) return;
    try{
      await navigator.clipboard.writeText(applicationText);
      status.textContent="申込み内容をコピーしました。";
    }catch(_){
      const area=document.createElement("textarea");
      area.value=applicationText;
      area.setAttribute("readonly","");
      area.style.position="fixed";
      area.style.opacity="0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      status.textContent="申込み内容をコピーしました。";
    }
  });
})();
