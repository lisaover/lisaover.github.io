---
title: "Census Tracts and Relationship Files"
excerpt: "Census project for Open Data and Government course fall 2019<br/><img src='/images/OpenDataCensusProject.png'>"
collection: portfolio
---

<a href="https://github.com/lisaover/PittOpenData">View Project on GitHub</a>

# Allegheny County 2000/2010 Census Track Relationships
This final course project is published on the Western Pennsylvania Regional Data Center Website: <BR>
<a href="https://data.wprdc.org/dataset/allegheny-county-2000-2010-census-tract-relationships">Allegheny County 2000/2010 Census Track Relationships</a>

## DESCRIPTION

The Allegheny County 2000-2010 Census Tract Relationship File shows how 2010 Census tracts in Allegheny County, Pennsylvania relate to the 2000 Census tracts. Each record (row) consists of one unique relationship between a 2000 Census tract/2010 Census tract spatial set where a spatial set is the unique area shared by the record’s 2000 and 2010 tracts. Changes in tracts involve area, land area, population, and/or housing unit counts. Specifically, each record specifies the area, land area, population, and housing unit counts that were transferred to the record’s 2010 tract (TRACT10) from the record’s 2000 tract. The 2000 area (AREA00), land area (AREALAND00), population (POP00), and housing unit count (HU00) for the record is the standardized 2010 value for the record’s 2000 tract (TRACT00). These are the values to use when comparing 2010 population and housing unit counts to those values in the 2000 Census for a particular tract. <BR> <BR>

The relationship file provides the information necessary to conduct a decennial analysis between the 2000 and 2010 Censuses for a particular tract. Steps to use this file for a decennial analysis follow:
1. Obtain the population and/or housing unit count from the 2000 Census for the tract of interest.
2. Find a record in the relationship file where the tract of interest appears in the TRACT00 field. 
3. Compare the population (POP00) and housing unit count (HU00) from the relationship file record to the 2000 Census population and housing unit count found in step 1. 

## FILES

### pa_allegheny_42003.csv

#### Source
<a href="https://www.census.gov/geographies/reference-files/2010/geo/relationship-files.html#par_textimage_19960473">https://www.census.gov/geographies/reference-files/2010/geo/relationship-files.html#par_textimage_19960473</a> (access page) <BR>
<a href="https://www2.census.gov/geo/docs/maps-data/data/rel/trf_txt/pa42trf.txt">https://www2.census.gov/geo/docs/maps-data/data/rel/trf_txt/pa42trf.txt</a> (data) <BR>
<a href="https://www2.census.gov/geo/docs/reference/bndrychange/pennsylvania.txt">https://www2.census.gov/geo/docs/reference/bndrychange/pennsylvania.txt</a> (2010 PA boundary change file) <BR>

#### Description
This file is a subset of the Pennsylvania relationship file that was retrieved directly from the Census Bureau (pa42trf.txt). This file includes any record where either TRACT00 or TRACT10 in pa42trf.txt was 3, indicating Allegheny County. Tracts are required to follow county lines, however, some of the records had another county specified as TRACT00 with Allegheny County as TRACT10 or vice versa. The 2010 boundary change file for Pennsylvania does not show any boundary changes for Allegheny County. According to Chris Briem, an economist from the University Center for Social and Urban Research (UCSUR), the Census Bureau updated its Pennsylvania geography between the 2000 and 2010 Censuses. The changes in the geography forced adjustments in the tract boundaries, which are reflected in the relationship file. After looking at the 2000 tract and county shape files, he said 2000 tracts line up with 2000 county lines. Likewise, after looking at the 2010 tract and county shape files, he said 2010 tracts line up with 2010 county lines. If working with a 2000 tract (TRACT00) for which the adjustment involved a non-Allegheny County tract, use the POP00 and HU00 values in the same way as with tracts involving only Allegheny County. <BR> <BR>

Allegheny Census tract boundaries changed significantly after the 2000 Census. Chris Briem said that two factors influenced these changes:
• The City of Pittsburgh and other areas within Allegheny County had experienced dramatic population declines, and many tracts were merged to accommodate the population requirement. This phenomenon may also be seen in other regions of the country.
• The Census Bureau changed how tracts were handled in unpopulated areas. Starting with the 2010 Census, unpopulated areas were divided into tracts separately from populated areas.

### Data Dictionary.csv

#### Source
<a href="https://www.census.gov/programs-surveys/geography/technical-documentation/records-layout/2010-census-tract-record-layout.html">https://www.census.gov/programs-surveys/geography/technical-documentation/records-layout/2010-census-tract-record-layout.html</a>

#### Description
This file contains information about the fields in the 2000 to 2010 Census Tract Relationship file.

### About Tracts and Boundary Changes.pdf

#### Sources
<a href="https://www.census.gov/programs-surveys/geography/guidance/geographic-areas-reference-manual.html">https://www.census.gov/programs-surveys/geography/guidance/geographic-areas-reference-manual.html</a> (Geographic Areas Reference Manual) <BR>
<a href="https://www2.census.gov/geo/pdfs/reference/GARM/Ch10GARM.pdf">https://www2.census.gov/geo/pdfs/reference/GARM/Ch10GARM.pdf</a> (Chapter 10: Census Tracts and Block Numbering Areas) <BR>
<a href="https://www.census.gov/programs-surveys/geography/guidance/hierarchy.html">https://www.census.gov/programs-surveys/geography/guidance/hierarchy.html</a> (Hierarchy Diagrams) <BR>
<a href="https://www2.census.gov/geo/pdfs/reference/geodiagram.pdf?#">https://www2.census.gov/geo/pdfs/reference/geodiagram.pdf?#</a> (Standard Hierarchy of Census Geographic Areas) <BR>
<a href="https://www2.census.gov/geo/pdfs/education/CensusTracts.pdf">https://www2.census.gov/geo/pdfs/education/CensusTracts.pdf</a> (PDF of slide presentation about Census Tracts) <BR>
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/</a> (TIGER shape files for 2000 and 2010 Census tracts) <BR>

#### Description
This file includes information about Census tracts and the relationship file. It describes the purpose of Census tracts and how and why tract boundaries change. 

### Tract 402 Area Changes Illustrated.pdf

#### Source
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/</a> (TIGER shape files for 2000 and 2010 Census tracts)

#### Description
This file uses a map and the area of tract 402 to illustrate how each relationship file record corresponds to a unique tract boundary change. Although population is what drives Census tract boundary changes, area lends itself well to visualization, which promotes a more intuitive understanding of the relationships of tracts across Censuses. Changes in area do not always mean population and housing unit counts changed because of the new conventions for unpopulated areas, however, population and/or housing unit count changes necessarily involve a change in area.  <BR> <BR>

The boundary lines are dark green where the 2000 tract boundaries coincide with the 2010 tract boundaries. The 2010 Census tract boundaries are light green in color and the 2000 Census tract boundaries are black in color where they differ from each other, indicating tract changes between the two Censuses. The tract numbers displayed are those of the 2010 Census. 

### 2000Tracts-2010Tracts.png

#### Sources
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract00.zip">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract00.zip</a> (2000 Census tract boundaries) <BR>
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract10.zip">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract10.zip</a> (2010 Census tract boundaries) <BR>

#### Description
This file is an image of 2000 Census tract boundaries overlaid with 2010 Census tract boundaries. The purpose of this file is to illustrate the changes to tract boundaries for the 2010 Census. The boundary lines are dark green where the 2000 tract boundaries coincide with the 2010 tract boundaries. The 2010 Census tract boundaries are light green in color and the 2000 Census tract boundaries are black in color where they differ from each other, indicating tract changes between the two Censuses. The tract numbers displayed are those of the 2010 Census.

### pa_allegheny_42003.json

#### Source 
pa_allegheny_42003.csv

#### Description
In this JSON file, Allegheny County 2000/2010 Census Tract Relationship File data is organized by tract. All tracts are included whether from the 2000 Census, 2010 Census, or both. Data for each tract includes the following: <BR> <BR>

* Tract number (referred to below as the ‘main tract’ for distinction from the tracts that have a relationship with this tract)
o  For each measure - Area, Land Area, Population, and Housing Units - the following is provided
* 2010 Value
* Standardized Value
* Value incorporated into the tract for the 2010 Census; the sum of the quantities equal the 2010 value; the sum of the percentages equal 100
* Includes each tract number, shared quantity, and percentage of the 2010 value
* This also includes the portion of the main tract that can be considered to have been ‘incorporated into itself from itself’
* Value transferred out of the tract for the 2010 Census; the sum of the quantities equal the standardized 2010 value; the sum of the percentages equal 100%
* Includes each tract number, shared quantity, and percentage of the standardized 2010 value
* This also includes the portion of the main tract that can be considered to have been ‘transferred from itself to itself’

#### Note
For tracts new in 2010, the JSON file only has the ‘<Measure> incorporated into tract <#>’ section. For 2000 tracts that do not exist in 2010, the JSON file only has the ‘<Measure> transferred out of tract <#>’ section.

#### Example
"Summary for Tract 402.0 (Allegheny)": { <BR>
    "Area": { <BR>
      "2010 Area": "613251", <BR>
      "Standardized Area": "621501", <BR>
      "Areas incorporated into tract 402.0": { <BR>
        "Tract 305.0 (Allegheny).": { <BR>
          "Quantity": "3101", <BR>
          "Percentage of 2010": "0.51" <BR>
        }, <BR>
        "Tract 402.0 (Allegheny).": { <BR>
          "Quantity": "609149", <BR>
          "Percentage of 2010": "99.33" <BR>
        }, <BR>
        "Tract 511.0 (Allegheny).": { <BR>
          "Quantity": "1001", <BR>
          "Percentage of 2010": "0.16" <BR>
        } <BR>
      }, <BR>
      "Areas transferred out of tract 402.0": { <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "609149", <BR>
          "Percentage of Standardized": "98.01" <BR>
        }, <BR>
        "Tract 510.0 (Allegheny)": { <BR>
          "Quantity": "12352", <BR>
          "Percentage of Standardized": "1.99" <BR>
        } <BR>
      } <BR>
    }, <BR> 
    "Land Area": { <BR>
      "2010 Land Area": "613251", <BR>
      "Standardized Land Area": "621501", <BR>
      "Land areas incorporated into tract 402.0": { <BR>
        "Tract 305.0 (Allegheny)": { <BR>
          "Quantity": "3101", <BR>
          "Percentage of 2010": "0.51" <BR> 
        },  <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "609149", <BR>
          "Percentage of 2010": "99.33" <BR>
        }, <BR>
        "Tract 511.0 (Allegheny)": { <BR>
          "Quantity": "1001", <BR>
          "Percentage of 2010": "0.16" <BR>
        } <BR>
      }, <BR>
      "Land areas transferred out of tract 402.0": { <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "609149", <BR>
          "Percentage of Standardized": "98.01" <BR>
        }, <BR>
        "Tract 510.0 (Allegheny)": { <BR>
          "Quantity": "12352", <BR>
          "Percentage of Standardized": "1.99" <BR>
        } <BR>
      } <BR>
    }, <BR>
    "Population": { <BR>
      "2010 Population": "2604", <BR>
      "Standardized Population": "2717", <BR>
      "Population incorporated into tract 402.0": { <BR>
        "Tract 305.0 (Allegheny)": { <BR>
          "Quantity": "2", <BR>
          "Percentage of 2010": "0.08" <BR>
        }, <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "2602", <BR>
          "Percentage of 2010": "99.92" <BR>
        }, <BR>
        "Tract 511.0 (Allegheny)": { <BR>
          "Quantity": "0", <BR>
          "Percentage of 2010": "0.0" <BR>
        } <BR>
      }, <BR>
      "Population transferred out of tract 402.0": { <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "2602", <BR>
          "Percentage of Standardized": "95.77" <BR>
        }, <BR>
        "Tract 510.0 (Allegheny)": { <BR>
          "Quantity": "115", <BR>
          "Percentage of Standardized": "4.23" <BR>
        } <BR>
      } <BR>
    }, <BR>
    "Housing Units": { <BR>
      "2010 Housing Units": "687", <BR>
      "Standardized Housing Units": "744", <BR>
      "Housing units incorporated into tract 402.0": { <BR>
        "Tract 305.0 (Allegheny)": { <BR>
          "Quantity": "1", <BR>
          "Percentage of 2010": "0.15" <BR>
        }, <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "686", <BR>
          "Percentage of 2010": "99.85" <BR>
        }, <BR>
        "Tract 511.0 (Allegheny)": { <BR>
          "Quantity": "0", <BR>
          "Percentage of 2010": "0.0" <BR>
        } <BR>
      }, <BR>
      "Housing units transferred out of tract 402.0": { <BR>
        "Tract 402.0 (Allegheny)": { <BR>
          "Quantity": "686", <BR>
          "Percentage of Standardized": "92.2" <BR>
        }, <BR>
        "Tract 510.0 (Allegheny)": { <BR>
          "Quantity": "58", <BR>
          "Percentage of Standardized": "7.8" <BR>
        } <BR>
      } <BR>
    } <BR>
  } <BR>


### AlleghenyMunicipal-2010Tracts.png

#### Sources
<a href="https://data.wprdc.org/dataset/allegheny-county-municipal-boundaries">https://data.wprdc.org/dataset/allegheny-county-municipal-boundaries</a> (Allegheny County municipal boundaries) <BR>
<a href="https://www2.census.gov/geo/tiger/TIGER2010/COUNTY/2010/">https://www2.census.gov/geo/tiger/TIGER2010/COUNTY/2010/</a> (Pennsylvania county boundaries) <BR>

#### Description
This file is an image of Allegheny County municipal boundaries overlaid with 2010 Census tract boundaries. The purpose of this file is to assist users in finding any tracts or parts of tracts that reside within a particular municipality. The 2010 Census tract boundaries are light blue in color. The municipal boundaries are purple where they coincide with the tract boundaries. The red lines are municipal boundaries that do not coincide with tract boundaries. 


### tl_2010_42003_tract00.zip

#### Source
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract00.zip">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract00.zip</a>

#### Description
This file contains TIGER shape files for the 2000 tract boundaries for Allegheny County.


### tl_2010_42003_tract10.zip


#### Source
<a href="https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract10.zip">https://www2.census.gov/geo/pvs/tiger2010st/42_Pennsylvania/42003/tl_2010_42003_tract10.zip</a>

#### Description
This file contains TIGER shape files for the 2010 tract boundaries for Allegheny County.
