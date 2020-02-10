## TODO
- apply filters to bar graph (check back when full data is in - criminal trespass)
- styling
- color scale configuration
- **IF TIME** apply map as filter for bar graph

## Question: What does the distribution of crime look like in NYC in 2014-2015 (time and place)?
### Visualizations
- map showing amount of crime per area
  - time
  - based on crime
  - based on type of place
- bar graph  

### Current Branches in use
 - master: all the basics :)
 - fix_scale: work for making the coloring dynamic 
 
### How to run our code locally

Run `npm start` in the root direction or `python -m SimpleHTTPServer`

(For Lior: py -2 -m SimpleHTTPServer)


### Our site

See the live site at: [UW-CSE442-WI20.github.io/A3-crimez/](https://uw-cse442-wi20.github.io/A3-crimez/)

_Relevant instructions from the original template:_

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

### 3rd party libraries

Using [D3.js](https://d3js.org/)
