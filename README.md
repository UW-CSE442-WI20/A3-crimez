## Question: What does the distribution of crime look like in NYC in 2014-2015 (time and place)?
#### Visualizations
- map showing amount of crime per area
  - time
  - based on crime
  - based on type of place
- bar graph  

#### How to run our code locally

For Windows: py -2 -m SimpleHTTPServer

For Mac: python -m SimpleHTTPServer

### TODOs
- [ ] Connect checkboxes to filtering data 
- [ ] adjust bar chart to show type of residence of crime (@amir)
- [ ] add check box option to time so you can view all the months (@emma)
- [ ] make color scale dynamic and add dynamic color legend (@kushal)

### Current Branches in use
 - master: map and slider with dynamic updates
 - filterByCrime: Also has filtering checkboxes and static bar chart

### Our site

See the live site at: [UW-CSE442-WI20.github.io/A3-crimez/](https://uw-cse442-wi20.github.io/A3-crimez/)

-------------------------------------------------------------------
# A3 Starter template

The starter code for creating interactive visualization prototypes.

### Install

#### Required software

You must have Node.js installed. I prefer to install it using [nvm](https://github.com/nvm-sh/nvm)
because it doesn't require sudo and makes upgrades easier, but you can also just get it directly from
https://nodejs.org/en/.

#### Install dependecies

Once you've got `node`, run the command `npm install` in this project folder
and it will install all of the project-specific dependencies (if you're curious open up `package.json` to see where these are listed).

npm is the _node package manager_.

## Other notes

### Using 3rd party libraries

Using [D3.js](https://d3js.org/)
