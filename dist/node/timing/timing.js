import"../chunk-hwenktbz.js";var j=(F,A=0,y=1)=>{for(let N=0;N<A;N++)F();let p,P=performance.now();for(let N=0;N<y;N++)p=F();return[(performance.now()-P)/y,p]},O=Object.assign((F)=>{let A=performance.now(),y=Number.isFinite(+F)?+F:0;return y<0&&(y=0),y>2147483647&&(y=0),new Promise((p)=>{setTimeout(()=>p(performance.now()-A),y)})},{sync:(F)=>{let A=performance.now(),y=Number.isFinite(+F)?+F:0,p=0;y<0&&(y=0),y>2147483647&&(y=0);while((p=performance.now()-A)<y);return p}});export{j as time,O as sleep};

//# debugId=AA36F383FF1C111464756E2164756E21
