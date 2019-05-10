//above doplugins:
s.pte = 'event1,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11'
s.ptc = false; //this should always be set to false
/*
event1= Redirect Timing (seconds from navigationStart to fetchStart- should be zero if there was no redirect)
event2= App Cache Timing (seconds from fetchStart to domainLookupStart)
event3= DNS Timing (seconds from domainLookupStart to domainLookupEnd)
event4= TCP Timing (seconds from connectStart to connectEnd)
event5= Request Timing (seconds from connectEnd to responseStart) 
event6= Response Timing (seconds from responseStart to responseEnd )
event7= Processing Timing (seconds from domLoading to loadEventStart)
event8= onLoad Timing (seconds from loadEventStart to loadEventEnd)
event9= Total Page Load Time (seconds from navigationStart to loadEventEnd )
event10= Total Time to Interaction (seconds from connectStart to timeToInteraction)
event11= instances (for calculated metric- otherwise you only really get the aggregated seconds, which is fairly meangingless if your traffic fluctuates)
*/



s.usePlugins=true
s.doPlugins=function(s) {
    //if you aren't already setting getPreviousValue on pageName, then you'll want to:
    s.prop1=s.getPreviousValue(s.pageName,'gpv_pn');

    //run performance timing
    //if you want to capture performance entries in a list variable:
    s.performanceTiming("list3")	
    //otherwise, just this will suffice:
    //s.performanceTiming()
}

/*************************** PLUGIN DEFINITIONS ***************************/
/* Plugin: Performance Timing Tracking - 0.11 BETA - with JKunz's changes for Time To Interaction. 
Can you guess which line I changed ;)?*/
s.performanceTiming=new Function("v",""
+"var s=this;if(v)s.ptv=v;if(typeof performance!='undefined'){if(perf"
+"ormance.timing.loadEventEnd==0){s.pi=setInterval(function(){s.perfo"
+"rmanceWrite()},250);}if(!s.ptc||s.linkType=='e'){s.performanceRead("
+");}else{s.rfe();s[s.ptv]='';}}");
s.performanceWrite=new Function("",""
+"var s=this;if(performance.timing.loadEventEnd>0)clearInterval(s.pi)"
+";try{if(s.c_r('s_ptc')==''&&performance.timing.loadEventEnd>0){try{"
+"var pt=performance.timing;var pta='';pta=s.performanceCheck(pt.fetc"
+"hStart,pt.navigationStart);pta+='^^'+s.performanceCheck(pt.domainLo"
+"okupStart,pt.fetchStart);pta+='^^'+s.performanceCheck(pt.domainLook"
+"upEnd,pt.domainLookupStart);pta+='^^'+s.performanceCheck(pt.connect"
+"End,pt.connectStart);pta+='^^'+s.performanceCheck(pt.responseStart,"
+"pt.connectEnd);pta+='^^'+s.performanceCheck(pt.responseEnd,pt.respo"
+"nseStart);pta+='^^'+s.performanceCheck(pt.loadEventStart,pt.domLoad"
+"ing);pta+='^^'+s.performanceCheck(pt.loadEventEnd,pt.loadEventStart"
+");pta+='^^'+s.performanceCheck(pt.loadEventEnd,pt.navigationStart);pta+='^^'+s.performanceCheck(pt.domInteractive, pt.connectStart);"
+"s.c_w('s_ptc',pta);if(sessionStorage&&navigator.cookieEnabled&&s.pt"
+"v!='undefined'){var pe=performance.getEntries();var tempPe='';for(v"
+"ar i=0;i<pe.length;i++){tempPe+='!';tempPe+=pe[i].name.indexOf('?')"
+">-1?pe[i].name.split('?')[0]:pe[i].name;tempPe+='|'+(Math.round(pe["
+"i].startTime)/1000).toFixed(1)+'|'+(Math.round(pe[i].duration)/1000"
+").toFixed(1)+'|'+pe[i].initiatorType;}sessionStorage.setItem('s_pec"
+"',tempPe);}}catch(err){return;}}}catch(err){return;}");
s.performanceCheck=new Function("a","b",""
+"if(a>=0&&b>=0){if((a-b)<60000&&((a-b)>=0)){return((a-b)/1000).toFix"
+"ed(2);}else{return 600;}}");
s.performanceRead=new Function("",""
+"var s=this;if(performance.timing.loadEventEnd>0)clearInterval(s.pi)"
+";var cv=s.c_r('s_ptc');if(s.pte){var ela=s.pte.split(',');}if(cv!='"
+"'){var cva=s.split(cv,'^^');if(cva[1]!=''){for(var x=0;x<(ela.lengt"
+"h-1);x++){s.events=s.apl(s.events,ela[x]+'='+cva[x],',',2);}}s.even"
+"ts=s.apl(s.events,ela[ela.length-1],',',2);}s.linkTrackEvents=s.apl"
+"(s.linkTrackEvents,s.pte,',',2);s.c_w('s_ptc','',0);if(sessionStora"
+"ge&&navigator.cookieEnabled&&s.ptv!='undefined'){s[s.ptv]=sessionSt"
+"orage.getItem('s_pec');sessionStorage.setItem('s_pec','',0);}else{s"
+"[s.ptv]='sessionStorage Unavailable';}s.ptc=true;");
/* Remove from Events 0.1 - Performance Specific, 
removes all performance events from s.events once being tracked. */
s.rfe=new Function("",""
+"var s=this;var ea=s.split(s.events,',');var pta=s.split(s.pte,',');"
+"try{for(x in pta){s.events=s.rfl(s.events,pta[x]);s.contextData['ev"
+"ents']=s.events;}}catch(e){return;}");
/* Plugin Utility - RFL (remove from list) 1.0*/
s.rfl=new Function("l","v","d1","d2","ku",""
+"var s=this,R=new Array(),C='',d1=!d1?',':d1,d2=!d2?',':d2,ku=!ku?0:"
+"1;if(!l)return'';L=l.split(d1);for(i=0;i<L.length;i++){if(L[i].inde"
+"xOf(':')>-1){C=L[i].split(':');C[1]=C[0]+':'+C[1];L[i]=C[0];}if(L[i"
+"].indexOf('=')>-1){C=L[i].split('=');C[1]=C[0]+'='+C[1];L[i]=C[0];}"
+"if(L[i]!=v&&C)R.push(C[1]);else if(L[i]!=v)R.push(L[i]);else if(L[i"
+"]==v&&ku){ku=0;if(C)R.push(C[1]);else R.push(L[i]);}C='';}return s."
+"join(R,{delim:d2})");

//if you don't already have s.apl and s.split, you'll need to add these:
/*
 * Utility Function: split v1.5 - split a string (JS 1.0 compatible)
 */
s.split=new Function("l","d",""
+"var i,x=0,a=new Array;while(l){i=l.indexOf(d);i=i>-1?i:l.length;a[x"
+"++]=l.substring(0,i);l=l.substring(i+d.length);}return a");
/*
 * Plugin Utility: apl v1.1
 */
s.apl=new Function("l","v","d","u",""
+"var s=this,m=0;if(!l)l='';if(u){var i,n,a=s.split(l,d);for(i=0;i<a."
+"length;i++){n=a[i];m=m||(u==1?(n==v):(n.toLowerCase()==v.toLowerCas"
+"e()));}}if(!m)l=l?l+d+v:v;return l");

//if you aren't already setting getPreviousValue on pageName, then you'll want to:
/*
 * Plugin: getPreviousValue_v1.0 - return previous value of designated
 *   variable (requires split utility)
 */
s.getPreviousValue=new Function("v","c","el",""
+"var s=this,t=new Date,i,j,r='';t.setTime(t.getTime()+1800000);if(el"
+"){if(s.events){i=s.split(el,',');j=s.split(s.events,',');for(x in i"
+"){for(y in j){if(i[x]==j[y]){if(s.c_r(c)) r=s.c_r(c);v?s.c_w(c,v,t)"
+":s.c_w(c,'no value',t);return r}}}}}else{if(s.c_r(c)) r=s.c_r(c);v?"
+"s.c_w(c,v,t):s.c_w(c,'no value',t);return r}");