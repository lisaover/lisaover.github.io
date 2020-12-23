---
title: "Census Tracts and Relationship Files"
excerpt: "This Census project explains the Allegheny County 2000-2010 Census Tract Relationship File and shows how the 2010 Census tracts in Allegheny County, Pennsylvania relate to the 2000 Census tracts.<br/><img src='/images/OpenDataCensusProject.png'>"
collection: portfolio
---

<a href="https://github.com/lisaover/PittOpenData">View the Project on GitHub</a>

# Allegheny County 2000/2010 Census Track Relationships
This final course project is published on the Western Pennsylvania Regional Data Center Website: <BR>
<a href="https://data.wprdc.org/dataset/allegheny-county-2000-2010-census-tract-relationships">Allegheny County 2000/2010 Census Track Relationships</a>

## DESCRIPTION

The Allegheny County 2000-2010 Census Tract Relationship File shows how 2010 Census tracts in Allegheny County, Pennsylvania relate to the 2000 Census tracts. Each record (row) consists of one unique relationship between a 2000 Census tract/2010 Census tract spatial set where a spatial set is the unique area shared by the record’s 2000 and 2010 tracts. Changes in tracts involve area, land area, population, and/or housing unit counts. Specifically, each record specifies the area, land area, population, and housing unit counts that were transferred to the record’s 2010 tract (TRACT10) from the record’s 2000 tract. The 2000 area (AREA00), land area (AREALAND00), population (POP00), and housing unit count (HU00) for the record is the standardized 2010 value for the record’s 2000 tract (TRACT00). These are the values to use when comparing 2010 population and housing unit counts to those values in the 2000 Census for a particular tract.

The relationship file provides the information necessary to conduct a decennial analysis between the 2000 and 2010 Censuses for a particular tract. Steps to use this file for a decennial analysis follow:
1. Obtain the population and/or housing unit count from the 2000 Census for the tract of interest.
2. Find a record in the relationship file where the tract of interest appears in the TRACT00 field. 
3. Compare the population (POP00) and housing unit count (HU00) from the relationship file record to the 2000 Census population and housing unit count found in step 1. 
