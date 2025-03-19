import React from "react";
import { ContactCard } from "./contactCard";
import { BsPersonFillAdd } from "react-icons/bs";

export const ContactList = ({usersList, activeUser, setActiveUser} )=>{


    return(
        <div className="w-1/3 bg-gray-200 p-4 overflow-hidden">
            <div className="flex justify-between py-4">
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contactos</h2>
                <button className="bg-gray-300 p-1 rounded-md text-black hover:bg-gray-100 cursor-pointer active:-translate-y-1">
                    <BsPersonFillAdd />
                </button>
            </div>

            <div className="h-[75vh] overflow-y-auto">
                {usersList && usersList.map( (contact, index)=>
                    <ContactCard key={index} contact={contact} activeUser={activeUser} setActiveUser={setActiveUser}/>
                ) }
            </div>
        </div>
    )
}