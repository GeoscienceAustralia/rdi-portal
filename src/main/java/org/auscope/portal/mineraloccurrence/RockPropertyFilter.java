package org.auscope.portal.mineraloccurrence;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auscope.portal.core.services.methodmakers.filter.AbstractFilter;
import org.auscope.portal.core.services.methodmakers.filter.FilterBoundingBox;

public class RockPropertyFilter extends AbstractFilter {

	/**
	 * Hard coded list of lookups for the rock properties service, where a rock
	 * property maps to a number of sub properties. Consult
	 * ROCKPROPS.LU_ROCKPROPERTY for more detail. This should probably be done
	 * using a vocab service. Does one exist? Probably not. Raise JIRA for when
	 * one exists then point this controller at it.
	 */
	public static final Map<String, String[]> ROCK_PROPERTY_MAP = new HashMap<String, String[]>() {

		private static final long serialVersionUID = -4773070921203163971L;

		{
			put("bulk density", new String[] { "dry bulk mass density", "mass density", "wet bulk mass density",
					"grain mass density" });
			put("gamma bulk density", new String[] { "gamma bulk density", "gamma long spaced density",
					"gamma short spaced density", "gamma differential density", "gamma bed resolution detector" });
			put("porosity",
					new String[] { "porosity", "total porosity", "apparent porosity", "NMR effective porosity",
							"NMR total porosity", "NMR clay-bound water porosity", "density porosity",
							"neutron porosity", "computed tomography porosity", "thin-section porosity",
							"acoustic porosity" });
			put("sonic velocity",
					new String[] { "sonic velocity", "axial P-wave velocity", "strike-parallel radial P-wave velocity",
							"strike-perpendicular radial P-wave velocity", "axial S-wave velocity",
							"strike-parallel radial S-wave velocity", "strike-perpendicular radial S-wave velocity" });
			put("temperature", new String[] { "temperature", "thermal conductivity", "heat flow",
					"thermal anisotropy", "heat production" });
		}
	};

	List<String> fragments;

	public RockPropertyFilter(String rockProperty) {
		fragments = new ArrayList<String>();
		if (ROCK_PROPERTY_MAP.containsKey(rockProperty)) {
			String[] rockProperties = ROCK_PROPERTY_MAP.get(rockProperty);
			List<String> propertyFragments = new ArrayList<String>();

			for (String property : rockProperties) {
				propertyFragments
						.add(this.generatePropertyIsEqualToFragment("ga_rock_properties_wfs:PROPERTY", property));
			}
			fragments.add(
					this.generateOrComparisonFragment(propertyFragments.toArray(new String[propertyFragments.size()])));
		} else {
			fragments.add(this.generatePropertyIsEqualToFragment("ga_rock_properties_wfs:PROPERTY", rockProperty));
		}
	}

	@Override
	public String getFilterStringAllRecords() {
		return this.generateFilter(this.generateAndComparisonFragment(fragments.toArray(new String[fragments.size()])));
	}

	@Override
	public String getFilterStringBoundingBox(FilterBoundingBox bbox) {
		List<String> localFragment = new ArrayList<String>(fragments);
		localFragment.add(this.generateBboxFragment(bbox, "ga_rock_properties_wfs:GEOM"));

		return this.generateFilter(
				this.generateAndComparisonFragment(localFragment.toArray(new String[localFragment.size()])));
	}

}
