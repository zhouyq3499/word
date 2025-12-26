export function pronounceWord(word){
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    speechSynthesis.speak(u)
  }else{
    new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`).play()
  }
}