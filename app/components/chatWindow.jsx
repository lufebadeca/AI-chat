import React from "react";
import { useState } from "react";
import Link from "next/link";


export const ChatWindow = ( {activeUser, contactList} ) =>{

    const [inputValue, setInputValue ] = useState("");
    const [messages, setMessages] = useState([]); // Step 1: Track input value

    const submitMessage = (sender) => {
      if (!inputValue.trim()) return; // Prevent sending empty messages
  
      const newMessage = { sender: sender, text: inputValue };
      setMessages( (prev)=>[...prev, newMessage] );
      setInputValue(""); // Clear input after sending
      console.log(messages);
    };

    return(
        <section className="flex flex-col flex-1 p-4 bg-white rounded-lg shadow-md">

            <div className="bg-blue-200 flex justify-between items-center border-b">
                <h1 className="text-xl font-bold text-gray-800 p-3">
                    {activeUser ? `Chat con ${activeUser.name} | ${activeUser.phone}` : "Elige un contacto" }
                </h1>

                {/* <Link
                className="bg-slate-200 m-2 p-2 text-sm rounded-md text-black cursor-pointer active:translate-y-0.5 hover:bg-slate-400"
                href={`/perfil?userId=${activeUser.id}`}
                >
                    Ver perfil
                </Link> */}

                <Link
                className="bg-slate-200 m-2 p-2 text-sm rounded-md text-black cursor-pointer active:translate-y-0.5 hover:bg-slate-400"
                href={`/perfil/${activeUser.id}`}
                >
                    Ver perfil
                </Link>
            </div>
            
            <div className="flex flex-1 flex-col py-4 text-gray-700 space-y-2 overflow-y-auto">
                { messages.length>=1 && messages?.map( (msg, index) => (
                    <p 
                    key={index} 
                    className={`p-2 rounded-lg w-3/4 ${msg.sender === "me" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-800 self-start"}`}
                    >
                    {msg.text}
                    </p>
                ))}
            </div>
            
            <div className="flex items-center gap-2 border-t pt-2">
                <input 
                    id="input"
                    type="text"
                    className="flex-1 p-2 border text-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Escribe acá`}
                    value={inputValue}
                    onChange={ (e) => setInputValue(e.target.value) }
                    />
                <button 
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg shadow-md transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={()=>submitMessage("me")}
                >
                    Send
                </button>

                <button 
                    className="px-4 py-2 text-white bg-gray-400 rounded-lg shadow-md transition duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={()=>submitMessage("you")}
                >
                    Reply
                </button>
            </div>
            
        </section>
    )
}