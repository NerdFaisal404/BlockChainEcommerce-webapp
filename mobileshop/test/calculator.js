var Calculator = artifacts.require("./Calculator.sol");

contract('Calculator', function(accounts) {


    it("should assert true", function() {

        var calculator;

        return Calculator.deployed().then(function(instance) {
            calculator = instance;
            return calculator.getResult.call();

        }).then(function(result) {

            assert.equal(result.valueOf(), 10, "Contract initialized with ");
            calculator.addToNumber(10);
            calculator.subtractFromNumber(5);
            return calculator.getResult.call();

        }).then(function(result) {
            assert.equal(result.valueOf(), 15, "Contract initialized with ");
        });

    });

});