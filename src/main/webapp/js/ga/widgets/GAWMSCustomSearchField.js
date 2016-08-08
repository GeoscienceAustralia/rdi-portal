Ext.define('ga.widgets.GAWMSCustomSearchField', {
    extend : 'portal.widgets.field.WMSCustomSearchField',
    alias: 'widget.gawmscustomsearchfield',

    constructor : function(cfg) {
        this.callParent(arguments);
    },

    _clearLayerStore : function(store){
        store.removeAll();
  },
});
