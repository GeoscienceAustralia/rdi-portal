/**
 * @class ReportsInfoWindow
 * 
 * @author jac24m
 */

/**
 * @constructor
 */
function ReportsInfoWindow(iMap, iOverlay, iCSWRecord) {
    this.map = iMap; 
    this.overlay = iOverlay;
    this.cswRecord = iCSWRecord;
}

ReportsInfoWindow.prototype = {
	    
	'show': function() {
		var sHtml = "<div style=\"padding-bottom:30px;white-space:pre-wrap;white-space:-moz-pre-wrap;" +
			"white-space:-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;" +
			"width:99%;max-height:300px;overflow:auto;\">" 
			+ "<table border=\"1\" cellspacing=\"1\" width=\"100%\" bgcolor=\"#EAF0F8\">" 
			+ "<tr><td>"
			+ this.cswRecord.getServiceName()
			+ "</td></tr>"
			+ "<tr><td>" 
			+ this.cswRecord.getDataIdentificationAbstract(); 
			+ "</td></tr>";
		
		var wwwLinks = this.cswRecord.getFilteredOnlineResources('WWW');
		for(var i=0; i< wwwLinks.length; i++) {
			sHtml += "<tr><td>" 
				+ "<a href='"	+ wwwLinks[i].url + "' target='_blank'>" 
				+ wwwLinks[i].name 
				+ "</a>"
				+ "</td></tr>";
		}
		
			
		sHtml += "</table>"
			+ "</div>";

		this.map.openInfoWindowHtml(this.overlay.getBounds().getCenter(), sHtml, 
				{maxWidth:800, maxHeight:400, autoScroll:true});
	}
};