document.addEventListener("DOMContentLoaded", () => {
    createSquares();
    getNewWord();

    let guessedWords = [[]];
    let availableSpace = 1;
    let allWords;
    getAllWords();

    let word;
    let guessedWordCount = 0;
    let gameWon;
    let gameOver = false;

    const keys = document.querySelectorAll(".keyboard-row button");
    let keyRange = [[96,123,0],[96,123,0],[96,123,0],[96,123,0],[96,123,0]] // min, max, found place

    window.alert("Here's how to play. \n \n This is a word guessing game. Each time you guess a word, your letters change into one of three colors. \n    - Yellow means that your color is too high in the alphabet. \n    - Blue means that your color is too low in the alphabet. \n    - Green means that you got it just right! \n \n The keyboard is in alphabetical order to help you be more conscious of which letters come before which. \n \n Let me know what you think!")

    // Colors
    const yellow = "C39A2C";
    const green = "487E41";
    const blue = "336290";
    const gray = "555";
    

    function getAllWords() {
      fetch("data/all_words.txt")
            .then(response => response.text())
            .then(text => {
              allWords = text.split(',')
            })
            .catch((err) => {
                console.error(err);
            }
        );
    }

    function getNewWord() {
        fetch("data/good_words.txt")
            .then(response => response.text())
            .then(text => {
              const good_words = text.split(',');
              let index = getNumberFromDate(good_words.length)
              word = good_words[index];
            })
            .catch((err) => {
                console.error(err);
                word = "error"
            }
        );
    }

    function getNumberFromDate(length) { // Gifted to me by ChatGPT
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric'};
      const dateTimeString = now.toLocaleString(navigator.language, options);
      const hash = getHash(dateTimeString); // get a hash value for the date string
      

      const number = hash % length; // map the hash value to a number between 1 and 300
      return number;
    }
    
    function getHash(string) { // Gifted to me by ChatGPT
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
        const charCode = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + charCode;
        hash = hash & hash; // convert to 32-bit integer
      }
      return Math.abs(hash); //This kept returning a negative number, which I guess is harder to index in javascript, so....
    }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  function getTileColor(letter, index) {
    let distance = letter.charCodeAt(0) - word.charCodeAt(index)
    updateKeyboardColors();

    if (distance > 0) {
      updateKeyRangeLow(letter, index);
      return blue;
    } else if (distance == 0) {
      updateKeyRangeFound(letter, index);
      return green;
    } else {
      updateKeyRangeHigh(letter, index);
      return yellow;
    }
    
  }

  function updateKeyboardColors() {
    const charNum = getCurrentWordArr().length;
    if (charNum >= 5) {return}
    keys.forEach(key => {
      dataKey = key.getAttribute("data-key");
      if (dataKey.length == 1) // Let's not do anything to Del or Enter
      {
        if (keyRange[charNum][0] >= dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${yellow}`;
          key.style.background = "#333";
        } else  if (keyRange[charNum][1] <= dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${blue}`;
          key.style.background = "#333";
        } else if (keyRange[charNum][3] == dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${green}`;
          key.style.background = "#555";
        } else{
          key.style.boxShadow = "inset 0px -10px 0px #555";
          key.style.background = "#555";
        }
      }
    });
  }

  function updateKeyRangeFound(letter, index){
    keyRange[index][0] = letter.charCodeAt(0) - 1;
    keyRange[index][1] = letter.charCodeAt(0) + 1;
    keyRange[index][3] = letter.charCodeAt(0);
  }

  function updateKeyRangeHigh(letter, index){
    let knownMin = keyRange[index][0];
    if (letter.charCodeAt(0) > knownMin) {keyRange[index][0] = letter.charCodeAt(0);}
  }

  function updateKeyRangeLow(letter, index){
    let knownMax = keyRange[index][1];
    if (letter.charCodeAt(0) < knownMax) {keyRange[index][1] = letter.charCodeAt(0);}
  }

  function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
      return;
    }

    const currentWord = currentWordArr.join("");
    
    if (binarySearch(allWords, currentWord)) {
      const firstLetterId = guessedWordCount * 5 + 1;
      const interval = 150;
      currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
          const tileColor = getTileColor(letter, index);

          const letterId = firstLetterId + index;
          const letterEl = document.getElementById(letterId);
          letterEl.classList.add("animate__flipInX");
          letterEl.style = `background-color:#${tileColor};border-color:#${tileColor};background-image: url(/images/Tile_${tileColor}.svg)`;
        }, interval * index);
      });

      guessedWordCount += 1;

      if (currentWord === word) {
        setTimeout(displayCongrats, 1350);
        gameWon = true;
        gameOver = true;
      } else if (guessedWords.length === 6) {
        setTimeout(displaySorry, 1350);
        gameOver = true;
      }

      guessedWords.push([]);
      
      updateKeyboardColors();

    } else {
      window.alert("Word is not recognised!");
    }
  }

  function displayCongrats() {
    window.alert("Congratulations!")
  }

  function displaySorry() {
    window.alert(`Sorry, the word was ${word}!`)
  }

  function binarySearch(arr, target) { // Gifted to me by ChatGPT
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = target.localeCompare(arr[mid]);
      
      if (comparison === 0) {
        return true; // target found
      } else if (comparison < 0) {
        right = mid - 1; // target is in left half of array
      } else {
        left = mid + 1; // target is in right half of array
      }
    }
    
    return false; // target not found
  }
  

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  function handleDeleteLetter() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length > 0) {
      const removedLetter = currentWordArr.pop();

      guessedWords[guessedWords.length - 1] = currentWordArr;
  
      const lastLetterEl = document.getElementById(String(availableSpace - 1));
  
      lastLetterEl.textContent = "";
      availableSpace = availableSpace - 1;
    }

  }

  function isSingleLetter(str) {
    return /^[a-z]$/.test(str);
  }

  function typeToBoard(letter) {
    if (!gameOver) {

      if (letter === "enter") {
        handleSubmitWord();
      } else if (letter === "del") {
        handleDeleteLetter();
      } else {
        updateGuessedWords(letter);
      }
      updateKeyboardColors();
    }
  }

  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (isSingleLetter(key) || key === "enter"){
      typeToBoard(key)
    } else if (key === "backspace") {
      typeToBoard("del")
    }
  });

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      if (!gameOver) {
        const letter = target.getAttribute("data-key");

        typeToBoard(letter);
      }
    };
  }
});
