import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
    element.textContent = '';
    loadInterval = setInterval(() => {
        element.textContent += '.';
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0;
    let interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
}

function chatrstripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi ? 'ai' : ''}">
            <div class="chat">
                <div class="profile">
                    <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
                </div>
                <div class="message" id="${uniqueId}">${value}</div>
            </div>
        </div>
        `
    );
}

async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(form);

    // User's chat stripe
    chatContainer.innerHTML += chatrstripe(false, data.get('prompt'));
    form.reset();

    // Bot's stripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatrstripe(true, "", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDIV = document.getElementById(uniqueId);
    loader(messageDIV);

    // Fetch data from server
    try {
        const response = await fetch('http://localhost:5000', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: data.get('prompt')
            })
        });

        clearInterval(loadInterval);
        messageDIV.innerHTML = '';

        if (response.ok) {
            const responseData = await response.json();
            const parsedData = responseData.bot.trim();
            typeText(messageDIV, parsedData);
        } else {
            const err = await response.text();
            messageDIV.innerHTML = 'Something went wrong';
            alert(err);
        }
    } catch (error) {
        console.error('Failed to fetch:', error);
        clearInterval(loadInterval);
        messageDIV.innerHTML = 'Failed to communicate with the server';
    }
}

form.addEventListener('submit', handleSubmit);
