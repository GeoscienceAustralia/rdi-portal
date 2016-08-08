package org.auscope.portal.server.web.controllers;

import java.io.ByteArrayInputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

import org.auscope.portal.core.server.controllers.BasePortalController;
import org.auscope.portal.core.util.FileIOUtil;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controller to produce StyledLayerDescriptors for ArcGis Server layers.
 *
 */
@Controller
public class SLDController extends BasePortalController {

	@RequestMapping("/getScannedGeologicalMapsStyle.do")
	public void getScannedGeologicalMapsStyle(@RequestParam(value = "mapName", required = false) String mapName,
			HttpServletResponse response) throws Exception {

		String filter = "";
		String fillColour = "";
		String scannedGeologicalMapsStyle = "";
		// If mapName is passed to the action, build filter string and make the
		// map sheet opaque
		if (mapName != null && !mapName.isEmpty()) {
			filter = "<ogc:Filter><ogc:PropertyIsLike escapeChar=\"!\" wildCard=\"*\" matchCase=\"false\" singleChar=\"#\">"
					+ "<ogc:PropertyName>QMAPNAME</ogc:PropertyName>" + "<ogc:Literal>*" + mapName + "*</ogc:Literal>"
					+ "</ogc:PropertyIsLike>" + "</ogc:Filter>";
			fillColour = "<Fill><CssParameter name=\"fill\">#ed9c38</CssParameter>"
					+ "<CssParameter name=\"fill-opacity\">0.6</CssParameter></Fill>";
			scannedGeologicalMapsStyle ="<?xml version=\"1.0\" encoding=\"UTF-8\"?>"+ 
					"<StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">"
					+ "<NamedLayer> <Name>Scanned_250K_Geological_Map_Index</Name><UserStyle>"
					+ "<Name>scanned-maps</Name><FeatureTypeStyle><Rule><Name>250K Scanned Geological Maps</Name>" + filter
					+ "<PolygonSymbolizer>" + fillColour + "<Stroke>"
					+ "<CssParameter name=\"stroke\">#ed9c38</CssParameter>"
					+ "<CssParameter name=\"stroke-width\">1</CssParameter></Stroke></PolygonSymbolizer>"
					+ "</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
		}

		

		writeStyleStream(scannedGeologicalMapsStyle, response);
	}

	@RequestMapping("/getOilStyle.do")
	public void getOilStyle(HttpServletResponse response) throws Exception {

		String oilStyle = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
				+ "<StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">"
				+ "<NamedLayer><Name>National_Onshore_Oil_Pipelines</Name><UserStyle>"
				+ "<Name>oil-pipelines-portal</Name><FeatureTypeStyle>"
				// MS - Rule/Name needs a human readable value because ArcGIS
				// server uses it for GetLegendGraphic
				+ "<Rule><Name>Oil Pipelines</Name><LineSymbolizer><Stroke>"
				+ "<CssParameter name=\"stroke\">#000000</CssParameter>"
				+ "<CssParameter name=\"stroke-width\">2.8</CssParameter>"
				+ "<CssParameter name=\"stroke-linejoin\">mitre</CssParameter>"
				+ "<CssParameter name=\"stroke-linecap\">butt</CssParameter></Stroke></LineSymbolizer>"
				+ "<LineSymbolizer><Stroke><CssParameter name=\"stroke\">#ffae21</CssParameter>"
				+ "<CssParameter name=\"stroke-width\">1.3</CssParameter>"
				+ "<CssParameter name=\"stroke-linejoin\">mitre</CssParameter>"
				+ "<CssParameter name=\"stroke-linecap\">butt</CssParameter></Stroke></LineSymbolizer>"
				+ "</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";

		writeStyleStream(oilStyle, response);

	}

	@RequestMapping("/getGasStyle.do")
	public void getGasStyle(HttpServletResponse response) throws Exception {

		String gasStyle = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
				+ "<StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">"
				+ "<NamedLayer><Name>National_Onshore_Gas_Pipelines</Name><UserStyle>"
				+ "<Name>gas-pipelines-portal</Name><FeatureTypeStyle>"
				// MS - Rule/Name needs a human readable value because ArcGIS
				// server uses it for GetLegendGraphic
				+ "<Rule><Name>Gas Pipelines</Name><LineSymbolizer><Stroke>"
				+ "<CssParameter name=\"stroke\">#000000</CssParameter>"
				+ "<CssParameter name=\"stroke-width\">2.8</CssParameter>"
				+ "<CssParameter name=\"stroke-linejoin\">mitre</CssParameter>"
				+ "<CssParameter name=\"stroke-linecap\">butt</CssParameter></Stroke></LineSymbolizer>"
				+ "<LineSymbolizer><Stroke><CssParameter name=\"stroke\">#00b7ff</CssParameter>"
				+ "<CssParameter name=\"stroke-width\">1.3</CssParameter>"
				+ "<CssParameter name=\"stroke-linejoin\">mitre</CssParameter>"
				+ "<CssParameter name=\"stroke-linecap\">butt</CssParameter></Stroke></LineSymbolizer>"
				+ "</Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";

		writeStyleStream(gasStyle, response);

	}

	private void writeStyleStream(String style, HttpServletResponse response) throws Exception {
		response.setContentType(MediaType.TEXT_XML_VALUE);
		ByteArrayInputStream styleStream = new ByteArrayInputStream(style.getBytes());
		OutputStream outputStream = response.getOutputStream();

		FileIOUtil.writeInputToOutputStream(styleStream, outputStream, 1024, false);

		styleStream.close();
		outputStream.close();
	}
}
