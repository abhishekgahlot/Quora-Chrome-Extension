/*
Name: widgets.js
URL: http://qsf.cf.quoracdn.net/-c20a67afaf9f0d3a.js
Generated: 1402358920911152
Files: /widgets.js
*/
!function(){function a(a,b){var c=RegExp("[?&]"+b+"=([^&]*)").exec(a);return c&&c[1]}var b=window.qrae=window.qrae||{hostDomain:window.__quora_host__||"http://www.quora.com",buttonIFramePath:"/widgets/follow_button_iframe",widgetWidth:265,widgetShortLabelWidth:200,widgetButtonHeight:20,createFollowButtonIFrameFromName:function(a,c,d,e){var f=document.createElement("iframe");f.allowTransparency="true",f.frameBorder="0",f.scrolling="no";var g=[window.qrae.hostDomain,b.buttonIFramePath,"?name=",a,"&source_url=",encodeURIComponent(window.location.href),"&dark=",c];return e&&(g=g.concat(["&embed_code=",e])),f.src=g.join(""),f.style.border="none",d?f.style.width=b.widgetShortLabelWidth+"px":f.style.width=b.widgetWidth+"px",f.style.height=b.widgetButtonHeight+"px",f.id=a,f}};for(var c=document.getElementsByTagName("script"),d=c.length-1;d>=0;d--){var e=c.item(d),f=e.parentNode;if(f&&f.className.match("quora-follow-button")){var g=f.getAttribute("data-name"),h=!1;if(window.getComputedStyle){var i=parseInt(window.getComputedStyle(f.parentNode,null).getPropertyValue("width"),10);i<265&&(h=!0)}var j=a(e.src,"embed_code"),k=b.createFollowButtonIFrameFromName(g,!!f.className.match(/\sdark$/),h,j);f.parentNode.insertBefore(k,f),f.parentNode.removeChild(f)}}}();