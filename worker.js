// Cloudflare Worker — keep OPENAI_API_KEY in Worker Secrets, never in GitHub.
const ALLOWED_ORIGIN = 'https://lifesaver-maker.github.io';
const cors = {'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8',...cors,'Cache-Control':'no-store'}});
export default {async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(origin!==ALLOWED_ORIGIN)return json({error:'허용되지 않은 사이트입니다.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(request.method!=='POST')return json({error:'POST 요청만 허용됩니다.'},405);
  const size=Number(request.headers.get('content-length')||0);
  if(size>2000)return json({error:'요청이 너무 큽니다.'},413);
  let body;try{body=await request.json()}catch{return json({error:'JSON 요청이 필요합니다.'},400)}
  const word=String(body?.word||'').trim();
  if(!/^[A-Za-z][A-Za-z '-]{0,49}$/.test(word))return json({error:'영어 단어 또는 짧은 영어 표현만 입력하세요.'},400);
  if(!env.OPENAI_API_KEY)return json({error:'서버에 OPENAI_API_KEY가 설정되지 않았습니다.'},503);
  const instructions='You are a precise English vocabulary tutor for Korean learners. Return JSON only. Provide a natural Korean meaning and exactly ten distinct natural English example sentences for the given word/phrase, each with accurate Korean translation and concise Korean usage/grammar explanation. Use the target word naturally in each sentence. Avoid dubious or unnatural examples. Format: {"meaning":"...","examples":[{"en":"...","ko":"...","explanation":"..."}]}';
  let upstream;try{upstream=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4.1-mini',instructions,input:`Target English word or phrase: ${word}`,max_output_tokens:3000,text:{format:{type:'json_schema',name:'vocabulary_examples',strict:true,schema:{type:'object',additionalProperties:false,required:['meaning','examples'],properties:{meaning:{type:'string'},examples:{type:'array',minItems:10,maxItems:10,items:{type:'object',additionalProperties:false,required:['en','ko','explanation'],properties:{en:{type:'string'},ko:{type:'string'},explanation:{type:'string'}}}}}}}}})})}catch{return json({error:'AI 서비스에 연결하지 못했습니다.'},502)}
  if(!upstream.ok){const err=await upstream.json().catch(()=>({}));return json({error:`AI 요청 실패 (${upstream.status}): ${err.error?.message||'계정 설정 또는 사용 한도를 확인하세요.'}`},502)}
  const result=await upstream.json();
  const output=(result.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');
  let data;try{data=JSON.parse(output)}catch{return json({error:'AI가 올바른 데이터를 반환하지 않았습니다.'},502)}
  if(!data||typeof data.meaning!=='string'||!Array.isArray(data.examples)||data.examples.length!==10)return json({error:'예문 생성 결과를 확인할 수 없습니다.'},502);
  return json(data);
}};
