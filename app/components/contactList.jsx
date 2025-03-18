import React from "react";
import { ContactCard } from "./contactCard";

export const ContactList = ({usersList, activeUser, setActiveUser} )=>{

    return(
        <div className="w-1/3 bg-gray-200 p-4 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contactos</h2>
            <div className="h-[75vh] overflow-y-auto">
                {usersList && usersList.map( (contact, index)=>
                    <ContactCard key={index} contact={contact} activeUser={activeUser} setActiveUser={setActiveUser}/>
                ) }
            </div>
        </div>
    )
}