# D3.js Implementation Starter Templates
## UN Population Visualization Project

This document provides ready-to-use code templates for your key visualizations.

---

## Template 1: Animated Scatterplot (Hans Rosling Style)

### HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Demographic Transition Animation</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 20px;
        }
        
        .chart-container {
            position: relative;
        }
        
        .circle {
            stroke: #000;
            stroke-width: 0.5px;
            opacity: 0.7;
        }
        
        .axis-label {
            font-size: 14px;
            font-weight: bold;
        }
        
        .year-display {
            position: absolute;
            top: 50px;
            right: 50px;
            font-size: 120px;
            font-weight: bold;
            opacity: 0.2;
        }
        
        .controls {
            margin-top: 20px;
        }
        
        button {
            padding: 10px 20px;
            margin-right: 10px;
            font-size: 14px;
        }
        
        .legend {
            position: absolute;
            top: 20px;
            right: 20px;
        }
        
        .legend-item {
            margin-bottom: 5px;
        }
        
        .legend-circle {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <h1>Global Demographic Transition (1950-2100)</h1>
    <div class="chart-container">
        <svg id="chart"></svg>
        <div class="year-display" id="year">1950</div>
        <div class="legend" id="legend"></div>
    </div>
    
    <div class="controls">
        <button id="play">Play</button>
        <button id="pause">Pause</button>
        <button id="reset">Reset</button>
        <input type="range" id="year-slider" min="1950" max="2100" step="1" value="1950">
        <span id="slider-label">1950</span>
    </div>
    
    <script src="animated-scatterplot.js"></script>
</body>
</html>
```

### JavaScript Implementation (animated-scatterplot.js)
```javascript
// Configuration
const margin = {top: 60, right: 200, bottom: 60, left: 80};
const width = 1000 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const xScale = d3.scaleLinear()
    .domain([0, 8])  // Total Fertility Rate range
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([20, 90])  // Life Expectancy range
    .range([height, 0]);

const sizeScale = d3.scaleSqrt()
    .domain([0, 1500000])  // Population in thousands (adjust based on your data)
    .range([2, 50]);

// Color scale for regions
const colorScale = d3.scaleOrdinal()
    .domain(["Africa", "Asia", "Europe", "Latin America and the Caribbean", 
             "Northern America", "Oceania"])
    .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628"]);

// Axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

// Axis labels
svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .text("Total Fertility Rate (births per woman)");

svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .text("Life Expectancy at Birth (years)");

// Load and process data
let currentYear = 1950;
let isPlaying = false;
let animationInterval;

// Replace this with your actual data loading
d3.csv("population_data.csv").then(function(rawData) {
    
    // Process data: filter to countries only (not regions/world)
    const data = rawData.filter(d => d.Type === "Country");
    
    // Nest data by year
    const dataByYear = d3.group(data, d => +d.Year);
    
    // Create legend
    const regions = Array.from(new Set(data.map(d => d.Region))).sort();
    const legend = d3.select("#legend");
    
    regions.forEach(region => {
        const item = legend.append("div")
            .attr("class", "legend-item");
        
        item.append("span")
            .attr("class", "legend-circle")
            .style("background-color", colorScale(region));
        
        item.append("span")
            .text(region);
    });
    
    // Update function
    function update(year) {
        currentYear = year;
        
        // Update year display
        d3.select("#year").text(year);
        d3.select("#slider-label").text(year);
        d3.select("#year-slider").property("value", year);
        
        // Get data for current year
        const yearData = dataByYear.get(year) || [];
        
        // Data join
        const circles = svg.selectAll(".circle")
            .data(yearData, d => d.Country);  // Key function for object constancy
        
        // Enter
        circles.enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", d => xScale(+d["Total Fertility Rate"]))
            .attr("cy", d => yScale(+d["Life Expectancy at Birth, both sexes"]))
            .attr("r", 0)
            .attr("fill", d => colorScale(d.Region))
            .merge(circles)  // Merge with update selection
            .transition()
            .duration(300)
            .attr("cx", d => xScale(+d["Total Fertility Rate"]))
            .attr("cy", d => yScale(+d["Life Expectancy at Birth, both sexes"]))
            .attr("r", d => sizeScale(+d["Total Population, as of 1 July"]));
        
        // Exit
        circles.exit()
            .transition()
            .duration(300)
            .attr("r", 0)
            .remove();
        
        // Add tooltips
        svg.selectAll(".circle")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", "2px");
                
                // Show tooltip (you can enhance this)
                console.log(`${d.Country}: Fertility ${d["Total Fertility Rate"]}, 
                            Life Exp ${d["Life Expectancy at Birth, both sexes"]}, 
                            Pop ${d["Total Population, as of 1 July"]}`);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", "0.5px");
            });
    }
    
    // Animation controls
    function play() {
        if (isPlaying) return;
        isPlaying = true;
        
        animationInterval = setInterval(() => {
            if (currentYear >= 2100) {
                pause();
                return;
            }
            update(currentYear + 1);
        }, 200);  // 200ms per year = 30 seconds for 150 years
    }
    
    function pause() {
        isPlaying = false;
        clearInterval(animationInterval);
    }
    
    function reset() {
        pause();
        update(1950);
    }
    
    // Button event listeners
    d3.select("#play").on("click", play);
    d3.select("#pause").on("click", pause);
    d3.select("#reset").on("click", reset);
    
    // Slider event listener
    d3.select("#year-slider").on("input", function() {
        pause();
        update(+this.value);
    });
    
    // Initial render
    update(1950);
});
```

### Data CSV Format Expected
```csv
Country,Region,Type,Year,Total Fertility Rate,Life Expectancy at Birth both sexes,Total Population as of 1 July
Afghanistan,Asia,Country,1950,7.7,32.0,7752
Afghanistan,Asia,Country,1951,7.7,32.8,7841
...
```

---

## Template 2: Choropleth Map with Time Slider

### HTML Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>World Population Choropleth</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://unpkg.com/topojson@3"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        
        .country {
            stroke: #fff;
            stroke-width: 0.5px;
        }
        
        .country:hover {
            stroke: #000;
            stroke-width: 2px;
        }
        
        .tooltip {
            position: absolute;
            padding: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            border-radius: 4px;
            pointer-events: none;
            display: none;
        }
        
        .legend {
            margin-top: 20px;
        }
        
        .legend-item {
            display: inline-block;
            margin-right: 10px;
        }
        
        .color-box {
            display: inline-block;
            width: 30px;
            height: 15px;
            margin-right: 5px;
        }
        
        .slider-container {
            margin: 20px 0;
        }
        
        #year-slider {
            width: 600px;
        }
    </style>
</head>
<body>
    <h1>Life Expectancy by Country (1950-2024)</h1>
    
    <div class="slider-container">
        <input type="range" id="year-slider" min="1950" max="2024" step="1" value="1950">
        <span id="year-label">1950</span>
        <button id="play-map">Play</button>
        <button id="pause-map">Pause</button>
    </div>
    
    <svg id="map"></svg>
    <div class="tooltip" id="tooltip"></div>
    
    <div class="legend" id="legend"></div>
    
    <script src="choropleth-map.js"></script>
</body>
</html>
```

### JavaScript Implementation (choropleth-map.js)
```javascript
// Configuration
const width = 960;
const height = 600;

// Create SVG
const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

// Projection
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Color scale
const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([30, 85]);  // Life expectancy range

// Tooltip
const tooltip = d3.select("#tooltip");

// Load map and data
let currentYear = 1950;
let isPlaying = false;
let playInterval;

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
    d3.csv("population_data.csv")
]).then(([topology, populationData]) => {
    
    // Convert TopoJSON to GeoJSON
    const countries = topojson.feature(topology, topology.objects.countries);
    
    // Create lookup for data by country and year
    const dataLookup = new Map();
    populationData.forEach(d => {
        const key = `${d.ISO3}_${d.Year}`;
        dataLookup.set(key, d);
    });
    
    // Draw countries
    const countryPaths = svg.selectAll(".country")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .on("mouseover", function(event, d) {
            const countryData = getCountryData(d, currentYear);
            if (countryData) {
                tooltip
                    .style("display", "block")
                    .html(`
                        <strong>${countryData.Country}</strong><br/>
                        Life Expectancy: ${countryData["Life Expectancy at Birth, both sexes"]} years<br/>
                        Year: ${currentYear}
                    `);
            }
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
    
    // Function to get data for a country in a given year
    function getCountryData(geoFeature, year) {
        // You'll need to map between TopoJSON country IDs and your ISO3 codes
        // This is a simplified example
        const iso3 = geoFeature.id;  // Adjust based on your data
        const key = `${iso3}_${year}`;
        return dataLookup.get(key);
    }
    
    // Update map for a given year
    function updateMap(year) {
        currentYear = year;
        d3.select("#year-label").text(year);
        d3.select("#year-slider").property("value", year);
        
        countryPaths
            .transition()
            .duration(200)
            .attr("fill", d => {
                const data = getCountryData(d, year);
                if (data && data["Life Expectancy at Birth, both sexes"]) {
                    return colorScale(+data["Life Expectancy at Birth, both sexes"]);
                }
                return "#ccc";  // No data color
            });
    }
    
    // Create legend
    const legendWidth = 300;
    const legendHeight = 20;
    
    const legendSvg = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight + 40);
    
    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => d + " years");
    
    // Create gradient
    const defs = legendSvg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");
    
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
        gradient.append("stop")
            .attr("offset", `${(i / numStops) * 100}%`)
            .attr("stop-color", colorScale(30 + (55 * i / numStops)));
    }
    
    legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");
    
    legendSvg.append("g")
        .attr("transform", `translate(0,${legendHeight})`)
        .call(legendAxis);
    
    // Animation controls
    function play() {
        if (isPlaying) return;
        isPlaying = true;
        
        playInterval = setInterval(() => {
            if (currentYear >= 2024) {
                pause();
                return;
            }
            updateMap(currentYear + 1);
        }, 300);
    }
    
    function pause() {
        isPlaying = false;
        clearInterval(playInterval);
    }
    
    d3.select("#play-map").on("click", play);
    d3.select("#pause-map").on("click", pause);
    
    d3.select("#year-slider").on("input", function() {
        pause();
        updateMap(+this.value);
    });
    
    // Initial render
    updateMap(1950);
});
```

---

## Template 3: Scatterplot Matrix (SPLOM)

### Simplified SPLOM Implementation
```javascript
// Configuration
const indicators = [
    "Total Fertility Rate",
    "Life Expectancy at Birth, both sexes",
    "Infant Mortality Rate",
    "Population Growth Rate",
    "Median Age"
];

const spWidth = 150;
const spHeight = 150;
const padding = 30;

const totalWidth = indicators.length * spWidth + padding * 2;
const totalHeight = indicators.length * spHeight + padding * 2;

const svg = d3.select("#splom")
    .attr("width", totalWidth)
    .attr("height", totalHeight);

// Load data
d3.csv("population_data.csv").then(data => {
    
    // Filter to a specific year (or allow user selection)
    const yearData = data.filter(d => d.Year == "2024" && d.Type == "Country");
    
    // Create scale for each indicator
    const scales = {};
    indicators.forEach(indicator => {
        const extent = d3.extent(yearData, d => +d[indicator]);
        scales[indicator] = d3.scaleLinear()
            .domain(extent)
            .range([spHeight - 10, 10]);
    });
    
    // Create each cell of the matrix
    indicators.forEach((yIndicator, i) => {
        indicators.forEach((xIndicator, j) => {
            
            const cellX = j * spWidth + padding;
            const cellY = i * spHeight + padding;
            
            const cell = svg.append("g")
                .attr("transform", `translate(${cellX},${cellY})`);
            
            // Draw border
            cell.append("rect")
                .attr("width", spWidth)
                .attr("height", spHeight)
                .attr("fill", "none")
                .attr("stroke", "#ccc");
            
            // Diagonal: show histogram
            if (i === j) {
                // Create histogram
                const histogram = d3.histogram()
                    .value(d => +d[xIndicator])
                    .domain(scales[xIndicator].domain())
                    .thresholds(20);
                
                const bins = histogram(yearData);
                
                const yScale = d3.scaleLinear()
                    .domain([0, d3.max(bins, d => d.length)])
                    .range([spHeight - 10, 10]);
                
                cell.selectAll("rect.hist-bar")
                    .data(bins)
                    .enter()
                    .append("rect")
                    .attr("class", "hist-bar")
                    .attr("x", d => scales[xIndicator](d.x0))
                    .attr("y", d => yScale(d.length))
                    .attr("width", d => scales[xIndicator](d.x1) - scales[xIndicator](d.x0))
                    .attr("height", d => spHeight - 10 - yScale(d.length))
                    .attr("fill", "steelblue")
                    .attr("opacity", 0.7);
                
                // Add label
                cell.append("text")
                    .attr("x", spWidth / 2)
                    .attr("y", spHeight - 20)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "10px")
                    .text(xIndicator);
                
            } else {
                // Off-diagonal: scatterplot
                cell.selectAll("circle")
                    .data(yearData)
                    .enter()
                    .append("circle")
                    .attr("cx", d => scales[xIndicator](+d[xIndicator]))
                    .attr("cy", d => scales[yIndicator](+d[yIndicator]))
                    .attr("r", 2)
                    .attr("fill", "steelblue")
                    .attr("opacity", 0.5);
            }
        });
    });
});
```

---

## Template 4: Time-Series Line Chart with Multiple Regions

```javascript
// Configuration
const margin = {top: 20, right: 100, bottom: 30, left: 60};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#timeseries")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.csv("population_data.csv").then(data => {
    
    // Filter to regions only
    const regionData = data.filter(d => d.Type === "Region");
    
    // Nest by region
    const dataByRegion = d3.group(regionData, d => d.Region);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([1950, 2024])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(regionData, d => +d["Total Population, as of 1 July"])])
        .range([height, 0]);
    
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Line generator
    const line = d3.line()
        .x(d => xScale(+d.Year))
        .y(d => yScale(+d["Total Population, as of 1 July"]));
    
    // Draw lines
    dataByRegion.forEach((values, region) => {
        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", colorScale(region))
            .attr("stroke-width", 2)
            .attr("d", line);
        
        // Add label at the end
        const lastPoint = values[values.length - 1];
        svg.append("text")
            .attr("x", xScale(+lastPoint.Year) + 5)
            .attr("y", yScale(+lastPoint["Total Population, as of 1 July"]))
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .text(region);
    });
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    svg.append("g")
        .call(d3.axisLeft(yScale));
    
    // Labels
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 35)
        .text("Year");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .text("Population (thousands)");
});
```

---

## Data Preprocessing Script (Python)

```python
import pandas as pd
import json

# Load your UN dataset
df = pd.read_excel('WPP2024_Demographic_Indicators.xlsx')

# Clean and prepare
# Example: Select specific columns
columns_to_keep = [
    'Index', 'Variant', 'Region, subregion, country or area *', 
    'Location code', 'ISO3 Alpha-code', 'Type', 'Year',
    'Total Population, as of 1 July (thousands)',
    'Total Fertility Rate (live births per woman)',
    'Life Expectancy at Birth, both sexes (years)',
    'Infant Mortality Rate (infant deaths per 1,000 live births)',
    'Population Growth Rate (percentage)',
    'Median Age, as of 1 July (years)',
    'Crude Birth Rate (births per 1,000 population)',
    'Crude Death Rate (deaths per 1,000 population)',
    'Net Migration Rate (per 1,000 population)'
]

df_clean = df[columns_to_keep].copy()

# Rename columns for easier use
df_clean.columns = [
    'Index', 'Variant', 'Country', 'LocationCode', 'ISO3', 'Type', 'Year',
    'Total Population, as of 1 July', 'Total Fertility Rate',
    'Life Expectancy at Birth, both sexes', 'Infant Mortality Rate',
    'Population Growth Rate', 'Median Age',
    'Crude Birth Rate', 'Crude Death Rate', 'Net Migration Rate'
]

# Filter to "Medium" variant (standard projections)
df_clean = df_clean[df_clean['Variant'] == 'Medium']

# Export to CSV
df_clean.to_csv('population_data.csv', index=False)

# Create separate file for just countries (no regions, no world)
df_countries = df_clean[df_clean['Type'] == 'Country'].copy()
df_countries.to_csv('population_data_countries.csv', index=False)

# Create nested JSON by region for easier loading
nested = {}
for region in df_clean['Region'].unique():
    if pd.notna(region):
        region_data = df_clean[df_clean['Region'] == region].to_dict('records')
        nested[region] = region_data

with open('population_data_by_region.json', 'w') as f:
    json.dump(nested, f, indent=2)

print("Data preprocessing complete!")
print(f"Total records: {len(df_clean)}")
print(f"Years: {df_clean['Year'].min()} to {df_clean['Year'].max()}")
print(f"Countries: {len(df_clean[df_clean['Type'] == 'Country']['Country'].unique())}")
```

---

## Next Steps

1. **Copy these templates** into your project directory
2. **Adjust file paths** to match your data location
3. **Test with a small subset** of your data first
4. **Customize styling** to match your design vision
5. **Add more interactivity** as needed

## Tips for Success

### Use Browser DevTools
- Open Chrome/Firefox DevTools (F12)
- Check Console for errors
- Use Network tab to verify data loading
- Inspect elements to debug positioning

### Start Simple
- Get ONE circle rendering before animating hundreds
- Test with 1 year before adding time dimension
- Add features incrementally

### Common Issues

**Problem:** Nothing renders
- Check: Is data loading? (Console log the data)
- Check: Are scales correct? (Log xScale(value))
- Check: Are SVG dimensions visible? (Add a background rect)

**Problem:** Circles overlap strangely
- Solution: Add force simulation for collision detection
- Or: Add jitter for sparse data

**Problem:** Animation is choppy
- Solution: Reduce transition duration
- Or: Reduce number of data points (aggregate)

**Problem:** Colors look bad
- Solution: Use ColorBrewer or D3 color schemes
- Test with colorblind simulator

---

## Additional Resources

- **D3 Documentation:** https://d3js.org/documentation
- **Observable Examples:** https://observablehq.com/@d3/gallery
- **Stack Overflow:** Search "d3.js [your problem]"
- **D3 Discord:** Join for real-time help

---

**These templates give you ~60% of the implementation.**  
**The remaining 40% is refinement, styling, and YOUR creative additions.**

Start with Template 1 (animated scatterplot) – it's the most impactful for your demographic data!

Good luck! 🚀
