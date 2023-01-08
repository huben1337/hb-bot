let array1 = [];
let array2 = [];
for (let i = 0; i < 1000000; i++) {
  array1.push(Math.random());
  array2.push(Math.random());
}

console.time('concat');
let mergedArray1 = array1.concat(array2);
console.timeEnd('concat');

console.time('spread');
let mergedArray2 = [...array1, ...array2];
console.timeEnd('spread');

console.time('set');
let mergedArray3 = [...new Set([...array1, ...array2])];
console.timeEnd('set');

console.time('forEach');
let mergedArray4 = [];
array1.forEach(element => mergedArray4.push(element));
array2.forEach(element => mergedArray4.push(element));
console.timeEnd('forEach');