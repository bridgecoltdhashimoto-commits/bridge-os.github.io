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
    payment_type:{recurring:"会費・月謝・定期サービス",invoice:"請求書での支払い",advance:"予約前・利用前の支払い",online:"ネットでの支払い",mixed:"店頭と店頭以外の両方",pos:"店頭での支払いが中心"},
    volume:{under100:"100万円未満","100to500":"100万〜500万円","500to1000":"500万〜1,000万円",over1000:"1,000万円以上",unknown:"分からない"},
    failed:{monthly:"毎月ある",sometimes:"時々ある",unknown:"分からない",rare:"ほとんどない"},
    contactability:{most:"多くのお客様へ送れる",some:"一部のお客様へ送れる",none:"送れない・分からない"}
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
      score+=3; positive.push("店頭以外での支払いを多く使っています");
    }else if(payment==="mixed"){
      score+=1; positive.push("店頭以外での支払いも使っています");
    }else{
      concerns.push("店頭での支払いが中心です");
    }

    if(volume==="over1000"){
      score+=3; positive.push("店頭以外のSquare売上が月1,000万円以上です");
    }else if(volume==="500to1000"){
      score+=2; positive.push("店頭以外のSquare売上が月500万円以上です");
    }else if(volume==="100to500"){
      score+=1; positive.push("店頭以外でもSquare売上があります");
    }else{
      concerns.push("店頭以外のSquare売上が少ない、または分かりません");
    }

    if(failed==="monthly"){
      score+=3; positive.push("支払い失敗が毎月あります");
    }else if(failed==="sometimes"){
      score+=2; positive.push("支払い失敗が時々あります");
    }else if(failed==="unknown"){
      concerns.push("支払い失敗があるか分かりません");
    }else{
      concerns.push("支払い失敗がほとんどありません");
    }

    if(contact==="most"){
      score+=3; positive.push("多くのお客様へ案内を送れます");
    }else if(contact==="some"){
      score+=1; positive.push("一部のお客様へ案内を送れます");
    }else{
      concerns.push("お客様へ支払い案内を送れません");
    }

    if(contact==="none" || payment==="pos" || failed==="rare") return {grade:"C",positive,concerns};
    if(score>=9) return {grade:"A",positive,concerns};
    if(score>=5) return {grade:"B",positive,concerns};
    return {grade:"C",positive,concerns};
  }

  function buildApplication(data,assessment){
    return [
      "BRIDGE Revenue Assurance 4.0｜利用確認",
      "",
      "確認結果: "+assessment.grade,
      "会社・店舗名: "+value(data,"company"),
      "担当者名: "+value(data,"name"),
      "メール: "+value(data,"email"),
      "Squareの主な使い方: "+label("payment_type",value(data,"payment_type")),
      "毎月の店頭以外のSquare売上: "+label("volume",value(data,"volume")),
      "支払い失敗の回数: "+label("failed",value(data,"failed")),
      "お客様への連絡: "+label("contactability",value(data,"contactability")),
      "",
      "確認した内容:",
      "- 利用条件と個人情報の取扱い",
      "- 取り戻せた時だけ8％",
      "- 保存カードへの勝手な再請求なし",
      "- 必ず取り戻せる保証はなし"
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
      status.textContent="入力していない項目があります。";
      return;
    }

    const data=new FormData(form);
    const assessment=evaluate(data);
    applicationText=buildApplication(data,assessment);
    result.className="eligibility-result is-visible grade-"+assessment.grade.toLowerCase();
    badge.textContent=assessment.grade==="A"?"使える可能性が高い":assessment.grade==="B"?"もう少し確認が必要":"今は向いていない可能性";

    if(assessment.grade==="A"){
      title.textContent="使える可能性が高いです。";
      message.textContent="支払いの方法、支払い失敗の回数、お客様へ案内できる条件がそろっています。";
      note.textContent="確認結果をメールで送ると、内容を確認したうえで次の手順をご案内します。";
      actions.hidden=false;
    }else if(assessment.grade==="B"){
      title.textContent="もう少し確認が必要です。";
      message.textContent="使える可能性はありますが、対象になる支払いの量や、お客様へ案内できる範囲を確認する必要があります。";
      note.textContent="確認結果をメールで送ると、決まった基準で確認します。電話や個別相談はありません。";
      actions.hidden=false;
    }else{
      title.textContent="今の条件では向いていない可能性があります。";
      message.textContent="支払い失敗、お客様への連絡、店頭以外での支払いのどれかが足りません。";
      note.textContent="条件が変わった時は、もう一度確認できます。";
      actions.hidden=true;
    }

    renderReasons(assessment);
    const subject=encodeURIComponent("BRIDGE Revenue Assurance 4.0｜利用確認");
    mailLink.href="mailto:"+recipient()+"?subject="+subject+"&body="+encodeURIComponent(applicationText);
    result.focus();
    result.scrollIntoView({behavior:"smooth",block:"start"});
  });

  copyButton.addEventListener("click",async function(){
    if(!applicationText) return;
    try{
      await navigator.clipboard.writeText(applicationText);
      note.textContent="内容をコピーしました。";
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
      note.textContent="内容をコピーしました。";
    }
  });
})();