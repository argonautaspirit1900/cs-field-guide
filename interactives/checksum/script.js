/**
 * Checksum number generator
 * For use in CS Field Guide
 * Created by Hayley van Waas, University of Canterbury
 */


//TODO: shuffle list
//TODO: isbn-10 sum could use list of weights


//default type
var code_type = "ISBN-10";

var example_codes = [];
var valid_code_count = 0;
var number = "";
var sum = 0;
var primary_weights = [3, 2, 7, 6, 5, 4, 3, 2];
var secondary_weights = [7, 4, 3, 2, 5, 2, 7, 6];
var isbn10_weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];


//get the code_type whenever selected changes
$(document).ready(function () {
    $("select").change(function() {
        code_type = $(this).find(':selected').val();
    });
});


//responds to button click
$(function() {
    $( "input[type=submit], a, button" )
      .button()
      .click(function( event ) {
        event.preventDefault();

        example_codes = [];

        for (var a = 0; a < 5; a++) {
            chooseAlgorithm(code_type, a);
            number = "";
        }

        displayGeneratedExampleCodes();

    });
});


//decide which algorithm to use
function chooseAlgorithm(code_type, count){

    if (code_type == "ISBN-10") {
        ISBN10Generator(count);
    } else if (code_type == "ISBN-13" || code_type == "EAN-13") {
        ISBN13Generator(count);
    } else if (code_type == "IRD-number") {
        IRDGenerator(count);
    } else if (code_type == "credit-card") {
        creditCardGenerator(count);
    } else if (code_type == "trains") {
        trainNumberGenerator(count);
    }
    example_codes.push(number);

}


//decides if check digit should be calculated randomly or correctly
function determineCheckDigitType(count, sum, modulus){

    var check_digit_type = 0;

    if (count < 2) {
        check_digit_type = 0;
    } else if (count < 4) {
        check_digit_type = 1;
    } else {
        check_digit_type = Math.round(Math.random());
    }

    if (modulus == 0) { //this is a check for if train check digits are being calculated
        return check_digit_type;
    } else {
        return checkDigitCalculator(sum, modulus, check_digit_type);
    }

}


//calculates check digit
function checkDigitCalculator(sum, modulus, check_digit_type) {
    if (check_digit_type == 0) {
        var test = modulusCalculator(sum, modulus);
        console.log("valid", test);
        return test;
    } else {
        var ignore = modulusCalculator(sum, modulus);
        return randomCheckDigit(ignore);
    }

}


//calculates valid checkdigit
function modulusCalculator(sum, modulus) {
    console.log(sum);
    var value = (sum%modulus).toString();
    return value;
}


//generates random check digit
function randomCheckDigit(ignore){
    check_digit = (Math.floor(Math.random()*10)).toString();
    if (check_digit == ignore) {
        randomCheckDigit(ignore);
    }
    return check_digit;
}


//generate random numbers for start of code
function generateRandomDigits(count) {
    for (var i = 0; i < count; i++){
        number += (Math.floor(Math.random()*10)).toString();
    }
}


//generates random ISBN-10 numbers
function ISBN10Generator(count) {

    //generates 9 random numbers
    generateRandomDigits(9);

    sum = 0;
    //calculates the sum of the 12 digits - according to the ISBN13 algorithm
    //odd indexed digits  = *1, even indexed digits = *3
    calculateSumWithWeights(isbn10_weights);
    console.log("here", sum);
    check_digit = 11 - determineCheckDigitType(count, sum, 11);
    console.log("check digit", check_digit);
    ISBN10CheckDigit(check_digit);

}


//checks if checkdigit is integer or "X" for ISBN10
function ISBN10CheckDigit(check_digit) {
    if (check_digit == "11") {
        number += "0";
    } else if (check_digit == "10") {
        number += "X";
    } else {
        number += check_digit;
    }
}


//generates random ISBN-13 numbers
function ISBN13Generator(count) {

    //generates 12 random numbers
    generateRandomDigits(12);

    sum = 0;

    //calculates the sum of the 12 digits
    //odd indexed digits  = *1, even indexed digits = *3
    for (var i in number) {
        if (i%2 == 0) {
            sum += parseInt(number[i]);
        } else {
            sum += parseInt(number[i]) * 3;
        }
    }

    check_digit = 10 - determineCheckDigitType(count, sum, 10);

    if (check_digit == "10"){
        check_digit = "0";
    }

    number += check_digit;
}


//generates random credit card numbers
function creditCardGenerator(count) {
    //generate random 15 digits
    generateRandomDigits(15);

    //calculates the sum of the 15 digits
    //odd indexed digits  = *2, even indexed digits = *1

    sum = 0;
    var temp = 0;

    for (var i in number) {
        if (i%2 == 1) {
            sum += parseInt(number[i]);
        } else {
            temp = parseInt(number[i]) * 2;
            if (temp > 9) {
                temp -= 9;
            }
            sum += temp;
        }
    }

    number += 10 - determineCheckDigitType(count, sum, 10);

}


//generates random train code
function trainNumberGenerator(count) {

    generateRandomDigits(11);

    //calculates the sum of the 12 digits
    //odd indexed digits  = *2, even indexed digits = *1
    sum = 0;
    for (var i in number) {
        if (i%2 == 1) {
            sum += parseInt(number[i]);
        } else {
            sum += parseInt(number[i]) * 2;
        }
    }
    check_digit = 10 - determineCheckDigitType(count, sum, 10);
    console.log(check_digit);
    if (check_digit == 10) {
        number += "0";
    } else {
        number += check_digit;
    }

}


//generate the first 8 numbers
function IRDGenerator(count) {
    generateRandomDigits(8);
    IRDCheckDigit(primary_weights, count, 0);
}


//calculates the check digit for an IRD number
//NOTE: there is a (very) small probability that this function is repeated infinitely
function IRDCheckDigit(weights, count, repeat_count) {

    sum = 0;
    sum = calculateSumWithWeights(weights);
    check_digit = determineCheckDigitType(count, sum, 11); //returns a string
    console.log(sum, check_digit);
    if (check_digit == "0") {
        number += check_digit;
    } else {
        check_digit = 11 - parseInt(check_digit);
        if (check_digit != "10") {
            console.log("check_digit =", check_digit);
            number += check_digit.toString();
        } else {
            if (repeat_count == 0) {
                IRDCheckDigit(secondary_weights, count, repeat_count+1);
            } else {
                number = "";
                IRDGenerator(count);
            }
        }
    }

}


//caclulates sum based on weights
function calculateSumWithWeights(weights) {
    sum = 0;
    for (var i in number) {
        sum += parseInt(number[i] * weights[i], 10);
    }
    return sum;
}


//display generated codes on page
function displayGeneratedExampleCodes() {

    //remove previous values
    var elem = document.getElementById("list");
    elem.parentNode.removeChild(elem);

    //create new elements for new list
    list_containter = document.getElementById("generated_codes");
    list_element = document.createElement("ul");
    list_element.id = "list"
    list_containter.appendChild(list_element);

    //each code displayed as a new list item
    for(var i in example_codes) {
        var list_item = document.createElement("li");
        list_item.innerHTML = example_codes[i];
        list_element.appendChild(list_item);
    }

}






















