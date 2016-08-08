Ext.define('auscope.widgets.panel.GABaseRecordPanel', {
    extend : 'portal.widgets.panel.CommonBaseRecordPanel',

    constructor : function(cfg) {
        var me = this;

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
            groupHeaderTpl: '{name} ({[values.rows.length]} {[values.rows.length > 1 ? "Items" : "Item"]})',
            startCollapsed : true
        });
       
        me.listeners = Object.extend(me.listenersHere, cfg.listeners);
        
        Ext.apply(cfg, {
            cls : 'auscope-dark-grid',
            hideHeaders : true,
            features : [groupingFeature],
            viewConfig : {
                emptyText : '<p class="centeredlabel">No records match the current filter.</p>',
                preserveScrollOnRefresh: true
            },          
            dockedItems : [{
                xtype : 'toolbar',
                dock : 'top',
                portalName : 'search-bar', //used for distinguishing this toolbar
                items : [{                    
                    fieldLabel : 'Search',
                    labelWidth : 42,
                    xtype : 'clientsearchfield',
                    id : 'hh-searchfield-' + cfg.title.replace(' ',''),
                    width : '100%',
                    grow : true,
                    fieldName: 'name',
                    store : cfg.store
                }]
            }],
            columns : [{
                //Loading icon column
                xtype : 'clickcolumn',
                dataIndex : 'active',
                renderer : me._deleteRenderer,
                hasTip : true,
                tipRenderer : function(value, layer, column, tip) {
                    if(layer.get('active')){
                        return 'Click to remove layer from map';
                    }else{
                        return 'Click to anywhere on this row to select drop down menu';
                    }
                },
                width: 32,
                listeners : {
                    columnclick : Ext.bind(me._deleteClickHandler, me)
                }
            },{
                //Loading icon column
                xtype : 'clickcolumn',
                dataIndex : 'loading',
                renderer : me._loadingRenderer,
                hasTip : true,
                tipRenderer : Ext.bind(me._loadingTipRenderer, me),
                width: 32,
                listeners : {
                    columnclick : Ext.bind(me._loadingClickHandler, me)
                }
            },{
                //Title column
                text : 'Title',
                dataIndex : 'name',
                flex: 1,
                renderer : me._titleRenderer
            },{
                //Service information column
                xtype : 'clickcolumn',
                dataIndex : 'serviceInformation',
                width: 32,
                renderer : me._serviceInformationRenderer,
                hasTip : true,
                tipRenderer : function(value, layer, column, tip) {
                    return 'Click for detailed information about the web services this layer utilises.';
                },
                listeners : {
                    columnclick : Ext.bind(me._serviceInformationClickHandler, me)
                }
            },{
                //Spatial bounds column
                xtype : 'clickcolumn',
                dataIndex : 'spatialBoundsRenderer',
                width: 32,
                renderer : me._spatialBoundsRenderer,
                hasTip : true,
                tipRenderer : function(value, layer, column, tip) {
                    return 'Click to see the bounds of this layer, double click to pan the map to those bounds.';
                },
                listeners : {
                    columnclick : Ext.bind(me._spatialBoundsClickHandler, me),
                    columndblclick : Ext.bind(me._spatialBoundsDoubleClickHandler, me)
                }
            }],
          plugins:[{                
              ptype : 'rowexpandercontainer',
              pluginId : 'maingrid_rowexpandercontainer',
              toggleColIndexes: [0, 2],
              generateContainer : function(record, parentElId, grid) {                  
                  //VT:if this is deserialized, we don't need to regenerate the layer
                  if(record.get('layer')) {                        
                      newLayer =  record.get('layer');                                    
                  }else if(record instanceof portal.csw.CSWRecord){                        
                      newLayer = cfg.layerFactory.generateLayerFromCSWRecord(record);                                                     
                  }else{
                      newLayer = cfg.layerFactory.generateLayerFromKnownLayer(record);                      
                  }           
                  record.set('layer',newLayer);
                  var filterForm = cfg.layerFactory.formFactory.getFilterForm(newLayer).form; //ALWAYS recreate filter form - see https://jira.csiro.au/browse/AUS-2588
                  filterForm.setLayer(newLayer);
                  var filterPanel = me._getInlineLayerPanel(filterForm, parentElId, this);
                  
                  //Update the layer panel to use
                  if (filterForm) {
                      var filterer = newLayer.get('filterer');
                      if (filterer) {
                          var existingParams = filterer.getParameters();
                          filterForm.getForm().setValues(existingParams);
                      }
                  }
                  grid.updateLayout({
                      defer:false,
                      isRoot:false
                  });                    
                  return filterPanel;
             }
         },{
          ptype: 'celltips'
         }]
                  
        });

        me.callParent(arguments);
    },
    
    onDestroy : function() {
        me.callParent();
    },

    _getInlineLayerPanel : function(filterForm, parentElId){                             
        var me = this;   
        var panel = Ext.create('portal.widgets.panel.FilterPanel', {    
            menuFactory : this.menuFactory,
            filterForm  : filterForm, 
            detachOnRemove : false,
            map         : this.map,
            renderTo    : parentElId,
            menuItems : []
        });   
        
        return panel
    },    

    // Used in sub-classes
    handleFilterSelectComplete : function(filteredResultPanels){
        var me = this;
        var cswSelectionWindow = new CSWSelectionWindow({
            title : 'CSW Record Selection',
            resultpanels : filteredResultPanels,
            listeners : {
                selectioncomplete : function(csws){  
                    var tabpanel =  Ext.getCmp('auscope-tabs-panel');
                    var customPanel = me.ownerCt.getComponent('org-auscope-custom-record-panel');
                    tabpanel.setActiveTab(customPanel);
                    if(!(csws instanceof Array)){
                        csws = [csws];
                    }
                    for(var i=0; i < csws.length; i++){
                        csws[i].set('customlayer',true);
                        customPanel.getStore().insert(0,csws[i]);
                    }
                    
                }
            }
        });
        cswSelectionWindow.show();
    },

    /**
     * When called, will update the visibility of any search bars
     */
    _updateSearchBar : function(visible) {
        var dockedItems = this.getDockedItems();
        var searchBar = null;
        for (var i = 0; i < dockedItems.length; i++) {
            if (dockedItems[i].initialConfig.portalName === 'search-bar') {
                searchBar = dockedItems[i];
            }
        }
        if (!searchBar) {
            return;
        }

        if (visible) {
            searchBar.show();
        } else {
            searchBar.hide();
        }
    },

    _deleteRenderer : function(value, metaData, record, row, col, store, gridView) {
        if (value) {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/trash.png'
            });
        } else {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/play_blue.png'
            });
        }
    },
    
    _deleteClickHandler :  function(value, record, rowIdx, tip) {
        var layer = record.get('layer');
        if(layer && record.get('active')){
            ActiveLayerManager.removeLayer(layer);
            this.fireEvent('cellclick',this,undefined,undefined,layer,undefined,rowIdx);
        }
    },
    
    _loadingRenderer : function(value, metaData, record, row, col, store, gridView) {
        if (value) {
            return Ext.DomHelper.markup({
                tag : 'img',
                width : 16,
                height : 16,
                src: 'portal-core/img/loading.gif'
            });
        } else {
            
            if(record.get('active')){
            
                var renderStatus = record.get('layer').get('renderer').renderStatus;
                var listOfStatus=renderStatus.getParameters();                
                var errorCount = this._statusListErrorCount(listOfStatus);
                var sizeOfList = Ext.Object.getSize(listOfStatus);
                if(errorCount > 0 && errorCount == sizeOfList){
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/exclamation.png'
                    });
                }else if(errorCount > 0 && errorCount < sizeOfList){
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/warning.png'
                    });
                }else{
                    return Ext.DomHelper.markup({
                        tag : 'img',
                        width : 16,
                        height : 16,
                        src: 'portal-core/img/tick.png'
                    });
                }
                
            }else{
                return Ext.DomHelper.markup({
                    tag : 'img',
                    width : 16,
                    height : 16,
                    src: 'portal-core/img/notloading.gif'
                });
            }
            
            
        }
    },
        
    _statusListErrorCount : function(listOfStatus){
        var match =["reached","error","did not complete","AJAX","Unable"];
        
        var erroCount = 0;  
        
        for(key in listOfStatus){
            for(var i=0; i< match.length; i++){
                if(listOfStatus[key].indexOf(match[i]) > -1){
                    erroCount++;
                    break;
                }
            }
        }
        return erroCount;
    },
    
    _loadingTipRenderer : function(value, record, column, tip) {
        var layer = record.get('layer');
        if(!layer){//VT:The layer has yet to be created.
            return 'No status has been recorded';
        }
        var renderer = layer.get('renderer');
        var update = function(renderStatus, keys) {
            tip.update(renderStatus.renderHtml());
        };

        //Update our tooltip as the underlying status changes
        renderer.renderStatus.on('change', update, this);
        tip.on('hide', function() {
            renderer.renderStatus.un('change', update); //ensure we remove the handler when the tip closes
        });

        return renderer.renderStatus.renderHtml();
    },
    
    _loadingClickHandler : function(value, record, rowIdx, tip) {
        
        var layer = record.get('layer');
        
        var html = '<p>No Service recorded, Click on Add layer to map</p>';    
        
        if(layer){
            var renderer = layer.get('renderer');
            html =  renderer.renderStatus.renderHtml();
        }        
        var win = Ext.create('Ext.window.Window', {
            title: 'Service Loading Status',
            height: 200,
            width: 500,
            layout: 'fit',
            items: {  // Let's put an empty grid in just to illustrate fit layout
                xtype: 'panel',
                autoScroll : true,                
                html : html
            }
        });
        
        win.show();
    }
});