(function(){
  "use strict";
  const form=document.getElementById("contact-form");
  if(!form) return;
  const status=document.getElementById("contact-status");
  const result=document.getElementById("contact-result");
  const preview=document.getElementById("contact-preview");
  const mail=document.getElementById("contact-mail");
  const copy=document.getElementById("contact-copy");
  const note=document.getElementById("contact-note");
  let text="";
  function get(data,key){return String(data.get(key)||"").trim();}
  function recipient(){return ["bridge.co.ltd.hashimoto","gmail.com"].join("@");}
  form.addEventListener("submit",function(event){
    event.preventDefault();
    status.textContent="";
    if(!form.reportValidity()){
      status.textContent="未入力の項目を確認してください。";
      return;
    }
    const data=new FormData(form);
    const category=get(data,"category");
    text=[
      "BRIDGE Revenue Assurance 4.0｜専用お問い合わせ",
      "",
      "お問い合わせ種別: "+category,
      "会社・店舗名: "+get(data,"company"),
      "担当者名: "+get(data,"name"),
      "返信先メール: "+get(data,"email"),
      "",
      "お問い合わせ内容:",
      get(data,"message")
    ].join("\n");
    preview.textContent=text;
    mail.href="mailto:"+recipient()+"?subject="+encodeURIComponent("BRIDGE RA4｜"+category)+"&body="+encodeURIComponent(text);
    result.className="eligibility-result is-visible grade-a";
    result.focus();
    result.scrollIntoView({behavior:"smooth",block:"start"});
  });
  copy.addEventListener("click",async function(){
    if(!text) return;
    try{
      await navigator.clipboard.writeText(text);
      note.textContent="内容をコピーしました。";
    }catch(error){
      const area=document.createElement("textarea");
      area.value=text;
      area.setAttribute("readonly","");
      area.style.position="fixed";
      area.style.opacity="0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      note.textContent="内容をコピーしました。";
    }
  });
})();
