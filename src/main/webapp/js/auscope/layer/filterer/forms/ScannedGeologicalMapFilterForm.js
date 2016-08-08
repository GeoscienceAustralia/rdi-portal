Ext.define('auscope.layer.filterer.forms.ScannedGeologicalMapFilterForm', {
  extend : 'portal.layer.filterer.BaseFilterForm',

  
  constructor : function(config) {
    var filterer=config.layer.get('filterer');
    if(!filterer.getParameter('opacity')){
        filterer.setParameter('opacity',1,true);
    }

    areaMapStore = new ga.store.AreaMapStore({});
    
    Ext.apply(config, {
      delayedFormLoading: true, //we won't be ready until our commodity store is loaded - therefore we have to fire formloaded when ready
      border: false,
      autoScroll: true,
      hideMode: 'offsets',
      labelAlign: 'right',
      bodyStyle: 'padding:5px',
      autoHeight: true,
      layout: 'anchor',
      items: [{
          xtype: 'fieldset',
          title: '<span data-qtip="Please enter the filter constraints then hit \'Apply Filter\'">' +
                    'Filter data' +
                 '</span>',
          autoHeight: true,
          labelAlign: 'right',
          bodyStyle: 'padding:0px',
          items :[{
              xtype : 'combo',
              anchor: '100%',
              name: 'mapName',
              fieldLabel: 'Map Name',
              labelAlign: 'right',
              forceSelection: false,
              queryMode: 'local',
              store: areaMapStore,
              triggerAction: 'all',
              typeAhead: true,
              typeAheadDelay: 500,
              displayField:'Name',   /* change tpl field to this value as well! */
              valueField:'Name'
          }]
      }]
  });
    this.callParent(arguments);
    
    var callingInstance = this;
    areaMapStore.load( {
        callback : function() {
            callingInstance.setIsFormLoaded(true);
            callingInstance.fireEvent('formloaded');
        }
    });
  }
});
