(function(){
  "use strict";

  const form=document.getElementById("eligibility-form");
  if(!form) return;

  const status=document.getElementById("form-status");
  const result=document.getElementById("eligibility-result");
  const badge=document.getElementById("result-badge");
  const title=document.getElementById("result-title");
  const message=document.getElementById("result-message");
  const reasons=document.getElementById("result-reasons");
  const actions=document.getElementById("eligible-actions");
  const note=document.getElementById("result-note");
  const mailLink=document.getElementById("open-mail");
  const copyButton=document.getElementById("copy-application");
  let applicationText="";

  const labels={
    payment_type:{recurring:"会費・月謝・継続サービス",invoice:"定期送信・通常の請求書",advance:"予約・事前決済",online:"オンラインサービス",mixed:"店頭と非対面を併用",pos:"店頭決済が中心"},
    volume:{under100:"100万円未満","100to500":"100万〜500万円","500to1000":"500万〜1,000万円",over1000:"1,000万円以上",unknown:"分からない"},
    failed:{monthly:"毎月ある",sometimes:"時々ある",unknown:"分からない",rare:"ほとんどない"},
    contactability:{most:"多くの取引でできる",some:"一部の取引でできる",none:"できない・分からない"}
  };

  function value(data,key){return String(data.get(key)||"");}
  function label(group,key){return labels[group][key]||key;}
  function recipient(){return ["bridge.co.ltd.hashimoto","gmail.com"].join("@");}

  function evaluate(data){
    const payment=value(data,"payment_type");
    const volume=value(data,"volume");
    const failed=value(data,"failed");
    const contact=value(data,"contactability");
    let score=0;
    const positive=[];
    const concerns=[];

    if(["recurring","invoice","advance","online"].includes(payment)){
      score+=3; positive.push("非対面・継続型の決済が中心です");
    }else if(payment==="mixed"){
      score+=1; positive.push("非対面決済を一部利用しています");
    }else{
      concerns.push("店頭決済が中心です");
    }

    if(volume==="over1000"){
      score+=3; positive.push("非対面売上が月1,000万円以上です");
    }else if(volume==="500to1000"){
      score+=2; positive.push("非対面売上が月500万円以上です");
    }else if(volume==="100to500"){
      score+=1; positive.push("一定の非対面売上があります");
    }else{
      concerns.push("非対面売上が少ない、または未確認です");
    }

    if(failed==="monthly"){
      score+=3; positive.push("支払い失敗が毎月発生しています");
    }else if(failed==="sometimes"){
      score+=2; positive.push("支払い失敗が時々発生しています");
    }else if(failed==="unknown"){
      concerns.push("支払い失敗の発生状況が未確認です");
    }else{
      concerns.push("支払い失敗がほとんどありません");
    }

    if(contact==="most"){
      score+=3; positive.push("多くの購入者へ連絡できます");
    }else if(contact==="some"){
      score+=1; positive.push("一部の購入者へ連絡できます");
    }else{
      concerns.push("購入者へ再決済を案内できません");
    }

    if(contact==="none" || payment==="pos" || failed==="rare"){
      return {grade:"C",positive,concerns};
    }
    if(score>=9){return {grade:"A",positive,concerns};}
    if(score>=5){return {grade:"B",positive,concerns};}
    return {grade:"C",positive,concerns};
  }

  function buildApplication(data,assessment){
    return [
      "BRIDGE Revenue Assurance 4.0｜利用対象確認",
      "",
      "自動判定: "+assessment.grade,
      "会社・店舗名: "+value(data,"company"),
      "担当者名: "+value(data,"name"),
      "メール: "+value(data,"email"),
      "主なSquare利用: "+label("payment_type",value(data,"payment_type")),
      "毎月の非対面Square売上: "+label("volume",value(data,"volume")),
      "支払い失敗の頻度: "+label("failed",value(data,"failed")),
      "購入者への連絡: "+label("contactability",value(data,"contactability")),
      "",
      "確認済み:",
      "- 利用条件と個人情報の取扱い",
      "- 回収成功時のみ8％",
      "- 保存カードへの無断再請求なし",
      "- 回収保証なし"
    ].join("\n");
  }

  function renderReasons(assessment){
    reasons.innerHTML="";
    const items=assessment.positive.concat(assessment.concerns);
    items.slice(0,5).forEach(function(text,index){
      const li=document.createElement("li");
      li.textContent=text;
      li.className=index<assessment.positive.length?"reason-positive":"reason-concern";
      reasons.appendChild(li);
    });
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    status.textContent="";
    if(!form.reportValidity()){
      status.textContent="未入力の項目を確認してください。";
      return;
    }

    const data=new FormData(form);
    const assessment=evaluate(data);
    applicationText=buildApplication(data,assessment);
    result.className="eligibility-result is-visible grade-"+assessment.grade.toLowerCase();
    badge.textContent=assessment.grade==="A"?"優先対象候補":assessment.grade==="B"?"限定確認対象":"現在は対象外の可能性";

    if(assessment.grade==="A"){
      title.textContent="利用対象となる可能性が高いです。";
      message.textContent="定期請求・非対面売上・支払い失敗・購入者への連絡条件がそろっています。次の確認へ進めます。";
      note.textContent="メール送信後、定型基準で内容を確認し、対象候補の場合のみ次の手順をご案内します。";
      actions.hidden=false;
    }else if(assessment.grade==="B"){
      title.textContent="条件を限定して確認する対象です。";
      message.textContent="一部の条件は合っていますが、対象となる取引量や連絡可能な取引を確認する必要があります。";
      note.textContent="メール送信後、定型基準で確認します。個別相談・電話対応は行いません。";
      actions.hidden=false;
    }else{
      title.textContent="現在の条件では利用対象になりにくい状態です。";
      message.textContent="再決済案内に必要な支払い失敗、非対面決済、購入者への連絡条件のいずれかが不足しています。";
      note.textContent="条件が変わった場合は、再度このフォームで判定できます。";
      actions.hidden=true;
    }

    renderReasons(assessment);
    const subject=encodeURIComponent("BRIDGE Revenue Assurance 4.0｜利用対象確認");
    mailLink.href="mailto:"+recipient()+"?subject="+subject+"&body="+encodeURIComponent(applicationText);
    result.focus();
    result.scrollIntoView({behavior:"smooth",block:"start"});
  });

  copyButton.addEventListener("click",async function(){
    if(!applicationText) return;
    try{
      await navigator.clipboard.writeText(applicationText);
      note.textContent="判定内容をコピーしました。";
    }catch(error){
      const area=document.createElement("textarea");
      area.value=applicationText;
      area.setAttribute("readonly","");
      area.style.position="fixed";
      area.style.opacity="0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      note.textContent="判定内容をコピーしました。";
    }
  });
})();
