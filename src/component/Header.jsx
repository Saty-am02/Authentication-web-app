import React, { useEffect, useRef, useState, useContext } from 'react'; // Grouped React hooks
import { Icons } from '../assets/icons'; 
import { AppContext } from '../context/AppContext'; // <--- THIS WAS MISSING
import { Link, useNavigate } from 'react-router-dom'; // Add these if you plan to use navigation here too
// 1. Define the TextScramble class outside your component
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 80); // Speed: 80
      const end = start + Math.floor(Math.random() * 80);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="text-gray-400">${char}</span>`; // Changed dud class to Tailwind color
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const Header = () => {
  // 2. Create a reference to attach to your div
  const textRef = useRef(null);
  const {userData} = useContext(AppContext);
  console.log("Current User Data:", userData);

  // 3. Use an effect to run the animation ONLY after the component loads
  useEffect(() => {

    const phrases = [
      `Hey ${userData ? userData.name : 'there'}! Welcome to Authify.`,
      "Secure. Seamless. Authify.",
      "Begin your journey to better security." 
    ];

    const el = textRef.current;
    if (!el) return;

    const fx = new TextScramble(el);
    let counter = 0;
    let timeoutId; 

    const next = () => {
      fx.setText(phrases[counter]).then(() => {
        timeoutId = setTimeout(next, 2000);
      });
      counter = (counter + 1) % phrases.length;
    };

    next();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(fx.frameRequest);
    };
}, [userData]);

  const navigate = useNavigate(); 
  const { isLoggedIn, setIsLoggedIn } = useContext(AppContext);
  return (
    <div className='relative top-56 flex flex-col gap-10 items-center justify-center px-4'>
      <img src={Icons.header} alt="Header image" className='h-50 w-50 animation' />
      
      <span className='text-center'>
        
        <div className="container max-w-3xl">
          {/* 5. Attach the ref to this specific div */}
          <div 
            ref={textRef} 
            className="text-gray-800 font-mono text-2xl md:text-3xl font-light min-h-[100px]"
          ></div>
        </div>
      </span>

      {!isLoggedIn && (
        <div className="items-center justify-between hidden w-full md:flex md:w-auto mt-4">
          <button className="button flex border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-amber-50 rounded-lg transition-colors duration-300 px-6 py-2 font-medium" onClick={() => navigate('/login', { state: { createAccount: true } })}>
            <span className="text-lg">Get Started</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Header;