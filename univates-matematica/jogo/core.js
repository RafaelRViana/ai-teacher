(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OMUCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function shuffle(arr,rng=Math.random){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function makeSession(questions,topics,mode,topic,minutes,now=Date.now(),rng=Math.random){
  if(!['treino','panorama','simulado'].includes(mode))throw Error('Modo inválido');
  let chosen;
  if(mode==='treino'){chosen=shuffle(questions.filter(q=>q.topico===topic),rng);if(!chosen.length)throw Error('Tópico sem questões');}
  else{const ts=shuffle(topics,rng).slice(0,mode==='simulado'?10:12);chosen=ts.map(t=>shuffle(questions.filter(q=>q.topico===t.slug),rng)[0]);}
  return {version:1,mode,topic,startedAt:now,expiresAt:minutes>0?now+minutes*60000:null,deck:chosen.map(q=>({id:q.id,order:shuffle([0,1,2,3],rng)})),answers:chosen.map(()=>null),locked:chosen.map(()=>false),notes:chosen.map(()=>''),index:0,required:mode==='simulado'?8:chosen.length,finished:false,expired:false};
 }
 function answered(s){return s.answers.filter(a=>a!==null).length;}
 function answer(s,index,option){if(s.finished||s.locked[index])return false;if(option!==null&&![0,1,2,3].includes(option))return false;if(option!==null&&s.answers[index]===null&&answered(s)>=s.required)return false;s.answers[index]=option;return true;}
 function score(s,questions){const byid=Object.fromEntries(questions.map(q=>[q.id,q]));let correct=0;const topics={};const items=s.deck.map((d,i)=>{const q=byid[d.id],a=s.answers[i],ok=a!==null&&a===q.correta;const assessed=s.mode!=='simulado'||a!==null;if(ok)correct++;if(assessed){if(!topics[q.topico])topics[q.topico]={correct:0,total:0};topics[q.topico].total++;if(ok)topics[q.topico].correct++;}return {q,answer:a,ok,assessed};});return {correct,total:s.required,answered:answered(s),percent:Math.round(100*correct/s.required),points:100*correct,topics,items};}
 function valid(s,questions){if(!s||s.version!==1||!['treino','panorama','simulado'].includes(s.mode)||!Array.isArray(s.deck)||!Array.isArray(s.answers)||!Array.isArray(s.locked)||!Array.isArray(s.notes))return false;const ids=new Set(questions.map(q=>q.id));const n=s.mode==='treino'?5:s.mode==='panorama'?12:10;return s.deck.length===n&&s.answers.length===n&&s.locked.length===n&&s.notes.length===n&&new Set(s.deck.map(d=>d.id)).size===n&&s.deck.every(d=>ids.has(d.id)&&Array.isArray(d.order)&&d.order.slice().sort().join('')==='0123')&&s.answers.every(a=>a===null||[0,1,2,3].includes(a))&&Number.isInteger(s.index)&&s.index>=0&&s.index<n&&s.required===(s.mode==='simulado'?8:n)&&answered(s)<=s.required&&(s.expiresAt===null||Number.isFinite(s.expiresAt));}
 return {shuffle,makeSession,answered,answer,score,valid};
});
