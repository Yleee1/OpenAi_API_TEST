import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer =document.querySelector('#chat_container')

let loadInterval;

  function loader(element){
    element.textContent='';
    loadInterval=setInterval(()=>{
       element.textContent+='.' 
      if(element.textContent==='....'){
          element.textContent=''
      }
    },300)
  }

  function typeText(element,text){
    let index=0;
    let interval=setInterval(()=>{
      if(index<text.length){
        element.innerHTML +=text.charAt(index)
        index++;
      }else{
        clearInterval(interval)
      }
    },20)
  }

  function generateUniqueId(){
    const timestamp =Date.now();
    const randomNumber =Math.random();
    const hexadecimalString=randomNumber.toString()

    return `id-${timestamp}-${hexadecimalString}`;
  }

  function chatrstripe(isAi,value,uniqueId){
    return(
        `
          <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
              <div class="profile">
                <img
                  src="${isAi ? bot : user}"
                  alt="${isAi ? 'bot' : 'user'}"
                />
              </div>
              <div class="massage" id="${uniqueId}">${value}</div>
            </div>
          </div>
        `
    )
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();

    const data = new FormData(form);

    //user's chatstripe
    chatContainer.innerHTML +=chatrstripe(false,data.get('prompt'));

    form.reset();

    //bot's stripe
    const uniqueId =generateUniqueId();
    chatContainer.innerHTML +=chatrstripe(true,"",uniqueId);

    // chatContainer.scrollTop =chatContainer.scrollHeight

    const messageDIV = document.getElementById(uniqueId)
    
    loader(messageDIV);

    //fetch data from server 

    const response = await fetch('http://localhost:5000',{
      method :'POST',
      handers:{
        'Content-Type' : 'applicaiton.json',
      },
        body: JSON.stringify({
          prompt:data.get('prompt')
        })
    })
    clearInterval(loadInterval)
    messageDIV.innerHTML=' '

    if(response.ok){
      const data =await response.json();
      const parseData =data.bot.trim()

      typeText(messageDIV,parseData)
  }else{
    const err = await response.text();

    messageDIV.innerHTML = 'something went worong';
    alert(err);
  }
  
  form.addEventListener('submit',handleSubmit);
  form.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
      handleSubmit(e)
    }
  })
}
