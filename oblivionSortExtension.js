const avgCompareRate = 0.00000599814001979943; // This is a placeholder number, based on how well my computer performs with sorting in bulk.
const randNumQuantity = 5000;

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question('What do you think of Node.js? ', (answer) => {
//   console.log('Thank you for your valuable feedback:', answer);
//   rl.close();

//     console.log("The file was saved!");
// }); // });

// var fs = require('fs');
// fs.writeFile("/tmp/test", "Hey there!", function(err) {
//     if(err) {
//         return console.log(err);
// }

var result = sort(rand(randNumQuantity,[0,10000]),"QUICK", "A");
console.log(result[3] + " SORT:\n" + result[0] + "\nComparisons - " + result[1] + "\nSorting time - " + displayTime(result[2]) + "\nAverage comparison time - " + result[2]/result[1] + "ms\n");

function sort(input,method,order) { // Input array, SELECT/QUICK/MERGE, ascending/descending
    var output = [];
    var timeStart = new Date().getTime();
    var comparisonsNeeded;

    switch (method) {
        case "SELECTION":
            comparisonsNeeded = (input.length * (input.length + 1)/2)-1;
            console.log("INITIALIZING:\nComparisons needed - " + comparisonsNeeded + "\nETA - " + displayTime(comparisonsNeeded * avgCompareRate) + "\n");
            output = selectionSort(input);
            break;
        case "QUICK":
            comparisonsNeeded = 0;
            console.log("INITIALIZING:\nComparisons needed - " + comparisonsNeeded + "\nETA - " + displayTime(comparisonsNeeded * avgCompareRate) + "\n");
            output = quickSort(input);
            break;
    }
    var time = new Date().getTime() - timeStart;

    return output.concat(time,method); // Returns: sorted list, comparison count, time, method
}

/////////////////////////////SORTING FUNCTIONS///////////////////////////////
function selectionSort(numList) { // Selection Sort | O(n^2)
    var comparisons = 0;
    var min;
    
    for (var num = 0; num < numList.length-1; num++) {
        min = null;
        for (var iteration = num; iteration < numList.length; iteration++) {
            comparisons++;
            if (numList[iteration] < numList[min] || min === null) {
                min = iteration;
            }
        }
        if (numList[min] != numList[num]) {
            swap(numList,num,min);
        }
    }
    return [numList,comparisons];
}

function quickSort(input) {
    return quickSortMain(input, input.length - 1, 0);
}

function quickSortMain(input, upper, lower) {
    var comparisons = 0;
    var pivot = input[Math.round(Math.random() * (upper - 1))];
    var high = upper,
        low = lower;

    while (low <= high) {
        while (input[low] < pivot) {
            low++;
        }
        while (input[high] > pivot) {
            high--;
        }
        if (low >= high) {
            swap(input, low, high);
            low++;
            high--;
            comparisons++;
        }
    }
    if (lower < high) {
        quickSortMain(input, lower, high);
    }
    if (upper > low) {
        quickSortMain(input, low, upper);
    }

    return [input,comparisons];
}

///////////////////////////UTILITIES///////////////////////////
function swap(arr,idx1,idx2) { // Swap takes an array, two indexes, and swaps them. Returns altered array.
    var intermediate = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = intermediate;
}

function rand(quantity,range) { // Range is a two-element list, inclusive: [Minimum value, Maximum value]
    var randList = [];
    if (quantity === null) {quantity = 10;}
    if (range === null) {range = []; range[0] = 1; range[1] = 100;}
    
    for (var iteration = 0; iteration < quantity; iteration++) {
        randList.push(Math.floor((Math.random() * ((range[1]+1) - range[0])) + range[0]));
    }
    return randList;
}

function displayTime(input) {
    var output;
    
    if (input < 1000) {output = Math.round(input) + " miliseconds";} else // Miliseconds
    if (input < 60000) {output = Math.round(input/1000) + " seconds";} else // Seconds
    if (input < 36000000) {output = Math.round((input/1000)/60) + " minutes";} else // Minutes
    {output = Math.round(input/36000000) + " hours";} // Hours
    
    return output;
}
