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
      "BRIDGE Revenue Assurance 4.0 限定pilot対象確認申込み",
      "",
      "会社・店舗名: "+String(d.get("company")||""),
      "担当者名: "+String(d.get("name")||""),
      "メール: "+String(d.get("email")||""),
      "月間Square決済額: "+String(d.get("volume")||""),
      "主な決済形態: "+String(d.get("payment_type")||""),
      "FAILED決済の発生状況: "+String(d.get("failed")||""),
      "購入者への連絡情報: "+String(d.get("contactability")||""),
      "補足: "+String(d.get("note")||"なし"),
      "",
      "確認事項:",
      "- 限定pilot利用条件・プライバシーポリシー確認済み",
      "- 回収成功額の8％成果報酬を確認済み",
      "- 無断再課金なし・回収保証なしを確認済み"
    ].join("\n");
  }

  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(!form.reportValidity()) return;
    applicationText=buildApplication();
    previewText.textContent=applicationText;
    const subject=encodeURIComponent("Revenue Assurance 4.0 限定pilot対象確認");
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
