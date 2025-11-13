# Quick Start Guide: UN Population Visualization Project

## 🎯 Your Dataset is PERFECT for This Course

You have 50+ demographic indicators × 195 countries × 75 years = exceptional visualization opportunities!

---

## 📊 Top 5 Visualization Recommendations

### 1. **Hans Rosling-Style Animated Scatterplot** ⭐⭐⭐
**What:** Animate fertility vs. life expectancy from 1950-2100
- X-axis: Total Fertility Rate
- Y-axis: Life Expectancy  
- Size: Population
- Color: Region
- Time: Animation

**Why:** Shows the global demographic transition story. References course content (Session 01, data storytelling video)

**Impact:** This alone could carry your entire project. It's that powerful.

---

### 2. **Choropleth Map with Time Slider**
**What:** World map showing any indicator by country
- Start with: Life Expectancy or Infant Mortality Rate
- Time slider: 1950 → 2024
- Interactive tooltips

**Why:** Geographic patterns + temporal evolution (Session 06)

**Bonus:** Compare 2 indicators side-by-side using small multiples

---

### 3. **Scatterplot Matrix (SPLOM)**
**What:** Grid showing all pairwise relationships between 6-8 key indicators

**Include:**
- Total Fertility Rate
- Life Expectancy
- Infant Mortality Rate  
- Population Growth Rate
- Median Age
- Population Density

**Why:** Multivariate data exploration (Session 03-04). Spot correlations instantly.

**Interaction:** Click-drag brush in one cell → highlights same points in all cells

---

### 4. **Dimensionality Reduction: PCA Projection**
**What:** Project countries into 2D based on all demographic indicators
- Each point = one country
- Color by region
- Annotate interesting outliers

**Why:** Course explicitly covers PCA (Session 04, slides 32-34)

**Insight:** See which countries are demographically similar, identify outliers

---

### 5. **Time-Series with Confidence Bands**
**What:** Population projections with uncertainty visualization
- Historical data (1950-2024): solid lines
- Projections (2025-2100): shaded confidence bands
- Show world + major regions

**Why:** Visualizing uncertainty (Session 04, slides 22-23)

**Critical:** Distinguish estimates from projections visually

---

## 🎨 Essential Design Principles (from Course)

### ✅ DO:
- **Direct label** your lines/regions (no legends needed)
- Use **log scales** when showing growth rates
- Show **distributions** (violin plots, not just means)
- Add **annotations** for key events (e.g., "Medical Revolution 1950s")
- Test with **colorblind simulator** (8.3% of men affected!)

### ❌ DON'T:
- Truncate y-axes on bar charts (start at 0)
- Use rainbow color scales (perceptually non-uniform)
- Quote exact text from search results (copyright!)
- Rely on GenAI blindly (especially for D3.js interactions)
- Show 50 indicators at once (cognitive overload)

---

## 🛠️ Technical Stack

**Required (for lab evaluation):**
- **D3.js** or **Vega-Lite**

**Recommended:**
- **D3.js** for full control
- **Leaflet/Mapbox** for maps
- **Python (Pandas)** for data preprocessing
- **Observable** for rapid prototyping

**File Formats:**
- TopoJSON for geographic boundaries
- CSV/JSON for demographic data

---

## 📈 Project Scope by Team Size

### Solo (1 student):
1. Animated scatterplot (fertility vs. life expectancy)
2. Choropleth map with time slider
3. Multi-line time-series (population by region)

**Total:** 3 linked views, solid project

---

### Pair (2 students):
Everything above, PLUS:
4. Scatterplot matrix (SPLOM)
5. Violin plots showing distributions
6. Enhanced interactions (brushing & linking)

**Total:** 6 views, comprehensive analysis

---

### Trio (3 students):
Everything above, PLUS:
7. PCA dimensionality reduction
8. Gender gap analysis visualizations  
9. Heatmap (countries × years × indicator)
10. Data storytelling mode (guided tour)

**Total:** 10 views, near-publication quality

---

### Quad (4 students):
Everything above, PLUS:
11. t-SNE (compare with PCA)
12. Hypothetical Outcome Plots (uncertainty)
13. Custom visual encodings
14. Multiple narrative paths

**Total:** 14 views, research-grade project

---

## 📚 Top 3 Correlations to Explore

Your dataset will show these strong relationships:

1. **Fertility ↔ Life Expectancy:** r ≈ -0.85 (strong negative)
   - As life expectancy rises, fertility falls
   - Universal pattern of demographic transition

2. **Infant Mortality ↔ Life Expectancy:** r ≈ -0.95 (very strong negative)
   - Medical improvements affect both

3. **Median Age ↔ Fertility:** r ≈ -0.80 (strong negative)
   - Lower fertility → aging populations

**Visualization:** Create a correlogram heatmap showing all 50 indicators

---

## 🚀 Week-by-Week Timeline

### Weeks 1-2: Explore & Clean
- Load data in Python/Observable
- Calculate correlations manually
- Identify 3-5 "wow" findings
- Decide on your key visualizations

### Weeks 3-4: Build Core Views
- Implement animated scatterplot
- Implement choropleth map
- Basic interactivity working

### Weeks 5-6: Advanced Features  
- Add SPLOM or PCA
- Coordinate multiple views
- Brushing & linking

### Weeks 7-8: Polish & Story
- Design narrative flow
- Add annotations
- Optimize performance
- Create presentation

### Week 9: Practice & Submit
- Rehearse demo
- Final testing
- Submit project

---

## 💡 3 Killer Insights Your Data Will Reveal

### 1. The Great Convergence
**Finding:** In 1950, life expectancy ranged from 30 to 70 years. By 2024, most countries are 65-80 years.

**Visualization:** ECDF curves shifting rightward over time

**Story:** "The world became more equal in terms of basic health outcomes"

---

### 2. The Fertility Collapse  
**Finding:** Every region's fertility rate declined dramatically. Some (South Korea: 0.8) fell far below replacement (2.1).

**Visualization:** Small multiples showing regional fertility trajectories

**Story:** "What took Europe 200 years happened in East Asia in 50 years"

---

### 3. The Age Pyramid Inversion
**Finding:** By 2100, many countries will have MORE people over 65 than under 15.

**Visualization:** Animated population pyramids (1950 → 2100)

**Story:** "We're entering a world no human civilization has seen before"

---

## 🎬 Presentation Structure (10 minutes)

### Slides 1-2: Setup (1 min)
- Title: "75 Years of Demographic Change"
- Dataset: UN World Population Prospects 2024

### Slides 3-5: Visualizations (6 min)
- Show your top 3 visualizations
- 2 minutes each
- Demo interactions live

### Slide 6: Technical (1 min)
- D3.js + Leaflet
- Key challenges solved

### Slide 7: Insights (1 min)
- 3 key findings
- Policy implications

### Slide 8: Q&A (1 min)
- Invite questions

---

## 🔗 Essential Resources

### Course Materials
- **Moodle:** https://moodle.ip-paris.fr/course/section.php?id=48488
- **Course Page:** https://www.enseignement.polytechnique.fr/informatique/CSC_51052/
- **Slack:** #csc_51052_2025

### D3.js Learning
- **Official Examples:** https://d3js.org
- **Observable Notebooks:** https://observablehq.com/@d3/gallery
- **D3 in Depth:** https://www.d3indepth.com

### Inspiration
- **Hans Rosling TED Talk:** "200 Countries, 200 Years, 4 Minutes"
- **Gapminder:** https://www.gapminder.org/tools/
- **Our World in Data:** https://ourworldindata.org

### Tools
- **ColorBrewer:** https://colorbrewer2.org (choose palettes)
- **Colorblind Simulator:** https://www.color-blindness.com/coblis-color-blindness-simulator/
- **TopoJSON:** https://github.com/topojson/topojson (map data)

---

## ⚠️ Common Pitfalls to Avoid

1. **Trying to show all 50 indicators at once**
   → Start with 5-8 key ones

2. **No temporal aspect**  
   → This is 75 years of data! Show change over time

3. **Static only**
   → Add at least ONE animation or transition

4. **Ugly colors**
   → Use ColorBrewer, test for colorblind accessibility

5. **No story**
   → Don't just show charts, tell the demographic transition story

6. **GenAI-generated code you don't understand**
   → Course explicitly warns about this. You'll get stuck during demos.

7. **Ignoring uncertainty in projections**
   → 2050+ data is uncertain! Show confidence bands

---

## ✅ Your Action Plan for Next Week

### Step 1: Load the Data (1 hour)
```python
import pandas as pd

df = pd.read_excel('WPP2024_Demographic_Indicators.xlsx')

# Explore
print(df.columns)
print(df['Region'].unique())
print(df['Year'].min(), df['Year'].max())

# Filter to estimates only (1950-2024) initially
df_historical = df[df['Year'] <= 2024]
```

### Step 2: Calculate Key Correlations (30 min)
```python
indicators = ['Total Fertility Rate', 'Life Expectancy at Birth, both sexes',
              'Infant Mortality Rate', 'Population Growth Rate']

corr_matrix = df_historical[indicators].corr()
print(corr_matrix)
# You'll see the strong negative correlation between fertility and life expectancy!
```

### Step 3: Sketch Your Visualizations (1 hour)
- Draw on paper what you want to build
- Decide on your 3-5 core visualizations
- Plan the interaction flow

### Step 4: Build a Simple Prototype (2 hours)
- Start with ONE visualization
- Get it working end-to-end
- Don't worry about aesthetics yet

### Step 5: Show Someone (30 min)
- Demo to a classmate or friend
- Get feedback on clarity
- Iterate based on their confusion points

---

## 🏆 How to Excel (Get Top Marks)

### For Visualization Quality:
- Apply at least 5 concepts explicitly from the course slides
- Reference specific sessions in your presentation
- Show you understand WHY you made each design choice

### For Technical Implementation:
- Use proper D3.js patterns (enter-update-exit)
- Handle transitions smoothly
- Make it performant (test with full dataset)

### For Insights:
- Don't just show data, interpret it
- Connect to real-world events (wars, policies, medical breakthroughs)
- Make predictions or raise questions about future trends

### For Storytelling:
- Structure as a narrative with beginning, middle, end
- Use Hans Rosling's style (start with surprising fact)
- Pause at key moments to let insights sink in

---

## 🎓 Final Words from Course Philosophy

> "The difficulty in creating a good visualization is sometimes technical...  
> but most often it lies in making the right design choices."
> — Professor Pietriga

This dataset gives you incredible opportunities. Don't waste them on defaults.

**Think hard about:**
- What story do you want to tell?
- Who is your audience?
- What should they remember after seeing your visualization?

**Then design backwards from those answers.**

---

## Questions? Next Steps?

1. **Read the full strategy document** (`Population_Visualization_Strategy.md`)
2. **Load your data and explore** (spend quality time understanding it)
3. **Sketch 3-5 visualizations** on paper before coding
4. **Start with ONE** and get it working perfectly
5. **Iterate, test, improve**

**You have an exceptional dataset. Make something exceptional with it.** 🚀

---

**Quick Start Guide Version:** 1.0  
**Companion Document:** Population_Visualization_Strategy.md  
**Course:** CSC_51052 (2025-2026)
