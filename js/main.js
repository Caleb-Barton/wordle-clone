document.addEventListener("DOMContentLoaded", () => {
    createSquares();
    getNewWord();

    let guessedWords = [[]];
    let availableSpace = 1;
    let allWords;
    getAllWords();

    let word;
    let guessedWordCount = 0;

    const keys = document.querySelectorAll(".keyboard-row button");

    function getAllWords() {
      fetch("data/all_words.txt")
            .then(response => response.text())
            .then(text => {
              allWords = text.split('\r\n')
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
              const good_words = text.split('\r\n');
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
      const date = new Date();
      const dateString = date.toISOString().slice(0, 10); // get the date string in "YYYY-MM-DD" format
      const hash = getHash(dateString); // get a hash value for the date string

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
    const isCorrectLetter = word.includes(letter);

    if (!isCorrectLetter) {
      return "rgb(58, 58, 60)";
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (isCorrectPosition) {
      return "rgb(83, 141, 78)";
    }

    return "rgb(181, 159, 59)";
  }

  function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
    }

    const currentWord = currentWordArr.join("");
    console.log(binarySearch(allWords, currentWord));
    
    if (binarySearch(allWords, currentWord)) {
      const firstLetterId = guessedWordCount * 5 + 1;
      const interval = 200;
      currentWordArr.forEach((letter, index) => {
        setTimeout(() => {
          const tileColor = getTileColor(letter, index);

          const letterId = firstLetterId + index;
          const letterEl = document.getElementById(letterId);
          letterEl.classList.add("animate__flipInX");
          letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
        }, interval * index);
      });

      guessedWordCount += 1;

      if (currentWord === word) {
        window.alert("Congratulations!");
      }

      if (guessedWords.length === 6) {
        window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
      }

      guessedWords.push([]);

    } else {
      window.alert("Word is not recognised!");
    }
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
    const removedLetter = currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(String(availableSpace - 1));

    lastLetterEl.textContent = "";
    availableSpace = availableSpace - 1;
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = ({ target }) => {
      const letter = target.getAttribute("data-key");

      if (letter === "enter") {
        handleSubmitWord();
        return;
      }

      if (letter === "del") {
        handleDeleteLetter();
        return;
      }

      updateGuessedWords(letter);
    };
  }
});
