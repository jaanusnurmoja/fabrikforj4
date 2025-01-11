/*! Fabrik */
var FbListcaneditrow=new Class({Extends:FbListPlugin,initialize:function(i){this.parent(i),Fabrik.addEvent("onCanEditRow",function(i,n){this.onCanEditRow(i,n)}.bind(this))},onCanEditRow:function(i,n){n=n[0],i.result=this.options.acl[n]}});
//# sourceMappingURL=canviewrow-min.js.map