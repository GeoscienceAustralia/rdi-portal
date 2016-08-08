Ext.define('ga.store.AreaMapStore', {
  extend : 'Ext.data.Store',

  config : {
    autoload : true,

    fields : [
              {name : 'Name', type : 'string'},
              {name : 'WestLon', type : 'float'},
              {name : 'NorthLat', type : 'float'}
              ],

    proxy : {
      type : 'ajax',
      url : 'getAreaMaps.do',
      reader : {
        type : 'json',
        rootProperty : 'data'
      }
    }
  }
});
