import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1ZtrqXn8f7jdFjAXWi3Cx0KcEj8nhmVw",
    authDomain: "punctured-go125.firebaseapp.com",
    databaseURL: "https://punctured-go125-default-rtdb.firebaseio.com",
    projectId: "punctured-go125",
    storageBucket: "punctured-go125.appspot.com",
    messagingSenderId: "666876129138",
    appId: "1:666876129138:web:a3b75a686482d51dc1b7eb"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();

provider.addScope('https://www.googleapis.com/auth/userinfo.email');

const auth = getAuth();
auth.useDeviceLanguage();

getRedirectResult(auth)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        const email = user.email;
        localStorage.setItem("email", email)
        // ...
    }).catch((error) => {
        console.log("error!")
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        console.log("Error: ", errorMessage)

        console.log("code: ", errorCode)
    });

function signIn(){
    signInWithRedirect(auth, provider);
}

document.getElementById("sign-in").addEventListener('click', signIn)
 
const database = getDatabase(app)

const boardSizeRef = ref(database, '/game state/board size')
const deathSquareSizeRef = ref(database, '/game state/death square size')
const movesRef = ref(database, '/game state/moves')
const moveNumberRef = ref(database, '/game state/move number')
const gameOverRef = ref(database, '/game state/game over')
const reloadRef = ref(database, '/game state/reload')

onValue(boardSizeRef, (snapshot) => {
    localStorage.setItem('boardSize', snapshot.val());
});
    
onValue(deathSquareSizeRef, (snapshot) => {
    localStorage.setItem('deathSquareSize', snapshot.val());
});

onValue(moveNumberRef, (snapshot) => {
    localStorage.setItem('moveNumber', snapshot.val());
});
    
onValue(deathSquareSizeRef, (snapshot) => {
    localStorage.setItem('deathSquareSize', snapshot.val());
});

onValue(reloadRef, (snapshot) => {
    if (snapshot.val()) {
        location.reload()
        set(reloadRef, false)
    }
})

document.getElementById("start").addEventListener('click', function () {
    set(gameOverRef, false)
        .catch((error) => {
            throw new Error(error.message)
        });
    set(reloadRef, true)
})

document.getElementById("stop").addEventListener('click', function () {
    set(gameOverRef, true)
        .catch((error) => {
            throw new Error(error.message)
        })
    remove(movesRef);
    set(moveNumberRef, 0);
})

let boardSizeSlider = document.getElementById("boardSize")

boardSizeSlider.addEventListener('change', function () {
    get(gameOverRef)
        .then((snapshot) => {
            if (snapshot.val() === true) {
                set(boardSizeRef, boardSizeSlider.value * 1)
            }
        })
        .catch((error) => {
            throw new Error(error.message)
        });
    document.getElementById("boardSize-value").innerHTML = boardSizeSlider.value
})

let deathSquareSizeSlider = document.getElementById("deathSquareSize")

deathSquareSizeSlider.addEventListener('change', function () {
    get(gameOverRef)
        .then((snapshot) => {
            if (snapshot.val() === true) {
                set(deathSquareSizeRef, deathSquareSizeSlider.value * 1)
            }
        })
        .catch((error) => {
            throw new Error(error.message)
        });
        document.getElementById("deathSquareSize-value").innerHTML = deathSquareSizeSlider.value
})