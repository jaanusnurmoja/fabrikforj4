/*! Fabrik */
define([],function(){var c;return document.id,c=window,Event.Mock=function(e,t){var n=c.event;return t=t||"click",document.createEvent?(n=document.createEvent("HTMLEvents")).initEvent(t,!1,!0):document.createEventObject&&(n=document.createEventObject()),(n=new DOMEvent(n,self.getWindow())).target=e,n},Event.Mock});
//# sourceMappingURL=Event.mock-min.js.map