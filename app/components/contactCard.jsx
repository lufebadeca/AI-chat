import React, { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { doc, getDoc, onSnapshot  } from "firebase/firestore";
import { BsCheckAll, BsCheck } from "react-icons/bs";

export const ContactCard = ({contact, activeUser, setActiveUser})=>{

    // activeUser && console.log(activeUser.name, contact.name);

    const [lastMessage, setLastMessage] = useState("");
    const [isRead, setIsRead] = useState(true);

    // Obtener la inicial del apellido
    const getLastNameInitial = (lastName) => {
        return lastName ? `${lastName.charAt(0)}.` : '';
    };

    // Escuchar cambios en tiempo real del último mensaje
    useEffect(() => {
        const conversationRef = doc(db, "conversations", contact.id);
        
        // Configurar el listener en tiempo real
        const unsubscribe = onSnapshot(conversationRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setLastMessage(data.lastMessage || "");
                setIsRead(data.read ?? true);
            }
        });

        // Limpiar el listener cuando el componente se desmonte o cambie el contact.id
        return () => unsubscribe();
    }, [contact.id]);

    return(

        <article
            className={`max-w-sm p-2 m-1 flex justify-between rounded-lg shadow-md cursor-pointer 
                transition duration-300 hover:bg-blue-200 border border-gray-300
                ${activeUser?.id===contact.id ? "bg-blue-100" : "bg-white"}`} 
            onClick={ ()=>setActiveUser(contact) }
        >
            <div className="flex-1 mr-4 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-blue-400">
                            {contact.name} {getLastNameInitial(contact.lastName)}
                        </h2>
                        {lastMessage && (
                            <span className="text-blue-500">
                                {isRead ? <BsCheckAll size={20} /> : <BsCheck size={20} />}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                        {lastMessage || "No hay mensajes aún"}
                    </p>
                </div>
            </div>

            <figure className="flex-shrink-0">
                <img src={contact.image} alt="pic" className="w-12 h-12 rounded-full border-2 border-gray-300"/>
            </figure>

        </article>
    )
}