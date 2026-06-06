import"../chunk-8r5jmymq.js";var s=(...r)=>null,D=async()=>{let r={promise:{},resolve:s,reject:s};return await new Promise((e)=>{r.promise=new Promise((p,G)=>{r.resolve=p,r.reject=G,e(null)})}),r},C=(()=>{let r=Symbol("preserved"),e=new Set;return Object.defineProperty(globalThis,r,{value:e,enumerable:!1}),{allowGC:(p)=>(e.delete(p),null),preventGC:(p)=>(e.add(p),null)}})(),m=C.allowGC,x=C.preventGC;export{x as preventGC,s as noop,D as createDeferred,m as allowGC};

//# debugId=2A797A6099467D4864756E2164756E21
