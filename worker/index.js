// Cloudflare Worker: R2 media endpoint for the BuiltEnvWebsite admin dashboard.
// PUT  /<key>   -> store object in R2, returns { key, url }
// DELETE /<key> -> remove object from R2
// Auth: Authorization: Bearer <UPLOAD_TOKEN>
const CORS={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':'Authorization, Content-Type'
};

function json(data,status){
  return new Response(JSON.stringify(data),{status:status||200,headers:{'Content-Type':'application/json',...CORS}});
}

export default {
  async fetch(request,env){
    if(request.method==='OPTIONS')return new Response(null,{headers:CORS});
    const token=env.UPLOAD_TOKEN||'';
    const auth=request.headers.get('Authorization')||'';
    if(!token||auth!=='Bearer '+token)return json({error:'Unauthorized'},401);
    const url=new URL(request.url);
    const key=decodeURIComponent(url.pathname.replace(/^\/+/,''));
    if(!key||key.includes('..'))return json({error:'Missing key'},400);
    if(request.method==='PUT'){
      await env.BUCKET.put(key,request.body,{
        httpMetadata:{contentType:request.headers.get('Content-Type')||'application/octet-stream'}
      });
      const base=(env.PUBLIC_BASE||'').replace(/\/+$/,'');
      return json({key:key,url:base?base+'/'+key:key});
    }
    if(request.method==='DELETE'){
      await env.BUCKET.delete(key);
      return json({ok:true,key:key});
    }
    return json({error:'Method not allowed'},405);
  }
};