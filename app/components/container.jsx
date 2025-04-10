import React from "react";
import { ContactList } from "./contactList";
import { ChatWindow } from "./chatWindow";

export const Container = ({usersList, setUsersList, activeUser, setActiveUser, handleAddUser}) =>{

    return(
        <div className="flex flex-row h-[90vh] w-full max-w-5xl mx-auto bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <ContactList usersList={usersList} setUsersList={setUsersList} activeUser={activeUser} setActiveUser={setActiveUser} ></ContactList>
            {activeUser ? 
                (<ChatWindow activeUser={activeUser} usersList={usersList}></ChatWindow>) : 
                (<p className="text-black flex items-center justify-center ml-auto mr-auto">No hay usuario seleccionado</p>)
            }
        </div>
    )
}