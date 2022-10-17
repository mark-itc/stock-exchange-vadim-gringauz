
function highlightTerm(term, string) {
    let newString = "";
    // const RegexTerm = /Ex/i;
    const regexTerm = new RegExp(term, 'i');
    console.log('regexTerm', regexTerm);
    newString = string.replace(regexTerm,`<mark>$&</mark>`);

    return newString;
}

const inputString = document.getElementById('text').innerHTML
const term = "tEX";
console.log('term=', term);
console.log(inputString);
const newString = highlightTerm(term, inputString);
console.log('new=', newString);
document.getElementById('text').innerHTML = newString
