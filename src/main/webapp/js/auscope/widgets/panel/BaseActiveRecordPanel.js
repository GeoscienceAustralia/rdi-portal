/**
 * An abstract base class to be extended.
 *
 * Represents a grid panel for containing layers
 * that haven't yet been added to the map. Each row
 * will be grouped under a heading, contain links
 * to underlying data sources and have a spatial location
 * that can be viewed by the end user.
 *
 * This class is expected to be extended for usage within
 * the 'Registered Layers', 'Known Layers' and 'Custom Layers'
 * panels in the portal. Support for KnownLayers/CSWRecords and
 * other row types will be injected by implementing the abstract
 * functions of this class
 *
 */

Ext.define('portal.widgets.panel.BaseActiveRecordPanel', {
    extend : 'portal.widgets.panel.CommonBaseRecordPanel',
    alias: 'widget.baseactiverecordpanel',

    visibleIcon : 'img/eye.png',
    notVisibleIcon : 'img/eye_off.png',
    
    listenersHere : {
        // when the component is ready, we can update its events
        viewready: function(grid) {
            var view = grid.getView(),
                dd = view.findPlugin('gridviewdragdrop'),
                pos;

            // ignore drag events that didn't originate from the Name column
            // this will allow default events like click inside the expanded panel to work
            dd.dragZone.onBeforeDrag = function (data, e) {
                pos = grid.getView().getPositionByEvent(e);
                return pos.colIdx === 1;
            }
        }
    },

    constructor : function(cfg) {
        var me = this;
       
        me.listeners = Object.extend(me.listenersHere, cfg.listeners);
        this.store = cfg.store;
        
        Ext.apply(cfg, {
            cls : 'auscope-dark-grid',
            hideHeaders : true,
            viewConfig : {
                emptyText : '<p class="centeredlabel">No records match the current filter.</p>',
                preserveScrollOnRefresh: true,
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragText: 'Drag and drop to reorganize'
                },
                listeners: {
                    drop: function(node, data, overModel, dropPosition,  dropFunction,  eOpts ){
                        ActiveLayerManager.updateLayerOrder(me.map, data.records[0])
                    }
                },
            },          
            columns : [{
                text : 'Drag',
                xtype : 'clickcolumn',
                width: 32,
                align: 'center',
                renderer: me._playRenderer,
                sortable: false,
                menuDisabled: true,
                hasTip : true,
                tipRenderer : function() {
                  return 'Click to adjust transparency and/or query filters';
                }
             },{
                text : 'Name',
                xtype : 'gridcolumn',
                dataIndex : 'name',
                flex : 1,
                renderer: this._titleRenderer,
                hasTip : true,
                tipRenderer : function() {
                  return 'Drag to re-order layers';
                }              
            },{
                text : 'info',
                id : 'info',
                xtype : 'actioncolumn',
                dataIndex : 'info',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/information.png',
                tooltip: 'Show layer information',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, record, row) {
                    me._serviceInformationClickHandler(colIndex, record, rowIndex, colIndex);
                }
             },{
                text : 'legend',
                xtype : 'actioncolumn',
                dataIndex : 'legend',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/key.png',
                tooltip: 'Show layer legend',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    me._getLegendAction(layer).execute();
                }
            },{
                // This is a dummy column to solve a problem with the Visibility column that follows this
                // Having the renderer to return the Visibility Img is seeming to cause 2 images to be displayed.
                // The first is the visibility icon (on or off) and the second is some invisibile image.
                // The problem this is seeming to cause is that the tooltip is on the 2nd invisible image.  The
                // tooltip on the actual image is that of the column that proceeds it (to the left).  Thus this
                // dummy column that outputs the same tooltip.  What a hack!
                text : '&nbsp;',
                xtype : 'actioncolumn',
                width: 2,
                align: 'center',
                menuDisabled: true,
                getTip : function(value, metadata, layer) {
                    var tip = 'Toggle layer visibility ';
                    if(layer.visible){
                        tip+='off';
                    }else{
                        tip+='on';
                    }
                    return tip;
                },
            },{
                text : 'Visible',
                xtype : 'actioncolumn',
                dataIndex : 'visible',
                width: 30,
                align: 'center',
                menuDisabled: true,
                getTip : function(value, metadata, layer) {
                    var tip = 'Toggle layer visibility ';
                    if(layer.visible){
                        tip+='off';
                    }else{
                        tip+='on';
                    }
                    return tip;
                },
                sortable: false,
                renderer: function (value, metadata, layer) {
                    var newSrc="src=\"";
                    if(layer.visible){
                        newSrc+=me.visibleIcon+'"';
                    }else{
                        newSrc+=me.notVisibleIcon+'"';
                    }
                    var img = metadata.value;
                    // Change the src="..." image using this regular expression - toggle between eye.png and eye-off.png
                    return img.replace(/src *= *[^ ]*/, newSrc);
                },
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    me._setVisibilityAction(layer).execute();
                    // Force the renderer to fire
                    view.refresh();
                }
            },{
                text : 'Remove',
                xtype : 'actioncolumn',
                dataIndex : 'remove',
                width: 32,
                align: 'center',
                icon : 'portal-core/img/cross.png',
                tooltip: 'Remove layer from map',
                sortable: false,
                menuDisabled: true,
                handler : function(view, rowIndex, colIndex, item, event, layer, row) {
                    ActiveLayerManager.removeLayer(layer);
                }
              }],
              plugins:[{                
                  ptype : 'rowexpandercontainer',
                  baseId : 'rowexpandercontainer-activelayers',
                  pluginId : 'maingrid_rowexpandercontainer',
                  toggleColIndexes: [0,1],
                  generateContainer : function(layer, parentElId) {
                      //VT:if this is deserialized, we don't need to regenerate the layer
                      if(! layer) {
                          Ext.Error.raise("Expecting layer to be an actual layer for the ActiveLayersPanel but it is undefined")
                      }           
                      var filterForm = cfg.layerFactory.formFactory.getFilterForm(layer).form; //ALWAYS recreate filter form - see https://jira.csiro.au/browse/AUS-2588
                      filterForm.setLayer(layer);
                      var filterPanel = me._getInlineLayerPanel(filterForm, parentElId, this);
                      
                      //Update the layer panel to use
                      if (filterForm) {
                          var filterer = layer.get('filterer');
                          if (filterer) {
                              var existingParams = filterer.getParameters();
                              filterForm.getForm().setValues(existingParams);
                          }
                      }
                      this.grid.updateLayout({
                          defer:false,
                          isRoot:false
                      });                    
                      return filterPanel;
                 }
             },{
              ptype: 'celltips'
             }]
                  
        });

        this.callParent(arguments);
    },
    
    // Column Function
    _getLegendAction : function(layer){                       
        var legend = layer.get('renderer').getLegend();
        var text = 'Get Legend';
       
        var getLegendAction = new Ext.Action({
            text : text,
            icon : legend.iconUrl,
            //icon : null,
            iconCls : 'portal-ux-menu-icon-size',
            itemId : 'LegendAction',
            
            handler : function(){
                // this will be resized dynamically as legend content is added
                var legendCallback = function(legend, resources, filterer, success, form, layer){
                    if (success && form) {                        
                        // allow more than one legend popup but only one per layer
                        var popupId = 'legendPopup_' + layer.get('id');                        
                        var popupWindow = Ext.get(popupId);
                        if (!popupWindow) {
                            popupWindow = Ext.create('Ext.window.Window', {                        
                                id          : 'legendPopup',
                                title       : 'Legend: '+ layer.get('name'),
                                layout      : 'vbox',
                                maxHeight   : Ext.get('center_region-map').getHeight(),
                                autoScroll  : true,
                                items: form,
                                listeners: {
                                    show: function() {
                                        var container = Ext.get('center_region-map');
                                        this.setPosition(container.getX()-1, container.getY()-1);
                                    }
                                },
                            }); 
                            popupWindow.show();
                        } 
                        return Ext.getCmp(popupWindow.id).focus();              
                    }
                };
    
                var onlineResources = layer.getAllOnlineResources();
                var filterer = layer.get('filterer');
                var renderer = layer.get('renderer');
                var legend = renderer.getLegend(onlineResources, filterer);
    
                //VT: this style is just for the legend therefore no filter is required.
                var styleUrl = layer.get('renderer').parentLayer.get('source').get('proxyStyleUrl');
                
                //VT: if a layer has style, the style should take priority as the default GetLegend source else use default
                if(styleUrl && styleUrl.length > 0){
    
                    Ext.Ajax.request({
                        url: styleUrl,
                        timeout : 180000,
                        scope : this,
                        success:function(response,opts){
                            legend.getLegendComponent(onlineResources, filterer,response.responseText, true, Ext.bind(legendCallback, this, [layer], true), null, true);
                        },
                        failure: function(response, opts) {
                            legend.getLegendComponent(onlineResources, filterer,"", true, Ext.bind(legendCallback, this, [layer], true));
                        }
                    });
                
                }else{
                    legend.getLegendComponent(onlineResources, filterer,"", true, Ext.bind(legendCallback, this, [layer], true), layer.get('source').get('staticLegendUrl'), true);
                }
                
            }
        });
        
        return getLegendAction;
    },
    
    // Column Function
    _setVisibilityAction : function(layer){
//        var me = this;
        var visibleLayerAction = new Ext.Action({
            text : 'Toggle Layer Visibility OFF',
            iconCls : 'visible_eye',
            handler : function(){
//                var layer = me.filterForm.layer;                 
                layer.setLayerVisibility(!layer.visible);
            }
        });
        
        return visibleLayerAction;
    },

    /**
     * Column definition function to draw the panel when a row is clicked upon.  Here is a common one to draw the WMS/WFS filter with Opacity, drop-downs etc..
     * Override
     */
    _getInlineLayerPanel : function(filterForm, parentElId){
        var me = this;
        var panel =Ext.create('portal.widgets.panel.FilterPanel', {    
            wantAddLayerButton : false,
            wantUpdateLayerButton : true,
            wantOptionsButton : false,
            menuFactory : this.menuFactory,
            filterForm  : filterForm, 
            detachOnRemove : false,
            map         : this.map,
            renderTo    : parentElId,
            layerStore  : me.store
        });   
        
        return panel
    },
    
    _playRenderer : function () {
      return Ext.DomHelper.markup({
        tag : 'img',
        width : 16,
        height : 16,
        src: 'portal-core/img/play_blue.png'
    });
      
    }
});
