//above doplugins:
s.performanceTimingEventList = 'event1,event2,event3,event4,event5,event6,event7,event8,event9,event10,event11'
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

s.performanceTimingController = false; //this should always be set to false; it's used to make sure the plugin only runs on certain types of beacons

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
/************************************************************** KINDA PRETTIFIED ************************************************************/
s.performanceTiming=function(listVar){
    var s=this;
    if(listVar)s.performanceTimingVariable=listVar;
    if(typeof performance!='undefined'){
        if(performance.timing.loadEventEnd==0){
           s.performanceInterval=setInterval(function(){
                s.performanceWrite()
            },250);
        }if(!s.performanceTimingController||s.linkType=='e'){
            s.performanceRead();
        }else{
            s.removePerformanceEventsFromList();s[s.performanceTimingVariable]='';
        }
    }
}
s.performanceWrite = function () {
        var s = this;
        if (performance.timing.loadEventEnd > 0) clearInterval(s.performanceInterval);
        try {
            if (s.c_r('s_ptc') == '' && performance.timing.loadEventEnd > 0) {
                try {
                    var performanceTiming = performance.timing;
                    var performanceTimingArray = '';
                    performanceTimingArray = s.performanceCheck(performanceTiming.fetchStart, performanceTiming.navigationStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.domainLookupStart, performanceTiming.fetchStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.domainLookupEnd, performanceTiming.domainLookupStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.connectEnd, performanceTiming.connectStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.responseStart, performanceTiming.connectEnd);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.responseEnd, performanceTiming.responseStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.loadEventStart, performanceTiming.domLoading);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.loadEventEnd, performanceTiming.loadEventStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.loadEventEnd, performanceTiming.navigationStart);
                    performanceTimingArray += '^^' + s.performanceCheck(performanceTiming.domInteractive, performanceTiming.connectStart);
                    s.c_w('s_ptc', performanceTimingArray);
                    if (sessionStorage && navigator.cookieEnabled && s.performanceTimingVariable != 'undefined') {
                        var performanceEntries = performance.getEntries();
                        var tempPeArray = [];
                        for (var i = 0; i < performanceEntries.length; i++) {
                            tempPe = performanceEntries[i].name.indexOf('?') > -1 ? performanceEntries[i].name.split('?')[0] : performanceEntries[i].name;
                            tempPe += '|' + (Math.round(performanceEntries[i].startTime) / 1000).toFixed(1) + '|' + (Math.round(performanceEntries[i].duration) / 1000).toFixed(1) + '|' + performanceEntries[i].initiatorType;
                            tempPeArray.push(tempPe)
                        }
                        sessionStorage.setItem('s_pec', tempPeArray.join("!"));
                    }
                } catch (err) {
                    return;
                }
            }
        } catch (err) {
            return;
        }
}
s.performanceCheck=function(endPoint,startPoint){
    if(endPoint>=0&&startPoint>=0){
        if((endPoint-startPoint)<60000&&((endPoint-startPoint)>=0)){
            return((endPoint-startPoint)/1000).toFixed(2);
        }else{
            return 600;
        }
    }
}

s.performanceRead=function(){
    var s = this;
    if (performance.timing.loadEventEnd > 0) clearInterval(s.performanceInterval)
    var readSptcCookie = s.c_r('s_ptc');
    if (s.performanceTimingEventList) {
        var entriesListArray = s.performanceTimingEventList.split(',');
    }
    if (readSptcCookie != '') {
        var cookieValueArray = s.split(readSptcCookie, '^^');
        if (cookieValueArray[1] != '') {
            for (var x = 0; x < (entriesListArray.length - 1); x++) {
                s.events = s.apl(s.events, entriesListArray[x] + '=' + cookieValueArray[x], ',', 2);
            }
        }
        s.events = s.apl(s.events, entriesListArray[entriesListArray.length - 1], ',', 2);
    }
    s.linkTrackEvents = s.apl(s.linkTrackEvents, s.performanceTimingEventList, ',', 2);
    s.c_w('s_ptc', '', 0);
    if (sessionStorage && navigator.cookieEnabled && s.performanceTimingVariable != 'undefined') {
        s[s.performanceTimingVariable] = sessionStorage.getItem('s_pec');
        sessionStorage.setItem('s_pec', '', 0);
    } else {
        s[s.performanceTimingVariable] = 'sessionStorage Unavailable';
    }
    s.performanceTimingController = true;
}

/* Remove from Events 0.1 - Performance Specific, 
removes all performance events from s.events once being tracked. */
s.removePerformanceEventsFromList=function(){
    var s = this;
    var eventsArray = s.split(s.events, ',');
    var performanceTimingArrayLocal = s.split(s.performanceTimingEventList, ',');
    try {
        for (x in performanceTimingArrayLocal) {
            s.events = s.removeFromList(s.events, performanceTimingArrayLocal[x]);
            s.contextData['events'] = s.events; //WHY CONTEXT DATA AND NOT S.EVENTS; WHY HAVE EVENTS ARRAY UP THERE?
        }
    } catch (e) {
        return;
    }
}

/* Plugin Utility - RFL (remove from list) 1.0*/
s.removeFromList=function(list,Vvariable,delimiter1,delimiter2,ku){
    var s = this,
        placeholderArray = new Array(),
        variableHadExtras = '',
        delimiter1 = !delimiter1 ? ',' : delimiter1,
        delimiter2 = !delimiter2 ? ',' : delimiter2,
        ku = !ku ? 0 : 1;
    if (!list) return '';
    listArray = list.split(delimiter1);
    for (i = 0; i < listArray.length; i++) {
        if (listArray[i].indexOf(':') > -1) {//remove serialization to get just the event number
            variableHadExtras = listArray[i].split(':');
            variableHadExtras[1] = variableHadExtras[0] + ':' + variableHadExtras[1];
            listArray[i] = variableHadExtras[0];
        }
        if (listArray[i].indexOf('=') > -1) {//remove numeric event to get just the event number
            variableHadExtras = listArray[i].split('=');
            variableHadExtras[1] = variableHadExtras[0] + '=' + variableHadExtras[1];
            listArray[i] = variableHadExtras[0];
        }
        
        if (listArray[i] != Vvariable && variableHadExtras){ //if it wasn't a duplicate and the variable had extras
            placeholderArray.push(variableHadExtras[1]);
        }else if (listArray[i] != Vvariable) { //if it wasn't a duplicate and the variable did not have extras
            placeholderArray.push(listArray[i]);
        }else if (listArray[i] == Vvariable && ku) { //if it was a duplicate?
            ku = 0;
            if (variableHadExtras) placeholderArray.push(variableHadExtras[1]);
            else placeholderArray.push(listArray[i]);
        }
        variableHadExtras = ''; //clear it back out
    }
    return s.join(placeholderArray, {
        delim: delimiter2
    })
}
