// Original code by: Michael Keith
// Source: https://observablehq.com/@michael-keith/draggable-globe-in-d3

// This version of the code introduces the following modifications:
// 1. A tooltip for displaying the country's name, population, density, area, and flag.
// 2. Retrieval and display of each country"s flag within the tooltip.
// 3. Added csv with country data in order to create the cloropleth map.
// 4. Mouseover and mouseout events for highlighting the selected country.
// 5. Comments and code formatting.

// DATA SOURCES
// ----------------------------------------
const GEO_JSON_PATH = "data/globeCoordinates.json";
const DATA_CSV_PATH = "data/world-demographic.csv";
const FLAG_PATH = "./img/flags/";
let DATA_YEAR = 2023; // Year to visualize
let VISUALIZATION_MODE = "population"; // Current visualization mode: population, density, sex-ratio, median-age

//  CLOROPLETH MAP VARIABLES
// ----------------------------------------
const COLOR_RANGES = {
    population: ["#ffffff", "#5c1010"],
    density: ["#ffffff", "#1e5c8b"],
    "sex-ratio": ["#8b1e5c", "#ffffff", "#1e5c8b"], // Low (more female) to high (more male)
    "median-age": ["#5c8b1e", "#ffffff", "#8b5c1e"] // Young to old
};
const COLOR_NO_DATA = "#B2B2B2";
const COLOR_HOVER = "#D3D3D3"
const COLOR_SCALE = "linear"; // "linear" or "log"

// GLOBE VARIABLES
// ----------------------------------------
const GLOBE_CONTAINER = d3.select("#globe-container");
let GLOBE_WIDTH = GLOBE_CONTAINER.node().getBoundingClientRect().width;
let GLOBE_HEIGHT = window.innerHeight - 180; // Account for navbar (70px) and controls (110px)
let GLOBE_RADIUS = GLOBE_HEIGHT / 2.8;
let GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];


// INTERACTION VARIABLES
// ----------------------------------------
const ROTATION_SENSITIVITY = 60;
const ZOOM_SENSITIVITY = 0.5;
let rotationTimer;
let animationTimer;
let isPlaying = false;

// VIEW MODE VARIABLES
// ----------------------------------------
let currentViewMode = "3d"; // "3d" or "2d"
let selectedCountry = null;
let isDetailMode = false;

// GLOBE STATE
// ----------------------------------------
let currentRotation = [0, -25]; // Store current rotation [longitude, latitude]
let currentZoomScale = null; // Store current zoom scale

// CACHED DATA
// ----------------------------------------
let cachedGeoJson = null;
let cachedRawData = null;

// MAIN FUNCTION
// ----------------------------------------
async function drawGlobe(viewMode = "3d") {

    // Init variables
    if (!cachedGeoJson) {
        cachedGeoJson = await d3.json(GEO_JSON_PATH);
    }
    if (!cachedRawData) {
        cachedRawData = await d3.csv(DATA_CSV_PATH);
    }
    
    const geoJson = cachedGeoJson;
    const rawData = cachedRawData;
    
    // Filter for Country/Area entries in the specified year
    const contextData = rawData
        .filter(d => d.Type === "Country/Area" && +d.Year === DATA_YEAR)
        .map((d, index) => ({
            rank: index + 1,
            country: d["Region, subregion, country or area *"],
            alpha3_code: d["ISO3 Alpha-code"],
            population_number: +(d["Total Population, as of 1 July (thousands)"].replace(/[^0-9.]/g, "") * 1000),
            population: formatPopulation(+(d["Total Population, as of 1 July (thousands)"].replace(/[^0-9.]/g, "") * 1000)),
            sex_ratio: d["Population Sex Ratio, as of 1 July (males per 100 females)"],
            sex_ratio_number: parseFloat(d["Population Sex Ratio, as of 1 July (males per 100 females)"].replace(/[^0-9.]/g, "")) || 100,
            population_density: d["Population Density, as of 1 July (persons per square km)"],
            population_density_number: parseFloat(d["Population Density, as of 1 July (persons per square km)"].replace(/[^0-9.]/g, "")) || 0,
            median_age: d["Median Age, as of 1 July (years)"],
            median_age_number: parseFloat(d["Median Age, as of 1 July (years)"].replace(/[^0-9.]/g, "")) || 0
        }))
        .filter(d => d.alpha3_code && d.population_number > 0)
        .sort((a, b) => b.population_number - a.population_number)
        .map((d, index) => ({ ...d, rank: index + 1 }));
    
    const colorPalette = createColorPalette(contextData);
    const toolTip = d3.select("#tooltip")

    // Projection initialization based on view mode
    let geoProjection;
    if (viewMode === "3d") {
        geoProjection = d3.geoOrthographic()
            .scale(currentZoomScale || GLOBE_RADIUS)
            .center([0, 0])
            .rotate(currentRotation)
            .translate(GLOBE_CENTER);
    } else {
        // 2D Map view using Equirectangular projection
        geoProjection = d3.geoEquirectangular()
            .scale(currentZoomScale || (GLOBE_RADIUS * 0.8))
            .center([0, 0])
            .translate(GLOBE_CENTER);
    }

    const initialScale = geoProjection.scale();

    // Append svg to the container
    const globeSvg = d3.select("#globe-container")
        .append("svg")
        .attr("width", GLOBE_WIDTH)
        .attr("height", GLOBE_HEIGHT);

    drawLegend(colorPalette);

    // Convert geoJson data to svg path
    const geoPathGenerator = d3.geoPath().projection(geoProjection);

    // Set outline of the globe (only for 3D view)
    if (viewMode === "3d") {
        globeSvg.append("circle")
            .attr("id", "globe")
            .attr("cx", GLOBE_WIDTH / 2)
            .attr("cy", GLOBE_HEIGHT / 2)
            .attr("r", geoProjection.scale());
    }

    // Append a group to the svg
    const globeMap = globeSvg.append("g")

    // Creating function to update the geoProjection
    globeSvg.call(createDrag(geoProjection, globeSvg, geoPathGenerator, viewMode));

    // Creating function to zoom in and out
    configureZoom(globeSvg, initialScale, geoProjection, viewMode);

    // Read geoJson data and draw the globe (country by country)
    globeMap.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(geoJson.features)
        .enter().append("path")
        .attr("d", geoPathGenerator)
        .style("fill", country => getColor(country, contextData, colorPalette))

        // Update contry on mouseover & mouseout
        .on("mouseover", function (country) {
            if (!isDetailMode) {
                d3.select(this)
                    .style("fill", COLOR_HOVER)

                toolTip.transition()
                    .style("display", "block")
                    .style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px");

                const countryDict = {
                    name: country.properties.name,
                    code: country.id,
                    ranking: getCountryProperty(country.id, "rank", contextData),
                    population: getCountryProperty(country.id, "population", contextData),
                    density: getCountryProperty(country.id, "population_density", contextData) + " per km²",
                    sexRatio: getCountryProperty(country.id, "sex_ratio", contextData),
                    medianAge: getCountryProperty(country.id, "median_age", contextData) + " years",
                };

                updateTooltipContent(countryDict);
            }
        })
        .on("mouseout", function () {
            if (!isDetailMode) {
                d3.select(this)
                    .style("fill", country => getColor(country, contextData, colorPalette))

                toolTip.transition()
                    .style("display", "none");
            }
        })
        .on("click", function(country) {
            // Prevent event bubbling
            d3.event.stopPropagation();
            
            // Handle country click for detail view
            const countryCode = country.id;
            const countryName = country.properties.name;
            
            console.log("Country clicked:", countryName, countryCode);
            showCountryDetail(countryCode, countryName);
        });

    // Optional rotate (only for 3D view)
    if (viewMode === "3d") {
        rotateGlobe(geoProjection, globeSvg, geoPathGenerator);
    }
};

// HELPER FUNCTIONS
// ----------------------------------------
function formatPopulation(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + " billion";
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + " million";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + " thousand";
    }
    return num.toString();
}

function createColorPalette(data) {
    let scale;
    const COLOR_RANGE = COLOR_RANGES[VISUALIZATION_MODE];
    
    let dataValues;
    switch(VISUALIZATION_MODE) {
        case "population":
            dataValues = data.map(d => d.population_number);
            break;
        case "density":
            dataValues = data.map(d => d.population_density_number);
            break;
        case "sex-ratio":
            dataValues = data.map(d => d.sex_ratio_number);
            break;
        case "median-age":
            dataValues = data.map(d => d.median_age_number);
            break;
        default:
            dataValues = data.map(d => d.population_number);
    }
    
    const [minValue, maxValue] = d3.extent(dataValues.filter(v => v > 0));
    
    if (COLOR_SCALE === "log" && VISUALIZATION_MODE === "population") {
        scale = d3.scaleLog()
    } else if (VISUALIZATION_MODE === "sex-ratio") {
        // Diverging scale for sex ratio (centered around 100)
        scale = d3.scaleLinear()
            .domain([minValue, 100, maxValue])
            .range(COLOR_RANGE);
        return scale;
    } else if (VISUALIZATION_MODE === "median-age") {
        // Diverging scale for median age
        const midValue = (minValue + maxValue) / 2;
        scale = d3.scaleLinear()
            .domain([minValue, midValue, maxValue])
            .range(COLOR_RANGE);
        return scale;
    } else {
        scale = d3.scaleLinear()
    }
    return scale
        .domain([minValue, maxValue])
        .range(COLOR_RANGE);
};

function createDrag(geoProjection, globeSvg, geoPathGenerator, viewMode) {
    // Only enable drag for 3D view
    if (viewMode === "2d") {
        return d3.drag()
            .on("start", null)
            .on("drag", null)
            .on("end", null);
    }
    
    return d3.drag().on("start", () => {
        if (rotationTimer) rotationTimer.stop();
    })
    .on("drag", () => {
        // Rotate for 3D globe
        const rotate = geoProjection.rotate()
        const rotationAdjustmentFactor = ROTATION_SENSITIVITY / geoProjection.scale()

        geoProjection.rotate([
            rotate[0] + d3.event.dx * rotationAdjustmentFactor,
            rotate[1] - d3.event.dy * rotationAdjustmentFactor
        ])
        
        // Save current rotation
        currentRotation = geoProjection.rotate();

        geoPathGenerator = d3.geoPath().projection(geoProjection)
        globeSvg.selectAll("path").attr("d", geoPathGenerator)
    })
    .on("end", () => {
        // Save final rotation state
        currentRotation = geoProjection.rotate();
        rotateGlobe(geoProjection, globeSvg, geoPathGenerator);
    });
};


function rotateGlobe(geoProjection, globeSvg, geoPathGenerator) {
    if (rotationTimer) rotationTimer.stop();
    rotationTimer = d3.timer(function (elapsed) {
        const rotate = geoProjection.rotate()
        const rotationAdjustmentFactor = ROTATION_SENSITIVITY / geoProjection.scale()
        geoProjection.rotate([
            rotate[0] - 1 * rotationAdjustmentFactor,
            rotate[1]
        ])
        
        // Save current rotation
        currentRotation = geoProjection.rotate();
        
        geoPathGenerator = d3.geoPath().projection(geoProjection)
        globeSvg.selectAll("path").attr("d", geoPathGenerator)
    });
};

function getCountryProperty(alpha3_code, property, contextData) {
    return contextData
        .filter(d => d.alpha3_code === alpha3_code)
        .map(d => d[property])
        .pop();
};

function getColor(d, contextData, colorPalette) {
    const countryData = contextData.filter(datum => datum.alpha3_code == d.id);
    if (countryData.length === 0) return COLOR_NO_DATA;
    
    let value;
    switch(VISUALIZATION_MODE) {
        case "population":
            value = countryData[0].population_number;
            break;
        case "density":
            value = countryData[0].population_density_number;
            break;
        case "sex-ratio":
            value = countryData[0].sex_ratio_number;
            break;
        case "median-age":
            value = countryData[0].median_age_number;
            break;
        default:
            value = countryData[0].population_number;
    }
    
    return value > 0 ? colorPalette(value) : COLOR_NO_DATA;
};

function updateTooltipContent(country) {
    d3.select("#tooltip-country-name").text(country.name);
    d3.select("#tooltip-flag").attr("src", `${FLAG_PATH}${country.code}.png`);
    d3.select("#tooltip-rank").text(country.ranking || "N/A");
    d3.select("#tooltip-population").text(country.population || "N/A");
    d3.select("#tooltip-density").text(country.density || "N/A");
    d3.select("#tooltip-sex-ratio").text(country.sexRatio || "N/A");
    d3.select("#tooltip-median-age").text(country.medianAge || "N/A");
};

function drawLegend(colorPalette) {
    let colorScale = d3.select("#color-scale");

    // Clear any existing legend
    colorScale.selectAll("svg").remove();

    // Set color background gradient
    const COLOR_RANGE = COLOR_RANGES[VISUALIZATION_MODE];
    if (COLOR_RANGE.length === 3) {
        // Diverging scale
        colorScale.style("background", `linear-gradient(to right, ${COLOR_RANGE[0]}, ${COLOR_RANGE[1]}, ${COLOR_RANGE[2]})`);
    } else {
        colorScale.style("background", `linear-gradient(to right, ${COLOR_RANGE[0]}, ${COLOR_RANGE[1]})`);
    }

    const legendWidth = colorScale.node().getBoundingClientRect().width;

    const xScale = d3.scaleLinear()
        .range([0, legendWidth])

    const legendAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => {
            if (VISUALIZATION_MODE === "sex-ratio") {
                return d.toFixed(1);
            } else if (VISUALIZATION_MODE === "median-age") {
                return d.toFixed(0) + "y";
            } else if (VISUALIZATION_MODE === "density") {
                return d3.format(".0f")(d);
            } else {
                return d3.format(".2s")(d);
            }
        });

    const legendSvg = d3.select("#color-scale").append("svg")
    const legendHeight = legendSvg.node().getBoundingClientRect().height;

    legendSvg.append('g')
        .attr("transform", `translate(0, ${legendHeight / 4})`)
        .call(legendAxis)
        .selectAll("text")
        .style("fill", "#333")
        .style("font-size", "11px");
};

function configureZoom(globeSvg, initialScale, geoProjection, viewMode) {
    globeSvg.call(d3.zoom()
        .on('zoom', () => {
            if (d3.event.transform.k > ZOOM_SENSITIVITY) {
                let newScale = initialScale * d3.event.transform.k;
                geoProjection.scale(newScale);
                
                // Save current zoom scale
                currentZoomScale = newScale;
                
                let path = d3.geoPath().projection(geoProjection);
                globeSvg.selectAll("path").attr("d", path);
                if (viewMode === "3d") {
                    globeSvg.selectAll("circle").attr("d", path);
                    globeSvg.selectAll("circle").attr("r", geoProjection.scale());
                }
            } else {
                d3.event.transform.k = ZOOM_SENSITIVITY;
            }
        }));
};

// TOGGLE VIEW FUNCTION
// ----------------------------------------
function toggleView() {
    // Stop any rotation timer
    if (rotationTimer) {
        rotationTimer.stop();
    }

    // Clear the current visualization
    d3.select("#globe-container").selectAll("*").remove();

    // Toggle the view mode
    currentViewMode = currentViewMode === "3d" ? "2d" : "3d";
    
    // Reset zoom scale when switching views
    currentZoomScale = null;

    // Update button text
    const toggleButton = d3.select("#toggle-text");
    if (currentViewMode === "3d") {
        toggleButton.text("2D Map View");
    } else {
        toggleButton.text("3D Globe View");
    }

    // Redraw with new view mode
    drawGlobe(currentViewMode);
}

// INIT
// ----------------------------------------
drawGlobe(currentViewMode);

// Set up toggle button event listener
d3.select("#view-toggle-btn").on("click", toggleView);

// Year slider event listener
const yearSlider = document.getElementById("year-slider");
const currentYearDisplay = document.getElementById("current-year");

yearSlider.addEventListener("input", (e) => {
    DATA_YEAR = parseInt(e.target.value);
    currentYearDisplay.textContent = DATA_YEAR;
});

yearSlider.addEventListener("change", (e) => {
    DATA_YEAR = parseInt(e.target.value);
    updateVisualization();
});

// Mode selector event listeners
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        // Remove active class from all buttons
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        
        // Add active class to clicked button
        e.target.classList.add("active");
        
        // Update visualization mode
        VISUALIZATION_MODE = e.target.dataset.mode;
        updateVisualization();
    });
});

// Playback controls
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

playBtn.addEventListener("click", () => {
    isPlaying = true;
    playBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    
    animationTimer = setInterval(() => {
        if (DATA_YEAR < 2023) {
            DATA_YEAR++;
            yearSlider.value = DATA_YEAR;
            currentYearDisplay.textContent = DATA_YEAR;
            updateVisualization();
        } else {
            // Stop at the end
            isPlaying = false;
            playBtn.style.display = "inline-block";
            pauseBtn.style.display = "none";
            clearInterval(animationTimer);
        }
    }, 500); // Update every 500ms
});

pauseBtn.addEventListener("click", () => {
    isPlaying = false;
    playBtn.style.display = "inline-block";
    pauseBtn.style.display = "none";
    clearInterval(animationTimer);
});

resetBtn.addEventListener("click", () => {
    if (isPlaying) {
        clearInterval(animationTimer);
        isPlaying = false;
        playBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";
    }
    DATA_YEAR = 2023;
    yearSlider.value = 2023;
    currentYearDisplay.textContent = 2023;
    updateVisualization();
});

// Close detail panel button
document.getElementById("close-detail-btn").addEventListener("click", closeCountryDetail);

// Helper function to update visualization
function updateVisualization() {
    // Stop rotation if active
    if (rotationTimer) {
        rotationTimer.stop();
    }
    
    // Instead of clearing and redrawing, just update the data and colors
    updateGlobeData();
}

// Update globe data without resetting position
async function updateGlobeData() {
    if (!cachedRawData) return;
    
    const rawData = cachedRawData;
    
    // Filter for Country/Area entries in the specified year
    const contextData = rawData
        .filter(d => d.Type === "Country/Area" && +d.Year === DATA_YEAR)
        .map((d, index) => ({
            rank: index + 1,
            country: d["Region, subregion, country or area *"],
            alpha3_code: d["ISO3 Alpha-code"],
            population_number: +(d["Total Population, as of 1 July (thousands)"].replace(/[^0-9.]/g, "") * 1000),
            population: formatPopulation(+(d["Total Population, as of 1 July (thousands)"].replace(/[^0-9.]/g, "") * 1000)),
            sex_ratio: d["Population Sex Ratio, as of 1 July (males per 100 females)"],
            sex_ratio_number: parseFloat(d["Population Sex Ratio, as of 1 July (males per 100 females)"].replace(/[^0-9.]/g, "")) || 100,
            population_density: d["Population Density, as of 1 July (persons per square km)"],
            population_density_number: parseFloat(d["Population Density, as of 1 July (persons per square km)"].replace(/[^0-9.]/g, "")) || 0,
            median_age: d["Median Age, as of 1 July (years)"],
            median_age_number: parseFloat(d["Median Age, as of 1 July (years)"].replace(/[^0-9.]/g, "")) || 0
        }))
        .filter(d => d.alpha3_code && d.population_number > 0)
        .sort((a, b) => b.population_number - a.population_number)
        .map((d, index) => ({ ...d, rank: index + 1 }));
    
    const colorPalette = createColorPalette(contextData);
    
    // Update country colors with smooth transition
    d3.selectAll(".countries path")
        .transition()
        .duration(300)
        .style("fill", country => getColor(country, contextData, colorPalette));
    
    // Update legend
    drawLegend(colorPalette);
    
    // Resume rotation if in 3D mode and not in detail mode
    if (currentViewMode === "3d" && !isDetailMode) {
        const globeSvg = d3.select("#globe-container svg");
        const geoProjection = d3.geoOrthographic()
            .scale(currentZoomScale || GLOBE_RADIUS)
            .center([0, 0])
            .rotate(currentRotation)
            .translate(GLOBE_CENTER);
        const geoPathGenerator = d3.geoPath().projection(geoProjection);
        
        rotateGlobe(geoProjection, globeSvg, geoPathGenerator);
    }
}

// Country Detail Functions
// ----------------------------------------
function showCountryDetail(countryCode, countryName) {
    console.log("showCountryDetail called:", countryCode, countryName);
    
    selectedCountry = countryCode;
    isDetailMode = true;
    
    // Hide tooltip
    d3.select("#tooltip").style("display", "none");
    
    // Show detail panel
    const detailPanel = document.getElementById("country-detail-panel");
    detailPanel.style.display = "block";
    
    // Force reflow before adding active class
    setTimeout(() => {
        detailPanel.classList.add("active");
    }, 10);
    
    // Resize globe container
    const globeContainer = document.getElementById("globe-container");
    globeContainer.classList.add("detail-mode");
    
    // Get country data across all years
    const countryData = cachedRawData.filter(d => 
        d.Type === "Country/Area" && d["ISO3 Alpha-code"] === countryCode
    ).map(d => ({
        year: +d.Year,
        population: +(d["Total Population, as of 1 July (thousands)"].replace(/[^0-9.]/g, "") * 1000),
        density: parseFloat(d["Population Density, as of 1 July (persons per square km)"].replace(/[^0-9.]/g, "")) || 0,
        sexRatio: parseFloat(d["Population Sex Ratio, as of 1 July (males per 100 females)"].replace(/[^0-9.]/g, "")) || 100,
        medianAge: parseFloat(d["Median Age, as of 1 July (years)"].replace(/[^0-9.]/g, "")) || 0
    })).sort((a, b) => a.year - b.year);
    
    console.log("Country data points:", countryData.length);
    
    if (countryData.length === 0) {
        console.error("No data found for country:", countryCode);
        return;
    }
    
    // Update header
    document.getElementById("detail-country-name").textContent = countryName;
    document.getElementById("detail-flag").src = `${FLAG_PATH}${countryCode}.png`;
    
    const latestData = countryData[countryData.length - 1];
    document.getElementById("detail-country-stats").innerHTML = `
        Population: <strong>${formatPopulation(latestData.population)}</strong> | 
        Density: <strong>${latestData.density.toFixed(1)} per km²</strong> | 
        Sex Ratio: <strong>${latestData.sexRatio.toFixed(1)}</strong> | 
        Median Age: <strong>${latestData.medianAge.toFixed(1)} years</strong>
    `;
    
    // Draw charts with a small delay to ensure panel is visible
    setTimeout(() => {
        console.log("Drawing charts...");
        drawLineChart(countryData, "population", "population-chart", "Population");
        drawLineChart(countryData, "density", "density-chart", "Density (per km²)");
        drawLineChart(countryData, "sexRatio", "sex-ratio-chart", "Sex Ratio");
        drawLineChart(countryData, "medianAge", "median-age-chart", "Median Age (years)");
    }, 100);
    
    // Update globe dimensions for smaller view
    setTimeout(() => {
        GLOBE_WIDTH = globeContainer.getBoundingClientRect().width;
        GLOBE_HEIGHT = window.innerHeight - 180;
        GLOBE_RADIUS = Math.min(GLOBE_WIDTH, GLOBE_HEIGHT) / 3;
        GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];
        
        if (rotationTimer) rotationTimer.stop();
        d3.select("#globe-container").selectAll("*").remove();
        drawGlobe(currentViewMode);
    }, 500);
}

function closeCountryDetail() {
    console.log("Closing country detail panel");
    
    selectedCountry = null;
    isDetailMode = false;
    
    // Hide detail panel
    const detailPanel = document.getElementById("country-detail-panel");
    detailPanel.classList.remove("active");
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        detailPanel.style.display = "none";
    }, 500);
    
    // Restore globe container
    const globeContainer = document.getElementById("globe-container");
    globeContainer.classList.remove("detail-mode");
    
    // Restore globe dimensions
    setTimeout(() => {
        GLOBE_WIDTH = globeContainer.getBoundingClientRect().width;
        GLOBE_HEIGHT = window.innerHeight - 180;
        GLOBE_RADIUS = GLOBE_HEIGHT / 2.8;
        GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];
        
        if (rotationTimer) rotationTimer.stop();
        d3.select("#globe-container").selectAll("*").remove();
        drawGlobe(currentViewMode);
    }, 500);
}

function drawLineChart(data, metric, chartId, yLabel) {
    const svg = d3.select(`#${chartId}`);
    svg.selectAll("*").remove();
    
    // Get the parent container's dimensions
    const container = svg.node().parentElement;
    const containerWidth = container.getBoundingClientRect().width;
    const containerHeight = 250; // Fixed height for charts
    
    // Set SVG dimensions explicitly
    svg.attr("width", containerWidth)
       .attr("height", containerHeight);
    
    const margin = {top: 20, right: 30, bottom: 40, left: 60};
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[metric]) * 1.1])
        .range([height, 0]);
    
    // Add gradient
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", `areaGradient-${chartId}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
    
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#5c1010")
        .attr("stop-opacity", 0.3);
    
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#5c1010")
        .attr("stop-opacity", 0);
    
    // Add grid lines
    g.append("g")
        .attr("class", "chart-grid")
        .selectAll("line")
        .data(y.ticks(5))
        .enter().append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d));
    
    // Create area
    const area = d3.area()
        .x(d => x(d.year))
        .y0(height)
        .y1(d => y(d[metric]))
        .curve(d3.curveMonotoneX);
    
    // Create line
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d[metric]))
        .curve(d3.curveMonotoneX);
    
    // Add area
    g.append("path")
        .datum(data)
        .attr("class", "line-chart-area")
        .attr("d", area)
        .style("fill", `url(#areaGradient-${chartId})`);
    
    // Add line
    g.append("path")
        .datum(data)
        .attr("class", "line-chart-line")
        .attr("d", line);
    
    // Add dots
    g.selectAll(".chart-dot")
        .data(data.filter((d, i) => i % 5 === 0 || i === data.length - 1))
        .enter().append("circle")
        .attr("class", "chart-dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d[metric]))
        .attr("r", 3);
    
    // Add axes
    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .ticks(6);
    
    const yAxis = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => {
            if (metric === "population") {
                return d3.format(".2s")(d);
            }
            return d3.format(".1f")(d);
        });
    
    g.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    
    g.append("g")
        .attr("class", "chart-axis")
        .call(yAxis);
    
    // Add Y axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#666")
        .text(yLabel);
}

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
    // Debounce resize events
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Update globe dimensions
        GLOBE_WIDTH = GLOBE_CONTAINER.node().getBoundingClientRect().width;
        GLOBE_HEIGHT = window.innerHeight - 180;
        GLOBE_RADIUS = GLOBE_HEIGHT / 2.8;
        GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];
        
        // Reset zoom scale on resize
        currentZoomScale = null;
        
        // Stop rotation if active
        if (rotationTimer) {
            rotationTimer.stop();
        }
        
        // Clear and redraw (resize needs full redraw)
        d3.select("#globe-container").selectAll("*").remove();
        drawGlobe(currentViewMode);
    }, 250);
});