// Colors
const yellow = "D39F2B";
const green = "599A50";
const blue = "3E77B0";
const gray = "777";

document.addEventListener("DOMContentLoaded", () => {
    let word;
    initHelpModal();
    initStatsModal();
    createSquares();

    let guessedWords = [[]];
    let availableSpace = 1;
    let allWords;
    let today = getDate();
    getAllWords();

    let guessedWordCount = 0;
    let gameWon;
    let gameOver = false;

    const keys = document.querySelectorAll(".keyboard-row button");
    let keyRange = [[96,123,0],[96,123,0],[96,123,0],[96,123,0],[96,123,0]] // min, max, found place
    initLocalStorage();

    //window.alert("Here's how to play. \n \n This is a word guessing game. Each time you guess a word, your letters change into one of three colors. \n    - Yellow means that that letter is too early in the alphabet. \n    - Blue means that that letter is too late in the alphabet. \n    - Green means that you got it just right! \n \n The keyboard is in alphabetical order to help you be more conscious of which letters come before which. \n \n Let me know what you think!")
    
    function getAllWords() { // makes the allWords variable have the list from data/all_words.txt
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

    function getNewWord() { // Chooses the word of the day based on the date
        fetch("data/good_words.txt")
            .then(response => response.text())
            .then(text => {
              const good_words = text.split(',');
              let index = getNumberFromDate(good_words.length)
              word = good_words[index];
              window.localStorage.setItem("word", JSON.stringify(word));
            })
            .catch((err) => {
                console.error(err);
                word = "error"
                window.localStorage.setItem("word", JSON.stringify(word));
            }
        );
    }

    function getDate() {
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric'};
      return now.toLocaleString(navigator.language, options);
    }

    function initLocalStorage() { // Checks the localStorage and takes actions needed (create localfiles, load game, etc)
      const lastPlayDate =
          window.localStorage.getItem("lastPlayDate");
      if (!lastPlayDate) {
          // No local memory
          // add open instructions
          const modal = document.getElementById("help-modal");
          modal.style.display = "block";
          window.localStorage.setItem("lastPlayDate", today);
          window.localStorage.setItem("guessedWords", JSON.stringify(guessedWords));
          window.localStorage.setItem("guessedWordCount", JSON.stringify(guessedWordCount));
          window.localStorage.setItem("availableSpace", JSON.stringify(availableSpace));
          window.localStorage.setItem("keyRange", JSON.stringify(keyRange));
          let hitList = [0,0,0,0,0,0,0];
          window.localStorage.setItem("histList", JSON.stringify(hitList));
          window.localStorage.setItem("streakCount", JSON.stringify(0));
          window.localStorage.setItem("lastWinDate", JSON.stringify(null));
          window.localStorage.setItem("gameOver", JSON.stringify(false));
          getNewWord();

      } else if (lastPlayDate == today) { 
          // Continue playing from where user left off
          guessedWords = JSON.parse(window.localStorage.getItem("guessedWords"));
          guessedWordCount = JSON.parse(window.localStorage.getItem("guessedWordCount"));
          availableSpace = JSON.parse(window.localStorage.getItem("availableSpace"));
          keyRange = JSON.parse(window.localStorage.getItem("keyRange"));
          gameOver = JSON.parse(window.localStorage.getItem("gameOver"));
          word = JSON.parse(window.localStorage.getItem("word"));
          availableSpace = guessedWordCount * 5 + 1;
          loadGame();
          updateKeyboardColors();
          console.log("You have already been playing today!")

      } else {
          // New day, refresh old data
          console.log("It's a new day!")
          if (!isNextDay(lastPlayDate, today)) { // If isn't the next day, refresh streak to zero
              window.localStorage.setItem("streakCount", JSON.stringify(0));
          }
          window.localStorage.setItem("guesedWords", JSON.stringify(guessedWords));
          window.localStorage.setItem("lastPlayDate", today);
      }
  }

  function updateLocalMemory() {
    window.localStorage.setItem("lastPlayDate", today);
    window.localStorage.setItem("guessedWords", JSON.stringify(guessedWords));
    window.localStorage.setItem("guessedWordCount", JSON.stringify(guessedWordCount));
    // window.localStorage.setItem("keyRange", JSON.stringify(keyRange)); // I'm just updating it every time it changes
    window.localStorage.setItem("gameOver", JSON.stringify(gameOver));
    window.localStorage.setItem("availableSpace", JSON.stringify(availableSpace));
  }

  function updateWinLocalMemory (num) {
    streakCount = JSON.parse(window.localStorage.getItem("streakCount"));
    window.localStorage.setItem("streakCount", JSON.stringify(streakCount + 1));
    histList = JSON.parse(window.localStorage.getItem("histList"));
    histList[num] += 1;
    window.localStorage.setItem("histList", JSON.stringify(histList));
  }

  function updateLoseLocalMemory () {
    window.localStorage.setItem("streakCount", JSON.stringify(0));
    histList = JSON.parse(window.localStorage.getItem("histList"));
    histList[6] += 1;
    window.localStorage.setItem("histList", JSON.stringify(histList));
  }


  
  function isNextDay(dateString1, dateString2) { // Calculates if date2 comes directly after date1
      const date1 = new Date(dateString1);
      const date2 = new Date(dateString2);
      const differenceInTime = date2.getTime() - date1.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24.1)
      return (differenceInDays <= 1)
  }

    function getNumberFromDate(length) { // Gifted to me by ChatGPT // Meant for hashing
      const hash = getHash(today); // get a hash value for the date string
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

  function getCurrentWordArr() { // Gets the most recent word written (Not necessarily submitted)
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function loadGame() {
    // I don't know how I'm going to do this. But I'm gonna do it
    for (let i = 0; i < guessedWords.length; i++) {
      for (let j = 0; j < guessedWords[i].length; j++) {
        const letter = guessedWords[i][j];
        const index = i * 5 + j + 1;
        loadGuessedLetter(letter, index)
        const tileClass = getTileClass(letter, (index - 1) % 5 );
        const letterEl = document.getElementById(index);
        letterEl.classList.add(tileClass);
      }
    }

  }

  function updateGuessedWords(letter) { // Adds a letter to the current word being guessed on board
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  function loadGuessedLetter(letter, place) { // Adds a letter to the current word being guessed on board
    const availableSpaceEl = document.getElementById(String(place));
    availableSpaceEl.textContent = letter;
  }

  function getTileColor(letter, index) { // Old version
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

  function getTileClass(letter, index) {
    let distance = letter.charCodeAt(0) - word.charCodeAt(index)
    updateKeyboardColors();

    if (distance > 0) {
      updateKeyRangeLow(letter, index);
      return "low-letter";
    } else if (distance == 0) {
      updateKeyRangeFound(letter, index);
      return "correct-letter";
    } else {
      updateKeyRangeHigh(letter, index);
      return "high-letter";
    }
    
  }

  function updateKeyboardColors() { // Based on Keyrange and the length of currentWordArr
    const charNum = getCurrentWordArr().length;
    if (charNum >= 5) {return}
    keys.forEach(key => {
      dataKey = key.getAttribute("data-key");
      if (dataKey.length == 1) // Let's not do anything to Del or Enter
      {
        if (keyRange[charNum][0] >= dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${yellow}`;
          key.style.background = "#333";
          key.style.color = `#777`;
        } else  if (keyRange[charNum][1] <= dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${blue}`;
          key.style.background = "#333";
          key.style.color = `#777`;
        } else if (keyRange[charNum][2] == dataKey.charCodeAt(0)) {
          key.style.boxShadow = `inset 0px -10px 0px #${green}`;
          key.style.background = `#${gray}`;
          key.style.color = `#FFF`;
        } else{
          key.style.boxShadow = `inset 0px -10px 0px #${gray}`;
          key.style.background = `#${gray}`;
          key.style.color = `#FFF`;
        }
      }
    });
  }

  function updateKeyRangeFound(letter, index){ // The correct letter has been found
    keyRange[index][0] = letter.charCodeAt(0) - 1;
    keyRange[index][1] = letter.charCodeAt(0) + 1;
    keyRange[index][2] = letter.charCodeAt(0);
    window.localStorage.setItem("keyRange", JSON.stringify(keyRange));
  }

  function updateKeyRangeHigh(letter, index){
    let knownMin = keyRange[index][0];
    if (letter.charCodeAt(0) > knownMin) {keyRange[index][0] = letter.charCodeAt(0);}
    window.localStorage.setItem("keyRange", JSON.stringify(keyRange));
  }

  function updateKeyRangeLow(letter, index){
    let knownMax = keyRange[index][1];
    if (letter.charCodeAt(0) < knownMax) {keyRange[index][1] = letter.charCodeAt(0);}
    window.localStorage.setItem("keyRange", JSON.stringify(keyRange));
  }

  function handleSubmitWord() { // When a word is submitted
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
          const tileClass = getTileClass(letter, index);

          const letterId = firstLetterId + index;
          const letterEl = document.getElementById(letterId);
          letterEl.classList.add("animate__jackInTheBox");
          letterEl.classList.add(tileClass);
        }, interval * index);
      });

      guessedWordCount += 1;

      if (currentWord === word) {
        setTimeout(displayCongrats, 1350);
        gameWon = true;
        gameOver = true;
        
        updateWinLocalMemory(guessedWords.length);

      } else if (guessedWords.length === 6) {
        setTimeout(displaySorry, 1350);
        gameOver = true;
        updateLoseLocalMemory();
      }

      guessedWords.push([]);
      
      updateKeyboardColors();
      updateLocalMemory();

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
  

  function createSquares() { // Ran once at the beginning
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

  function typeToBoard(letter) { // receives letter, calls update updateGuessedWords (usually)
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

  function initHelpModal() {
    const modal = document.getElementById("help-modal");
    // Get the button that opens the modal
    const btn = document.getElementById("help");
    // Get the <span> element that closes the modal
    const span = document.getElementById("close-help");
    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      modal.style.display = "block";
    });
    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });
    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }

  function updateStatsModal() {
    let list = JSON.parse(window.localStorage.getItem("histList"));
    let sum = 0;

    for (let i = 0; i < list.length; i++) {
      sum += list[i];
    }
    let newList = [];
    for (let i = 0; i < list.length; i++) {
      newList[i] = Math.ceil((list[i] / sum) * 14);
    }

    for (let i = 0; i < 6; i++){
      document.getElementById(`win-count${i+1}`).textContent =`${"█".repeat(newList[i])} (${list[i]})`;
    }
    document.getElementById(`loss-count`).textContent =`${"█".repeat(newList[6])} (${list[6]})`;

    const streakCount = JSON.parse(window.localStorage.getItem("streakCount"));
    document.getElementById(`current-streak`).textContent = `${streakCount}`;

  }

  function initStatsModal() {
    const modal = document.getElementById("stats-modal");
    // Get the button that opens the modal
    const btn = document.getElementById("stats");
    // Get the <span> element that closes the modal
    const span = document.getElementById("close-stats");
    // When the user clicks on the button, open the modal
    btn.addEventListener("click", function () {
      updateStatsModal();
      modal.style.display = "block";
    });
    // When the user clicks on <span> (x), close the modal
    span.addEventListener("click", function () {
      modal.style.display = "none";
    });
    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }
});
