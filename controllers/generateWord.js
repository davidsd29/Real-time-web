// import fetch from 'node-fetch';

// async function generateWord(url) {
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Info is not available');
//         }

//         return await response.json();
//     } catch (error) {
//         console.log(error);
//     }
// }


// async function replanishData() {
// 	const word = await generateWord('https://random-word-api.herokuapp.com/word');
//     console.log(word);
//     return await word;
// }


import randomWords from "../data/words.js";

const pickRandomWord = () => {
    const word = randomWords[Math.floor(Math.random() * randomWords.length)];
    return word;
}

export default pickRandomWord;
