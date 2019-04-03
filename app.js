/**
 * ======================================================
 * Controller for operating with and updationg inside logic of the program
 * ======================================================
 */
var budgetController = (function () {

    var totalData = {

        allProfits: {
            inc: [],
            exp: []
        },

        total: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: -1,


    }

    function Expence(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    return {

        addItem(type, desc, val) {
            var newItem;

            // Create new ID
            var ID = totalData.allProfits[type].length !== 0 ? (totalData.allProfits[type][totalData.allProfits[type].length - 1].id + 1) : 0;

            // Create new iter based on its type 
            if (type === "inc") {
                newItem = new Income(ID, desc, val);
            } else {
                newItem = new Expence(ID, desc, val);
            }

            // Push it into our data structure 
            totalData.allProfits[type].push(newItem);

            // Recalculate total income or outcome
            totalData.total[type] += val;

            // Return this new item
            return newItem;

        },

        calculateBudget: function () {

            var budget = 0,
                percentage = -1;

            budget += totalData.total.inc;
            budget -= totalData.total.exp;
            if (totalData.total.inc !== 0)
                percentage = Math.round(totalData.total.exp / totalData.total.inc * 100);
            else
                percentage = -1;


            totalData.budget = budget;
            totalData.percentage = percentage;

        },

        getProfits: function () {
            return {
                income: totalData.total.inc,
                expence: totalData.total.exp,
                budget: totalData.budget,
                percentage: totalData.percentage
            }
        },

        deleteItem: function (type, ID) {
            var IDs, index;

            IDs = totalData.allProfits[type].map(a => a.id);
            index = IDs.indexOf(ID);

            if (index !== -1) {
                totalData.total[type] = totalData.total[type] - totalData.allProfits[type][index].value;
                totalData.allProfits[type].splice(index,1);
                
            }

        },

        testingData: function () {
            return totalData;
        }

    }


})();






/**
 * =============================================
 * Controller for operating with and updationg User Interface
 * =============================================
 */
var UIController = (function () {

    // Object to store all the strings from out HTML file to make code persistent to changes in HTML file
    var DOM_Strings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        OkButton: ".add__btn",
        incomeContainer: ".income__list",
        expenceContainer: ".expenses__list",
        budgetValue: ".budget__value",
        budgetIncomeValue: ".budget__income--value",
        budgetExpenceValue: ".budget__expenses--value",
        budgetPercentageValue: ".budget__expenses--percentage",
        commonContainer: ".container"
    }

    function getInp() {
        var desc, value;
        desc = document.querySelector(DOM_Strings.inputDescription).value;
        val = document.querySelector(DOM_Strings.inputValue).value;

        return {
            type: document.querySelector(DOM_Strings.inputType).value, // It receives not the value (not - or +) but the value that is written in the value attribute: inc or exp, 
            description: desc,
            value: parseFloat(val)
        };

    }



    return {

        getInput: function () {
            var value = getInp(),
                fields;
            fields = document.querySelectorAll(DOM_Strings.inputDescription + ', ' + DOM_Strings.inputValue);

            fieldsArray = [].slice.call(fields, 0);

            fieldsArray.forEach(function callback(element) {
                element.value = "";
            });

            fieldsArray[0].focus();

            return value;
        },

        displayBudget: function (profits) {
            document.querySelector(DOM_Strings.budgetValue).textContent = profits.budget > 0 ? ("+ " + profits.budget) : profits.budget;
            document.querySelector(DOM_Strings.budgetIncomeValue).textContent = "+ " + profits.income;
            document.querySelector(DOM_Strings.budgetExpenceValue).textContent = "- " + profits.expence;
            document.querySelector(DOM_Strings.budgetPercentageValue).textContent = profits.percentage !== -1 ? profits.percentage + "%" : "---";
        },



        addListItem: function (obj, type /*Income or Expence*/ ) {

            var html, actualHTML, containerString;

            // Create HTML string with placeholder text. This will behave like a template for our later changes

            if (type === "inc") {

                containerString = DOM_Strings.incomeContainer;
                html = `<div class="item clearfix" id="inc-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">+ %value%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;

            } else if (type === "exp") {

                containerString = DOM_Strings.expenceContainer;
                html = `<div class="item clearfix" id="exp-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix">
                            <div class="item__value">- %value%</div>
                            <div class="item__percentage">%percentage%%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`;

            }

            // Replace placeholder text with actual data

            actualHTML = html.replace('%id%', obj.id);
            actualHTML = actualHTML.replace('%description%', obj.description);
            actualHTML = actualHTML.replace('%value%', obj.value);


            // Insert HTML to the DOM
            document.querySelector(containerString).insertAdjacentHTML(`beforeend`, actualHTML);

        },

        deleteListItem: function(selectorID){
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },



        getDOM_Strings: function () {
            return DOM_Strings;
        },


    }
})();






/**
 * ==============================================
 * Controller for interoperationg of the previous two controllers
 * ==============================================
 */
var appController = (function (budgetCntr, UICntrl) {

    function setUpEventListeners() {

        var DOM_Strings = UICntrl.getDOM_Strings();

        document.querySelector(DOM_Strings.OkButton).addEventListener("click", processOkButton);

        document.addEventListener("keypress", function handleEnter(event) {

            if (event.keyCode === 13 || event.which === 13 /* for old browsers*/ ) {

                processOkButton();
            }

        });

        document.querySelector(DOM_Strings.commonContainer).addEventListener('click', controlDeleteItem);

        UICntrl.displayBudget({
            income: 0,
            expence: 0,
            budget: 0,
            percentage: -1
        });

        console.log("App started");
    }



    function updateBudget() {

        //   Calculate the budget
        budgetCntr.calculateBudget();

        var profits = budgetCntr.getProfits();

        //   Display the budget in the UI
        UICntrl.displayBudget(profits);


    }


    function processOkButton() {
        var newItem

        // Get the input data
        var inputs = UICntrl.getInput();
        if (!(inputs.description.trim() === "" || isNaN(inputs.value))) {


            // Add the item to the budget controller
            newItem = budgetCntr.addItem(inputs.type, inputs.description, inputs.value);


            //   Add a new item to the user interface
            UICntrl.addListItem(newItem, inputs.type);


            updateBudget();

        }
    }

    function controlDeleteItem(event) {
        var itemID, type, splitedID, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitedID = itemID.split('-');
            type = splitedID[0];
            ID = splitedID[1];

            // 1. Delete the item from Budget Controller
            budgetCntr.deleteItem(type,parseInt( ID));

            // 2.Delete an item from UI
            UICntrl.deleteListItem(itemID);
            

            // 3. Update our budget
            updateBudget();


        }

    }


    return {
        init: setUpEventListeners
    };


})(budgetController, UIController);

appController.init();