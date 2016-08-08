package org.auscope.portal.server.web.controllers;

import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.http.HttpServletResponse;

import org.auscope.portal.core.server.OgcServiceProviderType;
import org.auscope.portal.core.server.controllers.BasePortalController;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;
import org.auscope.portal.core.services.responses.wfs.WFSCountResponse;
import org.auscope.portal.core.services.responses.wfs.WFSTransformedResponse;
import org.auscope.portal.core.util.FileIOUtil;
import org.auscope.portal.server.web.service.RockPropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class RockPropertyController extends BasePortalController {

	private static String SCALAR_RESULTS = "ga_rock_properties_wfs:scalar_results";
	private static String REMANENT_MAGNETISATION = "ga_rock_properties_wfs:remanent_magnetisation";

	private RockPropertyService rockPropertiesService;

	@Autowired
	public RockPropertyController(RockPropertyService rockPropertiesService) {
		this.rockPropertiesService = rockPropertiesService;
	}

	@RequestMapping("/getRockPropertyFeatures.do")
	public ModelAndView getRockPropertyFeatures(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "rockProperty") String rockProperty,
			@RequestParam(required = false, value = "bbox") String bboxJson,

			@RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures) {

		OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
		FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);
		WFSTransformedResponse response = null;

		try {
			response = this.rockPropertiesService.getRockProperties(serviceUrl, rockProperty, maxFeatures, bbox);
		} catch (Exception e) {
			return this.generateExceptionResponse(e, serviceUrl);
		}

		return generateJSONResponseMAV(response.getSuccess(), response.getGml(), response.getTransformed(),
				response.getMethod());
	}
	
	@RequestMapping("/getRockPropertyCount.do")
	public ModelAndView getRockPropertyCount(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "rockProperty") String rockProperty,
			@RequestParam(required = false, value = "bbox") String bboxJson,

			@RequestParam(required = false, value = "maxFeatures", defaultValue = "0") int maxFeatures) {

		OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
		FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);
		WFSCountResponse response = null;

		try {
			response = this.rockPropertiesService.getRockPropertyCount(serviceUrl, rockProperty, maxFeatures, bbox);
		} catch (Exception e) {
			return this.generateExceptionResponse(e, serviceUrl);
		}

		return generateJSONResponseMAV(true, new Integer(response.getNumberOfFeatures()), "");
	}

	@RequestMapping("/getBulkDensityDownload.do")
	public void getBulkDensityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "bulk density";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getChargeabilityDownload.do")
	public void getChargeabilityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "chargeability";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getElectricalConductivityDownload.do")
	public void getElectricalConductivityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "electrical conductivity";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getElectricalResistivityDownload.do")
	public void getElectricalResistivityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "electrical resistivity";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getGammaBulkDensityDownload.do")
	public void getGammaBulkDensityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "gamma bulk density";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getKoenigsbergerRatioDownload.do")
	public void getKoenigsbergerRatioDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "koenigsberger ratio";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getMagneticSusceptibilityDownload.do")
	public void getMagneticSusceptibilityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "magnetic susceptibility";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getNaturalGammaDownload.do")
	public void getNaturalGammaDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "natural gamma";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getPorosityDownload.do")
	public void getPorosityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "porosity";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getRemanentMagnetisationDownload.do")
	public void getRemanentMagnetisationDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "remanent magnetisation";
		getRockPropertyDownload(serviceUrl, REMANENT_MAGNETISATION, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getSonicVelocityDownload.do")
	public void getSonicVelocityDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "sonic velocity";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	@RequestMapping("/getTemperatureDownload.do")
	public void getTemperatureDownload(@RequestParam("serviceUrl") String serviceUrl,
			@RequestParam(required = false, value = "bbox") String bboxJson,
			@RequestParam(required = false, value = "outputFormat") String outputFormat, HttpServletResponse response)
					throws Exception {
		String rockProperty = "temperature";
		getRockPropertyDownload(serviceUrl, SCALAR_RESULTS, rockProperty, bboxJson, outputFormat, response);
	}

	public void getRockPropertyDownload(String serviceUrl, String featureType, String rockProperty, String bboxJson,
			String outputFormat, HttpServletResponse response) throws Exception {
		OgcServiceProviderType ogcServiceProviderType = OgcServiceProviderType.parseUrl(serviceUrl);
		FilterBoundingBox bbox = FilterBoundingBox.attemptParseFromJSON(bboxJson, ogcServiceProviderType);
		String filter = this.rockPropertiesService.getRockPropertyFilter(rockProperty, bbox);
				System.out.println("Filter String: "+ filter);
		String contentType;
		if (outputFormat.equals("csv")) {
			contentType = "text/csv";
		} else {
			contentType = "text/xml";
		}
		
		response.setContentType(contentType);
		OutputStream outputStream = response.getOutputStream();

		InputStream results = this.rockPropertiesService.downloadRockProperties(serviceUrl, featureType, filter, outputFormat);
		FileIOUtil.writeInputToOutputStream(results, outputStream, 8 * 1024, true);
		outputStream.close();
	}

}
