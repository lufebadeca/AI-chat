import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, query, doc, getDoc, getDocs, setDoc, updateDoc, where} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const ChatWindow = ( {activeUser, contactList} ) =>{

    const [inputValue, setInputValue ] = useState("");
    const [messages, setMessages] = useState([]); // Step 1: Track input value

    const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "Hello" }],
          },
          {
            role: "model",
            parts: [{ text: "Great to meet you. What would you like to know?" }],
          },
        ],
        config: {
            systemInstruction: 
            `You are a person or entity I am chatting with, named ${activeUser.name} ${activeUser.lastName} and ${activeUser.description}`,
            maxOutputTokens: 150,
            temperature: 1.6,
        }
    });

    
    const saveMessageToFirestore = async (userId, newMessage) => {
        const conversationRef = doc(db, "conversations", userId);
        const docSnap = await getDoc(conversationRef);

        if (docSnap.exists()) {
            // Update existing conversation
            const existingData = docSnap.data();
            await updateDoc(conversationRef, {
                messages: [...existingData.messages, newMessage],
                lastMessage: newMessage.text,
                read: false, // You can adapt this depending on sender
            });
        } else {
            // Create a new conversation
            await setDoc(conversationRef, {
                userId: userId,
                messages: [newMessage],
                lastMessage: newMessage.text,
                read: false,
            });
        }
    };




    useEffect(()=>{
        setMessages([]);
        const getConversation = async ()=>{
            const myQuery = query( collection(db, "conversations"), where("userId", "==", activeUser.id) );

            const conversationSnap = await getDocs(myQuery);
            const conversation = conversationSnap.docs.map( (doc=> doc.data() ) );
            console.log(conversation);
            if (conversation[0]?.messages){
                setMessages(conversation[0].messages);
                /*
                const formattedMessages = conversation[0].messages.map(msg => ({
                    ...msg,
                    date: msg.date.toDate() // Convierte Firestore Timestamp a JavaScript Date
                }));
    
                setMessages(formattedMessages);*/
            }
        };
        getConversation();
    }, [activeUser])

    const submitMessage = async (senderId) => {
      if (!inputValue.trim()) return; // Prevent sending empty messages
  
      //manually submitted message with senderId "me"
      const newMessage = { senderId: senderId, text: inputValue, date: Date.now() };
      setMessages( (prev)=>[...prev, newMessage] );

      await saveMessageToFirestore(activeUser.id, newMessage); // 👈 Save it in firestore
      await askGemini(inputValue, activeUser.id); //NEW GEMINI FUNCTION 
      setInputValue(""); // Clear input after sending
    };

    const askGemini = async (inputValue, userId)=>{
        const response = await chat.sendMessage({
            message: inputValue,
        });

        //console.log("response", response.text);

        const newMessage = {
            text: response.text,
            senderId: userId, //gemini will handle several users
            date: Date.now()
        }
        console.log(newMessage);
        setMessages( (prev)=>[...prev, newMessage] );

        await saveMessageToFirestore(userId, newMessage); // 👈 Save Gemini reply
    }

    return(
        <section className="flex flex-col flex-1 p-4 bg-white rounded-lg shadow-md">

            <div className="bg-blue-200 flex justify-between items-center border-b">
                <h1 className="text-xl font-bold text-gray-800 p-3">
                    {activeUser ? `Chat con ${activeUser.name} (${activeUser.phone})` : "Elige un contacto" }
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
                    <section key={index} className={`p-2 rounded-lg w-3/4 ${msg.senderId === "me" ? 
                    "bg-blue-500 text-white self-end" : 
                    "bg-gray-200 text-gray-800 self-start"}`}
                    >
                        <span className="text-[11px] align-left">
                            {new Date(msg.date).toLocaleString()}
                        </span>
                        <p >
                            {msg.text}
                        </p>
                    </section>
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

                {/* <button 
                    className="px-4 py-2 text-white bg-gray-400 rounded-lg shadow-md transition duration-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={()=>submitMessage("you")}
                >
                    Reply
                </button> */}
            </div>
            
        </section>
    )
}