
Ext.define('auscope.layer.querier.wfs.factories.RockPropertyFactory', {
	extend : 'portal.layer.querier.wfs.factories.BaseFactory',

	XMLNS_RP : 'http://www.ga.gov.au/geophysics-rockpropertypub-gws/ga_rock_properties_wms/',
	
	ROCKPROPS : ['chargeability','bulk_density','electrical_conductivity','electrical_resistivity',
	             'gamma_bulk_density','koenigsberger_ratio','magnetic_susceptibility','natural_gamma',
	             'porosity','remanent_magnetisation','sonic_velocity','temperature'],
	
	constructor : function(cfg) {
		this.callParent(arguments);
	},
	
	supportsNode : function(domNode) {
	    var hasLocalName = false;
	    for (i=0; i < this.ROCKPROPS.length; i++) {
	        hasLocalName = (portal.util.xml.SimpleDOM.getNodeLocalName(domNode) === this.ROCKPROPS[i]) ? true : hasLocalName;
	    }
		return domNode.namespaceURI = this.XMLNS_RP && hasLocalName;
	},
	
	parseNode : function(domNode, wfsUrl) {
        var bf = this;

        var layerName = Ext.String.capitalize(portal.util.xml.SimpleDOM.getNodeLocalName(domNode).replace(/_/,' '));
        
        var gmlId = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, '@gml:id');
        
        var resultNumber = portal.util.xml.SimpleXPath.evaluateXPathString(domNode, 'ga_rock_properties_wms:RESULTNO');
        
        return Ext.create('portal.layer.querier.BaseComponent', {
            border : false,
            tabTitle: layerName + ' - ' + resultNumber,
            layout : 'fit',
            items : [{
                xtype : 'fieldset',
                labelWidth : 75,
                autoScroll : true,
                items : this._createDisplayItems(domNode)
            }]
        });
	},
	
	_createDisplayItems: function(domNode) {
		/*
		 * The following is a key-value pair with the keys taken from the DescribeFeatureType request of the service and the values being the human-readable names for each attribute.
		 * Excluded are RESULTID, which is used for the tabTitle, and GEOM. 
		 */
	    var featureItems = {'SAMPLINGFEATURENO' : 'Sampling Feature Number',
							'SAMPLINGFEATURENAME' : 'Sampling Feature Name',
							'SAMPLINGFEATURETYPE' : 'Sampling Feature Type',
							'SAMPLENO' : 'Sample Number',
							'SAMPLENAME' : 'Sample Name',
							'SAMPLETYPE' : 'Sample Type',
							'PROPERTY' : 'Property',
							'VALUE' : 'Value',
							'UNITOFMEASURE' : 'Unit of Measure',
							'RESULTQUALIFIER' : 'Result Qualifier',
							'UNCERTAINTY' : 'Uncertainty',
							'UNCERTAINTYUOM' : 'Uncertainty Unit of Measure',
							'UNCERTAINTYTYPE' : 'Uncertainty Type',
							'STRATIGRAPHICUNITNAME' : 'Stratigraphic Unit Name',
							'PROVINCENAME' : 'Province Name',
							'MATERIALCLASS' : 'Material Class',
							'LITHOLOGYGROUP' : 'Lithology Group',
							'LITHOLOGY' : 'Lithology',
							'SAMPLE_LONGITUDE' : 'Sample Longitude',
							'SAMPLE_LATITUDE' : 'Sample Longitude',
							'SAMPLE_ELEVATION' : 'Sample Elevation',
							'BOREHOLECOLLARLONGITUDE' : 'Borehole Collar Longitude',
							'BOREHOLECOLLARLATITUDE' : 'Borehole Collar Latitude',
							'BOREHOLECOLLARELEVATION' : 'Borehole Collar Elevation',
							'BOREHOLEINTERVALBEGIN_M' : 'Borehole Interval Begin (m)',
							'BOREHOLEINTERVALEND_M' : 'Borehole Interval End (m)',
							'SAMPLINGDATE' : 'Sampling Date',
							'LOCATIONACCURACY_M' : 'Location Accuracy (m)',
							'LOCATIONMETHOD' : 'Location Method',
							'SAMPLEORIGINATOR' : 'Sample Originator',
							'SAMPLINGLOCATIONREMARK' : 'Sampling Location Remark',
							'PROCESSTYPE' : 'Process Type',
							'METHOD' : 'Method',
							'INSTRUMENT' : 'Instrument',
							'ANALYSISDATETIME' : 'Analysis Date Time',
							'ANALYSISREMARK' : 'Analysis Remark',
							'ANALYSISORIGINATOR' : 'Analysis Originator',
							'ANALYSISLOCATIONREMARK' : 'Analysis Location Remark',
							'NUMERICALCONFIDENCE' : 'Numerical Confidence',
							'METADATAQUALITY' : 'Metadata Quality',
							'SUMMARYCONFIDENCE' : 'Summary Confidence',
							'SOURCETYPE' : 'Source Type',
							'SOURCE' : 'Source',
							'RESULTID' : 'Result ID'
						};
	    var displayItems = [];
	    for (var key in featureItems) {
	    	if (featureItems.hasOwnProperty(key)) {
	    		var xpathString = 'ga_rock_properties_wms:' + key;
	    		var value = portal.util.xml.SimpleXPath.evaluateXPathString(domNode,xpathString)
	    		if (value !== "" ) {
	    		    var item = {xtype : 'displayfield',
	    			    fieldLabel: featureItems[key],
	    				value: value
	    			};
	    		    displayItems.push(item);
	    		}
	    	}
	    }
	    return displayItems;
	}
})
