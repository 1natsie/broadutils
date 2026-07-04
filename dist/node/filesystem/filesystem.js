import"../chunk-hwenktbz.js";import{open as B}from"node:fs/promises";var L=async function*(t,R){let S=await B(t),r=await S.stat().catch((m)=>{throw S.close(),m});try{let m=R?.offset??0,w=R?.length==null?r.size:m+Math.floor(R.length),x=R?.chunkSize??16384;if(m>=r.size)throw RangeError("Offset out of range.");if(w>r.size)w=r.size;if(w<m)throw RangeError("Invalid end offset.");while(m<w){let O=Math.min(x,w-m),z=await S.read(Buffer.allocUnsafe(O),0,O,m);m+=z.bytesRead,yield z.buffer}}finally{await S.close()}};export{L as betterReadStream};

//# debugId=CC8486A2337F33E464756E2164756E21
