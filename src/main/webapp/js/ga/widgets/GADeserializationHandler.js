Ext.define('ga.widgets.GADeserializationHandler', {
    extend : 'portal.util.permalink.DeserializationHandler',
    alias: 'widget.gadeserializationhandler',

    constructor : function(cfg) {
        this.callParent(arguments);
    },

    _deserialize : function() {
        var featureLayers = this._getLayersToAdd();

        if (this.mapStateSerializer.serializedLayers.length > 0)
        {
            var restoreMsg = Ext.MessageBox.show({
                title: '<p style="font-size:140%;margin:0em;">Reloading map layers...</p>',
                msg: '<b><h1 style="margin:0em;">Please wait...</h2></b><br>' +
                     '<p style="font-size:140%;margin:0em;">Restoring <b>Featured Layers</b> to your map</p><br>' +
                     '<p style="font-size:140%;margin:0em;">Custom Layers will not be reloaded</p>' +
                     '<p style="font-size:140%;">Click "CLEAR MAP" to start with an empty map</p>'
            });

            setTimeout(function(){
                restoreMsg.close();
            }, 8000);
        }

        //Add the layers to the internal store
        ActiveLayerManager.addLayers(featureLayers);
    },
});
