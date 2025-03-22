import React from "react";

export const ContactCard = ({contact, activeUser, setActiveUser})=>{

    activeUser && console.log(activeUser.name, contact.name);

    return(

        <article
            className={`max-w-sm p-2 flex justify-between border rounded-lg shadow-md cursor-pointer transition duration-300 hover:bg-gray-100 ${activeUser?.name===contact.name ? "bg-blue-300" : "bg-white"}`} 
            onClick={ ()=>setActiveUser(contact) }
        >
            <div>
                <h2 className="text-lg font-semibold text-blue-400">{contact.name}</h2>
                <p className="text-gray-600">{contact.lastName}</p>
                <p className="text-gray-600">{contact.phone}</p>
            </div>
            <figure className="rounded-full">
                <img src={contact.image} alt="pic" className="w-20 h-20 rounded-full border-3 border-gray-300"/>
            </figure>

        </article>
    )
}