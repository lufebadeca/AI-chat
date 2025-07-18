import React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';
import { toast } from 'react-hot-toast';

import { db } from "@/firebaseConfig";  //connect with configFirebase file
import {collection, query, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, where} from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export const ChatWindow = ( {activeUser, contactList} ) =>{

    const [inputValue, setInputValue ] = useState("");
    const [messages, setMessages] = useState([]); // Step 1: Track input value
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [loader, setLoader] = useState(false);

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

    const handleDeleteConversation = async () => {
        if (!activeUser) return;
        
        // Confirmar antes de eliminar
        if (!window.confirm(`¿Estás seguro de eliminar toda la conversación con ${activeUser.name}?`)) {
            return;
        }

        try {
            // Eliminar la conversación
            await deleteDoc(doc(db, "conversations", activeUser.id));
            // Eliminar el historial de chat
            await deleteDoc(doc(db, "chatHistories", activeUser.id));
            // Limpiar mensajes locales
            setMessages([]);
            toast.success("Conversación eliminada correctamente");
        } catch (error) {
            console.error("Error al eliminar la conversación:", error);
            toast.error("Error al eliminar la conversación");
        }
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
      setInputValue(""); // Clear input after sending
      setMessages( (prev)=>[...prev, newMessage] );

      await saveMessageToFirestore(activeUser.id, newMessage); // 👈 Save it in firestore
      setLoader(true);
      await askGemini(newMessage.text, activeUser.id); //NEW GEMINI FUNCTION 
      setLoader(false);
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

<div className="bg-blue-200 flex justify-between items-center border-b p-3">
                {activeUser ? (
                    <>
                        <div className="flex items-center gap-3">
                            <img 
                                src={activeUser.image || "https://static.vecteezy.com/system/resources/previews/026/631/445/non_2x/add-photo-icon-symbol-design-illustration-vector.jpg"} 
                                alt={`${activeUser.name}'s profile`}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                            />
                            <h1 className="text-xl font-bold text-gray-800">
                                Chat con {activeUser.name} {formatPhone(activeUser.phone)}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDeleteConversation}
                                className="bg-red-200 p-2 text-sm rounded-md text-black cursor-pointer active:translate-y-0.5 hover:bg-red-300 flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Eliminar chat
                            </button>
                            <Link
                                className="bg-slate-200 p-2 text-sm rounded-md text-black cursor-pointer active:translate-y-0.5 hover:bg-slate-300"
                                href={`/perfil/${activeUser.id}`}
                            >
                                Ver perfil
                            </Link>
                        </div>
                    </>
                ) : (
                    <h1 className="text-xl font-bold text-gray-800">
                        Elige un contacto
                    </h1>
                )}
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
                {loader && <p className="pb-6">Escribiendo...</p>}
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

            </div>
            
        </section>
    )
}