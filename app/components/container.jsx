import React from "react";
import { ContactList } from "./contactList";
import { ChatWindow } from "./chatWindow";

export const Container = ({usersList, activeUser, setActiveUser, handleAddUser}) =>{

    return(
        <div className="flex flex-row h-[90vh] w-full max-w-5xl mx-auto bg-gray-100 rounded-lg shadow-lg overflow-hidden">
            <ContactList usersList={usersList} setActiveUser={setActiveUser} handleAddUser={handleAddUser}></ContactList>
            <ChatWindow activeUser={activeUser} usersList={usersList}></ChatWindow>
        </div>
    )
}