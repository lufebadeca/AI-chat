import React, { useState, useEffect } from "react";
import { ContactCard } from "./contactCard";
import { BsPersonFillAdd } from "react-icons/bs";
import { NewUserForm } from "./newUserForm";
import { doc, onSnapshot } from "firebase/firestore";

export const ContactList = ({usersList, activeUser, setActiveUser} )=>{

    const [newUserModal, setNewUserModal] = useState(false);

    return(
        <section className="w-1/3 bg-gray-200 p-4 overflow-hidden">

            {  newUserModal && <NewUserForm setModal={setNewUserModal}/> }

            <div className="flex justify-between items-center py-4">
                <h2 className="text-2xl font-semibold text-blue-400 flex items-center">Contactos</h2>
                <button
                    onClick={ ()=>setNewUserModal( !newUserModal ) } 
                    className="bg-blue-300 p-1 w-20 h-10 flex justify-center items-center rounded-md text-black hover:bg-blue-400 cursor-pointer active:-translate-y-0.5"
                >
                    <BsPersonFillAdd />
                </button>
            </div>

            <div className="h-[75vh] overflow-y-auto">
                {usersList && usersList.map( (contact, index)=>
                    <ContactCard key={index} contact={contact} activeUser={activeUser} setActiveUser={setActiveUser}/>
                ) }
            </div>
        </section>
    )
}