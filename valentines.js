function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 2 + 3 + "s";

    const emojis = ['💗', '💖', '💘', '💜', '💕', '💞', '💜'];

    function getRandomEmoji() {
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    heart.innerText = getRandomEmoji();
    //heart.innerText = '💗';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
                heart.remove();
                }, 5000);
  }
  
  heartRain = setInterval(createHeart, 300);

const heading = document.querySelector('h1');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');

yesButton.addEventListener('click', () => {
    alert("イエーイ！💗 バレンタインになった 💕");
    heading.innerText = "💗 アイ　ラブ　ユー 💗" ; 
    yesButton.style.display = 'none'; 
    noButton.style.display = 'none';  
});

noButton.addEventListener('click', () => {
    alert("you just wanted to see what happens when you press this button, right? RIGHT?!");
    document.body.style.backgroundColor = "#000000"; 
    heading.innerText = ":("; 
    yesButton.style.display = 'none'; 
    noButton.style.display = 'none';  
    clearInterval(heartRain);
});