window.onload = () => {
    // Condition for memory load
    // Check if memory exist (saveData !== null)
    if (localStorage.getItem('saveData') !== null) {
        // Creation and Init of game
        game = new Game(0);
        // Getting memory then setting it on live memory
        var retrieveData = localStorage.getItem('saveData');
        var getSave = JSON.parse(retrieveData);
        var clickAuto= (game.autoclick.bps) + (game.autoclick2.bps);     
        game.score = getSave.Score;
        game.multiplier.price = getSave.MultiPrice;
        game.multiplier.level = getSave.MultiLevel;
        game.multiplier.increase = getSave.MultiIncrease;
        game.autoclick.price = getSave.AutoPrice;
        game.autoclick.level = getSave.AutoLevel;
        game.autoclick.bps = getSave.AutoBpS;
        game.autoclick2.price = getSave.Auto2Price;
        game.autoclick2.level = getSave.Auto2Level;
        game.autoclick2.bps = getSave.Auto2BpS;
        game.multiplier.updateAffichageMultiple();
        game.autoclick.updateAffichageAutoclick(game.autoBtn,game.autoclick);
        game.autoclick2.updateAffichageAutoclick(game.autoBtn2,game.autoclick2);
        game.updateAffichageBps(clickAuto);

    } else {
        // If nothing in memory, start game with score= 0
        game = new Game(0);        
    }

    gameFlow();

    // Main Function 
    function gameFlow(){
        // Displays informations in the buttons when the game starts
        game.checkPrice();
        game.updateAffichageScore(game.score);
        game.multiplier.updateAffichageMultiple();
        game.autoclick.updateAffichageAutoclick(game.autoBtn,game.autoclick);
        game.autoclick2.updateAffichageAutoclick(game.autoBtn2,game.autoclick2);
        
        // Local data automatic save / 15 seconds interval

        setInterval(()=>{
            saveGameData();
            game.multiplier.updateAffichageMultiple();
            game.autoclick.updateAffichageAutoclick(game.autoBtn,game.autoclick);
            game.autoclick2.updateAffichageAutoclick(game.autoBtn2,game.autoclick2);
        }, 15000);
        
        // Increase score by bps every second
        setInterval(()=>{
            game.score+=((game.autoclick.bps) + (game.autoclick2.bps));
            game.checkPrice();
            game.updateAffichageScore(game.score);
            game.multiplier.updateAffichageMultiple();
            game.autoclick.updateAffichageAutoclick(game.autoBtn,game.autoclick);
            game.autoclick2.updateAffichageAutoclick(game.autoBtn2,game.autoclick2);
        }, 1000);
        
        // Event Listener for click on reset button
        game.resetBtn.addEventListener ("click",() => {
            var x=confirm("Are you sure you want to do this? \nYou won't be able to get your bananas back ...\n... ever!!")
            if (x==true)    {
                localStorage.clear();
                // Refresh the page locally (if set on true, reload from server)
                document.location.reload(false);
            }else{}
        })

        // Create event listener on click button
        game.clickBtn.addEventListener('click', () => {
            game.increaseScore();
            game.updateAffichageScore(game.score);
            game.checkPrice();
        })
        // Create event listener on multiply button
        multObject = game.multiplier
        document.querySelector('.bananaGrappe').addEventListener("click",() => {
            if (game.isBuyable(game.score,multObject.price) == true) { 
                game.score = game.payForUpgrade(game.score,multObject.price)
                multObject.multFlow()
                game.checkPrice();
                game.updateAffichageScore(game.score);
            }
        })

        // Create event listener on autoclick button
        autoObject = game.autoclick
        game.monkey.addEventListener("click",() => {
            if (game.isBuyable(game.score,autoObject.price) == true) { 
                game.score = game.payForUpgrade(game.score,autoObject.price)
                autoObject.autoFlow();
                autoObject.updateAffichageAutoclick(game.autoBtn,game.autoclick)
                game.checkPrice();
                game.updateAffichageScore(game.score);
                game.updateAffichageBps(autoObject.bps);
            }
        })

        // Create Event listener on autoclick button 2:
        autoObject2 = game.autoclick2
        game.autoBtn2.addEventListener("click",() => {  
            if (game.isBuyable(game.score,autoObject2.price) == true) { 
                game.score = game.payForUpgrade(game.score,autoObject2.price)
                autoObject2.autoFlow();
                autoObject2.updateAffichageAutoclick(game.boost1,game.autoclick2)
                game.checkPrice();
                game.updateAffichageScore(game.score);
                game.updateAffichageBps(autoObject2.bps);
            }
        })

        // Create event listener on bonus button
        bonusObject = game.bonus
        setTimeout(() => {
            bonusObject.showBonusRandom()
            },
            bonusObject.randomTime
        )
        game.bonusBtn.addEventListener("click",() => {
            bonusObject.hideBonus()
            // multObject.updateAffichageMultiple()
            console.log(multObject.increase)
            bonusObject.evolBonusIncrease()
            setTimeout(() => {
                bonusObject.showBonusRandom()
                },
                bonusObject.randomTime
            )
        })
    }

    function Game(score){
        // Properties of the Game - Add buttons from the DOM into props - Creates new objects
        this.clickBtn = document.querySelector('#hClick')
        this.grappe = document.querySelector('.bananaGrappe')
        this.multBtn = document.querySelector('#hMultiplier')
        this.monkey = document.querySelector('.monkey');
        this.autoBtn = document.querySelector('#hAutoclick');
        this.autoBtn2 = document.querySelector('#hAutoclick2');
        this.bonusBtn = document.querySelector('#hBonus');
        this.resetBtn = document.querySelector('#hReset');
        this.score = score
        this.multiplier = new Multiple(50,1,1)
        this.autoclick = new Autoclick(20,1,0)
        this.autoclick2 = new Autoclick(200,1,0)
        this.bonus = new Bonus()
        // Check if possible buy (score > 0)
        // return false if too expensive, true else
        this.isBuyable = function(score,price){
            if ((score - price) < 0) {
                return false;
            } else {
                return true;
            }
        }
        // Update score display on index.html
        this.updateAffichageScore = function (score) {
            document.querySelector('#hScore').innerHTML = `${score.toFixed(0)} banana(s)`
        }
        // Update bps display on index.html
        this.updateAffichageBps = function (bps) {
            document.querySelector('#hPerSecond').innerHTML = `${bps} banana(s)/second`
        }
        // Increase score by multiplier
        this.increaseScore = function(){
            this.score += this.multiplier.increase
        }
        // Decreases user score to pay for an upgrade
        this.payForUpgrade = function(score,price){      
            return (score - price)      
        }
        // Deactivate buttons if the user has not enough points to buy the upgrade
        this.buttonEnableDisable = function(score, price,btnType){
            btn = btnType
            if (game.isBuyable(score,price)){
                btn.disabled=false;
                btn.classList.remove('grayOut')
            }else{
                btn.disabled = true;
                btn.classList.add('grayOut')
            }
        }
        // Cycle through each upgrade object and launch the btn_enabler_disabler method
        this.checkPrice = function(){
            game.buttonEnableDisable(game.score,game.multiplier.price,game.grappe)
            game.buttonEnableDisable(game.score,game.autoclick.price,game.monkey)
            game.buttonEnableDisable(game.score,game.autoclick2.price,game.autoBtn2)  
        }
    }

    function Multiple(price, level, increase){
        this.price = price;
        this.level = level;
        this.increase = increase;
        // Function called in the game flow - operates all multiplier changes in one go when the user clicks
        this.multFlow = function(){
            this.price = Math.round(this.price+(this.price/3)+(this.price%3));
            this.level = this.level+1;
            this.increase = this.increase+1;
            this.updateAffichageMultiple()
        }
        // Update multiple display on index.html
        this.updateAffichageMultiple = function () {
            game.multBtn.innerHTML = 'X' + this.increase.toFixed(0) + ' | ' + this.price.toFixed(0);
        }
    }

    function Autoclick(price, level, bps) {
        this.price = price;
        this.level = level;
        this.bps = bps;
        // Function called in the game flow - operates all autoclick changes in one go when the user clicks
        this.autoFlow = function(){
            this.price = Math.round(this.price+(this.price/3)+(this.price%2));
            this.level = this.level+1;
            this.bps = this.bps+1;
        }
        // Update autoclick display on index.html
        this.updateAffichageAutoclick = function (btnNumber,autoclickNumber) {
            btnNumber.innerHTML = autoclickNumber.bps.toFixed(0)+' bananas per second' + ' <br/> ' + autoclickNumber.price.toFixed(0);
        }
    }

    function Bonus() {
        this.randomTime = 5000 + Math.floor((Math.random() * 10000) + 1)
        // Function used to increase the score of the multiplier then decrease after X second
        this.evolBonusIncrease = function () {
            multObject.increase *= 5
            game.multiplier.updateAffichageMultiple()
            console.log(multObject.increase)
            setTimeout(() => {
                multObject.increase /= 5
                console.log(multObject.increase)
                game.multiplier.updateAffichageMultiple()
                ;},
                5000
            )
        }
        // Display the bonus button
        this.showBonusRandom = function () {
            game.bonusBtn.style.display = "inline-block"
            this.randomTime = 5000 + Math.floor((Math.random() * 10000) + 1)
        }
        // Hide the bonus button
        this.hideBonus = function () {
            game.bonusBtn.style.display = "none"
        }
    }

    function saveGameData(){
        var saveData = {
            'Score':game.score,
            'MultiPrice':game.multiplier.price,
            'MultiLevel':game.multiplier.level,
            'MultiIncrease':game.multiplier.increase,
            'AutoPrice':game.autoclick.price,
            'AutoLevel':game.autoclick.level,
            'AutoBpS':game.autoclick.bps,
            'Auto2Price':game.autoclick2.price,
    	    'Auto2Level':game.autoclick2.level,
            'Auto2BpS':game.autoclick2.bps,
	}

        // -> Storage
        localStorage.setItem('saveData', JSON.stringify(saveData));
        console.log(saveData.Score);
    }
}