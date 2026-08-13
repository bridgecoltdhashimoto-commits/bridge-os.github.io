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
  const outstandingSelect=form.elements.outstanding_after_square;
  const unpaidCount=form.elements.unpaid_count;
  const unpaidTotal=form.elements.unpaid_total;
  let applicationText="";

  const labels={
    square_active:{yes:"現在利用している",no:"現在利用していない",unknown:"分からない"},
    payment_type:{recurring:"会費・月謝・定期サービス",invoice:"請求書での支払い",advance:"予約前・利用前の支払い",ecommerce:"ネット通販・ECサイトでの販売",online:"オンラインサービスの支払い",mixed:"店頭と店頭以外の両方",pos:"店頭での支払いが中心"},
    outstanding_after_square:{yes:"ある",no:"ない",unknown:"分からない"},
    dispute:{none:"争いはない",some:"争いがあるものを含む",unknown:"分からない"},
    settled_excluded:{yes:"はい",no:"いいえ",unknown:"分からない"},
    contactability:{most:"対象のお客様へ案内できる",some:"一部のみ案内できる",none:"案内できない・分からない"}
  };

  function value(data,key){return String(data.get(key)||"");}
  function label(group,key){return labels[group][key]||key||"未回答";}
  function recipient(){return ["bridge.co.ltd.hashimoto","gmail.com"].join("@");}
  function numberValue(data,key){
    const n=Number(value(data,key));
    return Number.isFinite(n)?n:0;
  }
  function yen(n){return Math.round(n).toLocaleString("ja-JP")+"円";}

  function syncUnpaidFields(){
    const needsAmounts=outstandingSelect && outstandingSelect.value==="yes";
    if(unpaidCount) unpaidCount.required=needsAmounts;
    if(unpaidTotal) unpaidTotal.required=needsAmounts;
    if(!needsAmounts){
      if(unpaidCount) unpaidCount.value="";
      if(unpaidTotal) unpaidTotal.value="";
    }
  }

  if(outstandingSelect){
    outstandingSelect.addEventListener("change",syncUnpaidFields);
    syncUnpaidFields();
  }

  function evaluate(data){
    const square=value(data,"square_active");
    const payment=value(data,"payment_type");
    const outstanding=value(data,"outstanding_after_square");
    const count=numberValue(data,"unpaid_count");
    const total=numberValue(data,"unpaid_total");
    const dispute=value(data,"dispute");
    const settled=value(data,"settled_excluded");
    const contact=value(data,"contactability");
    const positive=[];
    const concerns=[];

    if(square==="yes") positive.push("現在Squareを事業で利用しています");
    else concerns.push(square==="no"?"現在Squareを利用していません":"現在のSquare利用状況を確認できません");

    if(["recurring","invoice","advance","ecommerce","online"].includes(payment)){
      positive.push("店頭以外で支払いが発生する決済構造です");
    }else if(payment==="mixed"){
      positive.push("店頭以外でのSquare利用もあります");
    }else{
      concerns.push("店頭決済が中心です");
    }

    if(outstanding==="yes"){
      positive.push("Squareの案内後も未回収が残っています");
      if(count>0) positive.push("未回収件数を確認できます（概算"+Math.round(count)+"件）");
      else concerns.push("未回収件数を確認できません");
      if(total>0) positive.push("未回収総額を確認できます（概算"+yen(total)+"）");
      else concerns.push("未回収総額を確認できません");
    }else{
      concerns.push(outstanding==="no"?"Squareの案内後に残っている未回収はありません":"Squareの案内後も未回収が残っているか確認できません");
    }

    if(dispute==="none") positive.push("金額についてお客様との争いはありません");
    else concerns.push(dispute==="some"?"金額について争いがある取引を含みます":"金額について争いがないか確認できません");

    if(settled==="yes") positive.push("支払い済み・返金済みを除外できます");
    else concerns.push(settled==="no"?"支払い済み・返金済みを確実に除外できません":"支払い済み・返金済みを除外できるか確認できません");

    if(contact==="most") positive.push("対象のお客様へ正当に支払い案内できます");
    else if(contact==="some") positive.push("一部の対象のお客様へ正当に支払い案内できます");
    else concerns.push("対象のお客様へ支払い案内できません");

    const safetyPass=(square==="yes" && outstanding==="yes" && count>0 && total>0 && dispute==="none" && settled==="yes" && contact!=="none");
    if(!safetyPass) return {grade:"C",positive,concerns,total,count};

    const suitableStructure=["recurring","invoice","advance","ecommerce","online","mixed"].includes(payment);
    return {grade:suitableStructure?"A":"B",positive,concerns,total,count};
  }

  function buildApplication(data,assessment){
    return [
      "BRIDGE Revenue Assurance 4.0｜無料対象確認",
      "",
      "確認結果: "+assessment.grade,
      "会社・店舗名: "+value(data,"company"),
      "メール: "+value(data,"email"),
      "現在のSquare利用: "+label("square_active",value(data,"square_active")),
      "Squareの主な使い方: "+label("payment_type",value(data,"payment_type")),
      "Squareの案内後も未回収: "+label("outstanding_after_square",value(data,"outstanding_after_square")),
      "過去30日程度の未回収件数（概算）: "+(assessment.count>0?Math.round(assessment.count)+"件":"未確認"),
      "過去30日程度の未回収総額（概算）: "+(assessment.total>0?yen(assessment.total):"未確認"),
      "金額についての争い: "+label("dispute",value(data,"dispute")),
      "支払い済み・返金済みの除外: "+label("settled_excluded",value(data,"settled_excluded")),
      "対象顧客への支払い案内: "+label("contactability",value(data,"contactability")),
      "",
      "※カード情報・Squareのパスワード・Payment ID等は送っていません。",
      "※この確認だけでは費用・Square接続・支払い処理は始まりません。"
    ].join("\n");
  }

  function renderReasons(assessment){
    reasons.innerHTML="";
    const items=[];
    assessment.positive.slice(0,4).forEach(function(text){items.push({text:text,positive:true});});
    assessment.concerns.slice(0,2).forEach(function(text){items.push({text:text,positive:false});});
    items.forEach(function(item){
      const li=document.createElement("li");
      li.textContent=item.text;
      li.className=item.positive?"reason-positive":"reason-concern";
      reasons.appendChild(li);
    });
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    status.textContent="";
    syncUnpaidFields();
    if(!form.reportValidity()){
      status.textContent="入力していない項目があります。";
      return;
    }

    const data=new FormData(form);
    const assessment=evaluate(data);
    applicationText=buildApplication(data,assessment);
    result.className="eligibility-result is-visible grade-"+assessment.grade.toLowerCase();
    badge.textContent=assessment.grade==="A"?"対象候補です":assessment.grade==="B"?"もう少し確認が必要":"今は対象外の可能性があります";

    if(assessment.grade==="A"){
      title.textContent="対象候補です。内容を確認します。";
      message.textContent="未回収の実在、安全性、お客様への案内条件が確認できています。未回収金額は利用可否の足切りではなく、Pilot候補の優先順位を決める材料として確認します。";
      note.textContent="次へ進む場合は、確認結果をメールアプリから送信してください。この段階ではSquareとの接続は行いません。";
      actions.hidden=false;
    }else if(assessment.grade==="B"){
      title.textContent="対象になる可能性があります。";
      message.textContent="安全条件は確認できていますが、決済の使い方をもう少し確認する必要があります。";
      note.textContent="次へ進む場合は、確認結果をメールアプリから送信してください。未回収額が小さいことだけで自動的に対象外にはしません。";
      actions.hidden=false;
    }else{
      title.textContent="今の条件では対象外の可能性があります。";
      message.textContent="Square利用、未回収の実在、争いの有無、支払い済み・返金済みの除外、連絡可否のいずれかを確認できません。";
      note.textContent="条件が変わった時は、もう一度確認できます。カード情報やSquareのパスワードは送らないでください。";
      actions.hidden=true;
    }

    renderReasons(assessment);
    const subject=encodeURIComponent("BRIDGE Revenue Assurance 4.0｜無料対象確認");
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