/*! Fabrik */
window.FbButton=new Class({Extends:FbElement,initialize:function(e,t){this.setPlugin("fabrikButton"),this.parent(e,t)},addNewEventAux:function(action,js){var self=this;jQuery(this.element).on(action,function(e){e&&e.stopPropagation(),"function"===jQuery.type(js)?js.delay(0,self,self):(js=js.replace(/\bthis\b(?![^{]*})/g,"self"),eval(js))})}});
//# sourceMappingURL=button-min.js.map