import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, query, doc, getDoc, getDocs, setDoc, updateDoc, where} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const ChatWindow = ( {activeUser, contactList} ) =>{

    const [inputValue, setInputValue ] = useState("");
    const [messages, setMessages] = useState([]); // Step 1: Track input value
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    //UseRef to create references to the geminiAI instance of class, for changes not bound to re-renders
    const chatRef = useRef(null);
    const historyRef = useRef([]);
    const messagesEndRef = useRef(null); // Referencia para el auto-scroll

    const updateFirestoreHistory = async () => {
        const MAX_HISTORY_LENGTH = 20;
        const newChatHistory = chatRef.current?.history || [];
      
        // Combinar lo que había con lo nuevo
        const combined = [...(historyRef.current || []), ...newChatHistory];
      
        // Opcional: quitar duplicados si Gemini repite los mensajes
        const deduped = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) =>
              JSON.stringify(t) === JSON.stringify(item)
            )
        );
        // Limitar a los últimos 20
        const limitedHistory = deduped.slice(-MAX_HISTORY_LENGTH);
        // Guardar y actualizar referencia
        historyRef.current = limitedHistory;
    
        const docRef = doc(db, "chatHistories", activeUser.id);
        await setDoc(docRef, { history: limitedHistory });
      };
    
    /*const saveHistoryToFirestore = async (userId, history) => {
        const MAX_HISTORY_LENGTH = 20;
        const trimmedHistory = history.slice(-MAX_HISTORY_LENGTH); // evita mutar el original
        const docRef = doc(db, "chatHistories", userId);
        await setDoc(docRef, { history: trimmedHistory });
    };*/

    const loadHistoryFromFirestore = async (userId) => {
        const docRef = doc(db, "chatHistories", userId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().history : [];
    };
    

    //create gemini conversation only once per active user, and set to useRef to allow changes without re-rendering
    useEffect( ()=>{

        let isMounted = true;

        const setupChat = async () => {
            const storedHistory = await loadHistoryFromFirestore(activeUser.id);
            if (!isMounted) return;

            chatRef.current = null; //clean the last history (other activeuser)
            historyRef.current = [];

            chatRef.current = ai.chats.create({
                model: "gemini-2.0-flash",
                history: [ ],   //needs to be updated after each message with push
                config: {
                    systemInstruction: 
                    `You are a person or entity I am chatting with, named ${activeUser.name} ${activeUser.lastName} and ${activeUser.description}`,
                    maxOutputTokens: 150,
                    temperature: 1.5,
                }
            });
            
            if (chatRef.current) {
                chatRef.current.history = storedHistory || [];
                console.log( storedHistory );
            };

            setMessages(chatRef.current.history);  //local messages to be retrieved history  
        }
        setupChat();

        const getConversation = async ()=>{
            const myQuery = query( collection(db, "conversations"), where("userId", "==", activeUser.id) );

            const conversationSnap = await getDocs(myQuery);
            const conversation = conversationSnap.docs.map( (doc=> doc.data() ) );
            //console.log(conversation);
            if (conversation[0]?.messages){
                setMessages(conversation[0].messages);
            }
        };
        getConversation();

        return () => {
            isMounted = false;
        };

    }, [activeUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    

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

    const submitMessage = async (senderId) => {
      if (!inputValue.trim()) return; // Prevent sending empty messages
  
      //manually submitted message with senderId "me"
      const newMessage = { senderId: senderId, text: inputValue, date: Date.now() };
      setMessages( (prev)=>[...prev, newMessage] );

      await saveMessageToFirestore(activeUser.id, newMessage); // 👈 Save it in firestore
      await askGemini(inputValue, activeUser.id); //NEW GEMINI FUNCTION 
      setInputValue(""); // Clear input after sending
    };

    const askGemini = async (newMessage, userId)=>{

        //update the history with proper format: user message
        //await historyRef.current.push({ role: "user", parts: [{ text: inputValue }] }); 

        const response = await chatRef.current.sendMessage({
            message: newMessage,
        });

        const newGeminiMessage = {
            text: response.text,
            senderId: userId, //gemini will handle several users
            date: Date.now()
        }

        //update the history with proper format: gemini response
        //await historyRef.current.push({ role: "model", parts: [ { text: response.text } ] }); /*not necessary*/

        //console.log(newGeminiMessage);
        setMessages( (prev)=>[...prev, newGeminiMessage] );

        await saveMessageToFirestore(userId, newGeminiMessage); // 👈 Save Gemini reply
        await updateFirestoreHistory();
    }

    // Formatear el teléfono en el formato XXX-XXX-XXXX
    const formatPhone = (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}-${match[2]}-${match[3]})`;
        }
        return phone;
    };

    return(
        <section className="flex flex-col flex-1 p-4 bg-white rounded-lg shadow-md">

            <div className="bg-blue-200 flex justify-between items-center border-b">
                <h1 className="text-xl font-bold text-gray-800 p-3">
                    {activeUser ? `Chat con ${activeUser.name} ${formatPhone(activeUser.phone)}` : "Elige un contacto" }
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
                <div ref={messagesEndRef} /> {/* Elemento de referencia para el scroll */}
            </div>
            
            <div className="flex items-center gap-2 border-t pt-2">
                {/* Emoji Picker */}
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <BsEmojiSmile size={20} />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0">
                            <EmojiPicker
                                onEmojiClick={(emojiObject) => {
                                    setInputValue((prevInput) => prevInput + emojiObject.emoji);
                                    setShowEmojiPicker(false);
                                }}
                                width={300}
                                height={400}
                            />
                        </div>
                    )}
                </div>
                {/* Input for chat*/}
                <input 
                    id="input"
                    type="text"
                    className="flex-1 p-2 border text-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Escribe acá`}
                    value={inputValue}
                    onChange={ (e) => setInputValue(e.target.value) }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputValue.trim()) {
                            submitMessage("me");
                        }
                    }}
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